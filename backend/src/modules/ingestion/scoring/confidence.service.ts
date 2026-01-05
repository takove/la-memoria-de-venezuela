import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StgNode, StgEdge } from "../../../entities";

export enum ConfidenceLevel {
  RUMOR = 1,        // Unverified social media, single source
  UNVERIFIED = 2,   // Multiple social media, blogs
  CREDIBLE = 3,     // Reputable journalism, verified sources
  VERIFIED = 4,     // Multiple reputable sources, official statements
  OFFICIAL = 5,     // OFAC, DOJ, ICC, official government documents
}

export interface ConfidenceScore {
  overall: number;        // 1-5 final score
  components: {
    sourceReliability: number;   // 1-5 based on article source
    extractionQuality: number;   // 1-5 based on NER confidence
    matchQuality: number;        // 1-5 based on Tier1 match type
    evidenceStrength: number;    // 1-5 based on # of mentions
  };
  reasoning: string;      // Human-readable explanation
}

@Injectable()
export class ConfidenceService {
  private readonly logger = new Logger(ConfidenceService.name);

  constructor(
    @InjectRepository(StgNode)
    private nodesRepository: Repository<StgNode>,
    @InjectRepository(StgEdge)
    private edgesRepository: Repository<StgEdge>,
  ) {}

  /**
   * Calculate confidence score for a node based on various factors.
   */
  async scoreNode(nodeId: string): Promise<ConfidenceScore> {
    const node = await this.nodesRepository.findOne({
      where: { id: nodeId },
      relations: ["tier1"],
    });

    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // Component scores (1-5 scale)
    const sourceReliability = this.scoreSourceReliability(node);
    const extractionQuality = this.scoreExtractionQuality(node);
    const matchQuality = this.scoreMatchQuality(node);
    const evidenceStrength = await this.scoreEvidenceStrength(node);

    // Weighted average (source + match are most important)
    const weights = {
      sourceReliability: 0.35,
      extractionQuality: 0.15,
      matchQuality: 0.35,
      evidenceStrength: 0.15,
    };

    const overall = Math.round(
      sourceReliability * weights.sourceReliability +
      extractionQuality * weights.extractionQuality +
      matchQuality * weights.matchQuality +
      evidenceStrength * weights.evidenceStrength,
    );

    const reasoning = this.buildReasoning(
      sourceReliability,
      extractionQuality,
      matchQuality,
      evidenceStrength,
      node.tier1 !== null,
    );

    return {
      overall: Math.min(Math.max(overall, 1), 5) as ConfidenceLevel,
      components: {
        sourceReliability,
        extractionQuality,
        matchQuality,
        evidenceStrength,
      },
      reasoning,
    };
  }

  /**
   * Score source reliability based on article metadata.
   * TODO: Implement based on article source (OFAC, DOJ, reputable news, etc.)
   */
  private scoreSourceReliability(node: StgNode): number {
    // Placeholder: default to credible news source
    // In production, check article.source and map to confidence levels
    return ConfidenceLevel.CREDIBLE;
  }

  /**
   * Score extraction quality based on NER confidence.
   * TODO: Store NER confidence in StgEntity and aggregate here
   */
  private scoreExtractionQuality(node: StgNode): number {
    // Placeholder: assume good NER quality if name is capitalized
    if (node.canonicalName.length > 2 && /^[A-Z]/.test(node.canonicalName)) {
      return ConfidenceLevel.CREDIBLE;
    }
    return ConfidenceLevel.UNVERIFIED;
  }

  /**
   * Score match quality based on Tier1 match type.
   */
  private scoreMatchQuality(node: StgNode): number {
    if (node.tier1) {
      // Exact match to OFAC/ICC Tier1 official
      return ConfidenceLevel.OFFICIAL;
    }
    // No Tier1 match
    return ConfidenceLevel.UNVERIFIED;
  }

  /**
   * Score evidence strength based on number of mentions.
   */
  private async scoreEvidenceStrength(node: StgNode): Promise<number> {
    const mentionCount = (node.altNames?.length || 0) + 1; // +1 for canonical name
    
    if (mentionCount >= 10) return ConfidenceLevel.OFFICIAL;
    if (mentionCount >= 5) return ConfidenceLevel.VERIFIED;
    if (mentionCount >= 3) return ConfidenceLevel.CREDIBLE;
    if (mentionCount >= 2) return ConfidenceLevel.UNVERIFIED;
    return ConfidenceLevel.RUMOR;
  }

  /**
   * Build human-readable reasoning for the score.
   */
  private buildReasoning(
    source: number,
    extraction: number,
    match: number,
    evidence: number,
    hasTier1: boolean,
  ): string {
    const parts: string[] = [];

    if (hasTier1) {
      parts.push("Matched to verified Tier1 official (OFAC/ICC)");
    } else {
      parts.push("No Tier1 match");
    }

    if (source >= ConfidenceLevel.VERIFIED) {
      parts.push("from official source");
    } else if (source >= ConfidenceLevel.CREDIBLE) {
      parts.push("from reputable news source");
    } else {
      parts.push("from unverified source");
    }

    if (evidence >= ConfidenceLevel.VERIFIED) {
      parts.push("with strong evidence (multiple mentions)");
    } else if (evidence >= ConfidenceLevel.CREDIBLE) {
      parts.push("with moderate evidence");
    } else {
      parts.push("with limited evidence");
    }

    return parts.join(", ");
  }

  /**
   * Calculate confidence score for an edge (relationship).
   */
  async scoreEdge(edgeId: string): Promise<ConfidenceScore> {
    const edge = await this.edgesRepository.findOne({
      where: { id: edgeId },
      relations: ["srcNode", "dstNode"],
    });

    if (!edge) {
      throw new Error(`Edge ${edgeId} not found`);
    }

    // For edges, confidence is based on:
    // 1. Weight from relation extraction
    // 2. Confidence of source and destination nodes
    const srcScore = await this.scoreNode(edge.srcNode.id);
    const dstScore = await this.scoreNode(edge.dstNode.id);

    // Use lowest node confidence (chain is as weak as weakest link)
    const nodeConfidence = Math.min(srcScore.overall, dstScore.overall);
    
    // Weight from relation extraction (0-1 scale)
    const relationWeight = edge.weight || 0.5;
    const relationConfidence = Math.ceil(relationWeight * 5);

    // Final edge confidence: average of node confidence and relation confidence
    const overall = Math.round((nodeConfidence + relationConfidence) / 2);

    return {
      overall: Math.min(Math.max(overall, 1), 5) as ConfidenceLevel,
      components: {
        sourceReliability: srcScore.components.sourceReliability,
        extractionQuality: relationConfidence,
        matchQuality: nodeConfidence,
        evidenceStrength: Math.min(srcScore.components.evidenceStrength, dstScore.components.evidenceStrength),
      },
      reasoning: `Relationship between ${edge.srcNode.canonicalName} and ${edge.dstNode.canonicalName} with ${(relationWeight * 100).toFixed(0)}% extraction confidence`,
    };
  }
}
