import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StgEntity } from "../../../entities";
import { DedupService } from "./dedup.service";
import { LlmCuratorService } from "./llm-curator.service";
import { Tier1MatchService, Tier1Match } from "../tier1/tier1-match.service";

export enum ReviewQueueStatus {
  PENDING = "pending",      // Awaiting human review
  APPROVED = "approved",    // Curator approved
  REJECTED = "rejected",    // Curator rejected (won't be added to graph)
  MERGED = "merged",        // Merged into another entity
  AUTO_APPROVED = "auto_approved", // Auto-approved (high confidence)
}

export interface ReviewQueueItem {
  entityId: string;
  entity: StgEntity;
  status: ReviewQueueStatus;
  issues: string[];
  duplicates: Array<{ entityId: string; similarity: number }>;
  tier1Match?: Tier1Match; // Match from OFAC/sanctions lists
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Review queue for entities that need human verification before graph ingestion.
 * Follows Wikidata editorial workflow patterns.
 */
@Injectable()
export class ReviewQueueService {
  private readonly logger = new Logger(ReviewQueueService.name);

  // In-memory queue (in production: use PostgreSQL table)
  private reviewQueue = new Map<string, ReviewQueueItem>();

  constructor(
    @InjectRepository(StgEntity)
    private entitiesRepository: Repository<StgEntity>,
    private dedupService: DedupService,
    private llmCurator: LlmCuratorService,
    private tier1MatchService: Tier1MatchService,
  ) {}

