import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StgEntity } from 'src/entities';
import { IngestionOrchestrator } from './ingestion.orchestrator';
import { ReviewQueueService } from './dedup/review-queue.service';
import { ArticlesService } from './fetcher/articles.service';

interface IngestionJobData {
  title: string;
  sourceUrl: string;
  content: string;
  language?: string;
  source?: string;
}

/**
 * Ingestion Queue Processor
 *
 * Handles BullMQ jobs for article ingestion:
 * 1. Fetches RSS articles or manual submissions from queue
 * 2. Runs full NER + entity extraction pipeline
 * 3. Applies confidence scoring
 * 4. Detects duplicates
 * 5. Queues for curator review
 * 6. Waits for approval before committing to graph
 *
 * This processor runs continuously and processes jobs as they arrive.
 */
@Processor('ingestion')
@Injectable()
export class IngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestionProcessor.name);

  constructor(
    @InjectQueue('ingestion') private ingestionQueue: Queue,
    @InjectRepository(StgEntity)
    private entitiesRepository: Repository<StgEntity>,
    private orchestrator: IngestionOrchestrator,
    private reviewQueueService: ReviewQueueService,
    private articlesService: ArticlesService,
  ) {
    super();
  }

  /**
   * Process a single article ingestion job
   *
   * Flow:
   * 1. Create article record in staging
   * 2. Run NER pipeline (name extraction, entity categorization)
   * 3. Score confidence levels (1-5 scale)
   * 4. Detect duplicate entities
   * 5. Queue entities for curator review
   * 6. Return job result with stats
   *
   * @param job BullMQ job with article data
   */
  async process(job: Job<IngestionJobData>) {
    const startTime = Date.now();
    this.logger.log(
      `[QUEUE] Processing job #${job.id}: "${job.data.title}" from ${job.data.source}`,
    );

    try {
      // Step 1: Create article record in staging (reuse service to keep dedup logic consistent)
      const article = await this.articlesService.ingestArticle({
        outlet: job.data.source || 'Unknown',
        title: job.data.title,
        url: job.data.sourceUrl,
        lang: job.data.language || 'es',
        rawHtml: job.data.content,
        cleanText: job.data.content,
      });

      this.logger.debug(`[QUEUE] Created article record: ${article.id}`);

      // Step 2-4: Run full orchestrator pipeline (NER → scoring → dedup)
      const results = await this.orchestrator.processPipeline(1);
      if (results.length === 0) {
        throw new Error('No results returned from orchestrator');
      }

      const result = results[0];

      this.logger.log(
        `[QUEUE] Pipeline complete for job #${job.id}:` +
          `  Entities: ${result.entityCount}` +
          `  Nodes: ${result.nodesCreated}` +
          `  Edges: ${result.edgesCreated}`,
      );

      // Step 5: Queue new entities for curator review
      let entitiesQueuedForReview = 0;
      if (result.entityCount > 0) {
        const newEntities = await this.entitiesRepository.find({
          where: { article: { id: article.id } },
        });

        for (const entity of newEntities) {
          // Queue for curator review
          await this.reviewQueueService.enqueueForReview(entity);
          entitiesQueuedForReview++;
        }
      }

      const duration = Date.now() - startTime;

      // Return job completion stats
      return {
        jobId: job.id,
        articleId: article.id,
        title: job.data.title,
        duration: `${(duration / 1000).toFixed(2)}s`,
        entities: result.entityCount,
        nodes: result.nodesCreated,
        edges: result.edgesCreated,
        tier1Match: result.tier1Match,
        entitiesQueuedForReview,
        status: 'completed',
      };
    } catch (error) {
      this.logger.error(
        `[QUEUE] Job #${job.id} failed: ${error.message}`,
        error.stack,
      );

      // Move job to failed queue with error details
      throw new Error(
        `Ingestion failed: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