  /**
   * Add entity to review queue if it has quality issues.
   */
  async enqueueForReview(entity: StgEntity): Promise<ReviewQueueItem | null> {
    // Check for quality issues
    const { shouldReview, issues } = this.dedupService.flagForReview(entity);

    // Check for Tier 1 match (sanctions lists)
    let tier1Match: Tier1Match | null = null;
    try {
      // Map StgEntityType to Tier1 entity type
      const tier1EntityType = entity.type === 'PERSON' ? 'PERSON' : 'ORGANIZATION';
      
      tier1Match = await this.tier1MatchService.matchTier1(
        entity.rawText,
        tier1EntityType,
      );
      
      if (tier1Match) {
        this.logger.log(
          `[Tier 1] Match found: "${entity.rawText}" → "${tier1Match.official.fullName}" (${tier1Match.score}%)`,
        );
        
        // High confidence Tier 1 match (>95%) = Auto-approve
        if (tier1Match.score >= 95) {
          return this.createAutoApprovedItemWithTier1(entity, tier1Match);
        }
      }
    } catch (error) {
      this.logger.error(`Tier 1 matching failed: ${error.message}`);
    }

    if (!shouldReview && !tier1Match) {
      // Auto-approve high-confidence entities without matches
      return this.createAutoApprovedItem(entity);
    }

    // Find potential duplicates
    const duplicates = await this.dedupService.findDuplicates(entity, 0.85);

    const item: ReviewQueueItem = {
      entityId: entity.id,
      entity,
      status: ReviewQueueStatus.PENDING,
      issues,
      duplicates: duplicates.map((d) => ({
        entityId: d.entityIds[1], // The matched entity
        similarity: d.similarity,
      })),
      tier1Match: tier1Match || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reviewQueue.set(entity.id, item);
    this.logger.log(
      `Queued entity for review: "${entity.rawText}" (${issues.length} issues, ${duplicates.length} potential duplicates, tier1Match: ${!!tier1Match})`,
    );

    // Run LLM curator review asynchronously (non-blocking)
    this.runLlmReview(entity, item).catch((error) => {
      this.logger.error(
        `LLM review failed for ${entity.id}: ${error.message}`,
      );
    });

    return item;
  }

  /**
   * Run LLM curator review in background
   * Updates queue item with LLM recommendations
   */
  private async runLlmReview(
    entity: StgEntity,
    queueItem: ReviewQueueItem,
  ): Promise<void> {
    this.logger.debug(`[LLM] Starting review for "${entity.rawText}"`);

    // Build enhanced context with Tier 1 match info
    let articleContext = `${entity.rawText} from article context`;
    
    if (queueItem.tier1Match) {
      const match = queueItem.tier1Match;
      articleContext = `
**Entity:** ${entity.rawText}

**Tier 1 Match Found:**
- Matched official: ${match.official.fullName}
- Match score: ${match.score}% (${match.matchType} match)
- Matched on: ${match.matchedOn}
- Sanctions programs: ${match.official.sanctionsPrograms.join(', ')}
- Aliases: ${match.official.aliases.join(', ')}
- Source: ${match.official.source}
- Notes: ${match.official.notes || 'N/A'}

Does this entity match the sanctioned official? Consider:
1. Name variations (full name vs alias)
2. Context of the article
3. Potential false positives (common names, different people)
`.trim();
    }

    // TODO: Get article context and confidence score
    // For now, use entity data only
    const review = await this.llmCurator.reviewEntity(
      entity,
      3, // Placeholder confidence score
      articleContext,
    );

    // Store LLM recommendation in queue item
    (queueItem as any).llmRecommendation = {
      recommendation: review.recommendation,
      confidence: review.confidence,
      explanation: review.explanation,
      suggestedCategory: review.suggestedCategory,
      issues: review.potentialDuplicates,
    };

    // If LLM says "APPROVE" with high confidence (>0.85), auto-approve
    // Also auto-approve if Tier 1 match + LLM approval
    if (
      review.recommendation === 'approve' &&
      review.confidence > 0.85 &&
      queueItem.status === ReviewQueueStatus.PENDING
    ) {
      this.logger.log(
        `[LLM] Auto-approving "${entity.rawText}" (confidence: ${review.confidence}, tier1: ${!!queueItem.tier1Match})`,
      );
      await this.approveEntity(entity.id, 'llm-curator', review.explanation);
    }

    // If LLM says "INVESTIGATE", add to issues
    if (review.recommendation === 'investigate') {
      queueItem.issues.push(
        `LLM Alert: ${review.explanation}`,
      );
    }

    this.reviewQueue.set(entity.id, queueItem);
  }

  /**
   * Get all pending review items.
   */
  getPendingItems(): ReviewQueueItem[] {
    return Array.from(this.reviewQueue.values()).filter(
      (item) => item.status === ReviewQueueStatus.PENDING,
    );
  }

  /**
   * Get pending items with specific issues.
   */
  getPendingByIssue(issueKeyword: string): ReviewQueueItem[] {
    return this.getPendingItems().filter((item) =>
      item.issues.some((issue) => issue.includes(issueKeyword)),
    );
  }

  /**
   * Curator approves an entity.
   */
  async approveEntity(
    entityId: string,
    curatorId: string,
    notes?: string,
  ): Promise<ReviewQueueItem> {
    const item = this.reviewQueue.get(entityId);
    if (!item) throw new Error(`Entity ${entityId} not in review queue`);

    item.status = ReviewQueueStatus.APPROVED;
    item.approvedBy = curatorId;
    item.approvedAt = new Date();
    item.notes = notes;
    item.updatedAt = new Date();

    this.logger.log(
      `Entity approved: "${item.entity.rawText}" by curator ${curatorId}`,
    );
    return item;
  }

  /**
   * Curator rejects an entity (won't be added to graph).
   */
  async rejectEntity(
    entityId: string,
    curatorId: string,
    reason: string,
  ): Promise<ReviewQueueItem> {
    const item = this.reviewQueue.get(entityId);
    if (!item) throw new Error(`Entity ${entityId} not in review queue`);

    item.status = ReviewQueueStatus.REJECTED;
    item.approvedBy = curatorId;
    item.approvedAt = new Date();
    item.notes = `Rejected: ${reason}`;
    item.updatedAt = new Date();

    this.logger.log(
      `Entity rejected: "${item.entity.rawText}" by curator ${curatorId}. Reason: ${reason}`,
    );
    return item;
  }

  /**
   * Curator merges duplicate entities.
   */
  async mergeDuplicates(
    primaryId: string,
    duplicateIds: string[],
    curatorId: string,
  ): Promise<ReviewQueueItem> {
    const item = this.reviewQueue.get(primaryId);
    if (!item) throw new Error(`Entity ${primaryId} not in review queue`);

    for (const dupId of duplicateIds) {
      const dupItem = this.reviewQueue.get(dupId);
      if (dupItem) {
        dupItem.status = ReviewQueueStatus.MERGED;
        dupItem.updatedAt = new Date();
      }

      await this.dedupService.mergeEntities(primaryId, dupId);
    }

    item.status = ReviewQueueStatus.APPROVED;
    item.approvedBy = curatorId;
    item.approvedAt = new Date();
    item.notes = `Merged ${duplicateIds.length} duplicate(s) into this entity`;
    item.updatedAt = new Date();

    this.logger.log(
      `Merged ${duplicateIds.length} duplicates into ${item.entity.rawText} by curator ${curatorId}`,
    );
    return item;
  }

  /**
   * Get queue statistics.
   */
  getQueueStats() {
    const items = Array.from(this.reviewQueue.values());
    return {
      total: items.length,
      pending: items.filter((i) => i.status === ReviewQueueStatus.PENDING).length,
      approved: items.filter((i) => i.status === ReviewQueueStatus.APPROVED).length,
      rejected: items.filter((i) => i.status === ReviewQueueStatus.REJECTED).length,
      merged: items.filter((i) => i.status === ReviewQueueStatus.MERGED).length,
      autoApproved: items.filter((i) => i.status === ReviewQueueStatus.AUTO_APPROVED).length,
      topIssues: this.getTopIssues(items),
    };
  }

  /**
   * Get most common issues.
   */
  private getTopIssues(items: ReviewQueueItem[]): Array<{ issue: string; count: number }> {
    const issueCounts = new Map<string, number>();

    for (const item of items) {
      for (const issue of item.issues) {
        // Simplify issue for grouping
        const category = issue.split(":")[0];
        issueCounts.set(category, (issueCounts.get(category) || 0) + 1);
      }
    }

    return Array.from(issueCounts.entries())
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Clear the entire queue (for testing).
   */
  clearQueue() {
    this.reviewQueue.clear();
    this.logger.log("Review queue cleared");
  }

  /**
   * Private: Create auto-approved item for high-confidence entities.
   */
  private createAutoApprovedItem(entity: StgEntity): ReviewQueueItem {
    const item: ReviewQueueItem = {
      entityId: entity.id,
      entity,
      status: ReviewQueueStatus.AUTO_APPROVED,
      issues: [],
      duplicates: [],
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reviewQueue.set(entity.id, item);
    this.logger.debug(`Auto-approved high-confidence entity: "${entity.rawText}"`);
    return item;
  }

  /**
   * Private: Create auto-approved item for Tier 1 matched entities.
   */
  private createAutoApprovedItemWithTier1(entity: StgEntity, tier1Match: Tier1Match): ReviewQueueItem {
    const item: ReviewQueueItem = {
      entityId: entity.id,
      entity,
      status: ReviewQueueStatus.AUTO_APPROVED,
      issues: [],
      duplicates: [],
      tier1Match,
      approvedBy: 'tier1-auto-match',
      approvedAt: new Date(),
      notes: `Auto-approved via Tier 1 match: ${tier1Match.official.fullName} (${tier1Match.score}% ${tier1Match.matchType})`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reviewQueue.set(entity.id, item);
    this.logger.log(
      `[Tier 1 Auto-Approve] "${entity.rawText}" → "${tier1Match.official.fullName}" (${tier1Match.score}%)`,
    );
    return item;
  }
}
