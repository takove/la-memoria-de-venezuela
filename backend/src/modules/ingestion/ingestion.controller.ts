import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { IngestionOrchestrator } from "./ingestion.orchestrator";
import { ArticlesService } from "./fetcher/articles.service";
import { ArticleIngestDto } from "./fetcher/articles.service";
import { ConfidenceService } from "./scoring/confidence.service";
import { ReviewQueueService } from "./dedup/review-queue.service";
import { DedupService } from "./dedup/dedup.service";
import { LlmCuratorService } from "./dedup/llm-curator.service";
import { RssService } from "./rss.service";
import { SAMPLE_ARTICLES } from "./sample-data";

@ApiTags("ingestion")
@Controller("ingestion")
export class IngestionController {
  private readonly logger = new Logger(IngestionController.name);

  constructor(
    private orchestrator: IngestionOrchestrator,
    private articlesService: ArticlesService,
    private confidenceService: ConfidenceService,
    private reviewQueueService: ReviewQueueService,
    private dedupService: DedupService,
    private llmCurator: LlmCuratorService,
    private rssService: RssService,
  ) {}

  @Post("articles")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Ingest a single article into staging" })
  @ApiResponse({
    status: 201,
    description: "Article ingested",
    schema: { example: { id: "uuid", url: "https://...", outlet: "armando.info" } },
  })
  async ingestArticle(@Body() dto: ArticleIngestDto) {
    return this.articlesService.ingestArticle(dto);
  }

  @Post("process")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Run full ingestion pipeline on unprocessed articles",
  })
  @ApiResponse({
    status: 200,
    description: "Pipeline execution results",
    schema: {
      type: 'array',
      example: [{
        articleId: "uuid-123",
        articleTitle: "Shell Company Article",
        entityCount: 5,
        relationCount: 3,
        tier1Match: true,
        errors: [],
      }],
    },
  })
  async runPipeline() {
    this.logger.log("Starting ingestion pipeline...");
    const results = await this.orchestrator.processPipeline(10);
    this.logger.log(
      `Pipeline completed: ${results.length} articles processed, ${results.filter((r) => !r.errors.length).length} successful`,
    );
    return results;
  }

  @Get("health")
  @ApiOperation({ summary: "Health check for ingestion pipeline" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  health() {
    return { status: "ok", message: "Ingestion service is running" };
  }

  @Post("webhook/article")
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: "Webhook endpoint for manual article submission",
    description:
      "Accept article submissions and queue them for automated processing. " +
      "Articles go through NER extraction, confidence scoring, deduplication detection, " +
      "and curator review before being added to the graph.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Article headline/title",
          example: "Venezuelan Official Sanctioned by OFAC",
        },
        sourceUrl: {
          type: "string",
          description: "URL where article is published",
          example: "https://example.com/article-123",
        },
        content: {
          type: "string",
          description: "Full article body text (HTML or plain text)",
          example: "Nicolas Maduro appointed Luis Salas as...",
        },
        language: {
          type: "string",
          enum: ["es", "en"],
          description: "Article language (Spanish or English)",
          example: "es",
        },
        source: {
          type: "string",
          description: "Publication name or organization",
          example: "Armando.info",
        },
      },
      required: ["title", "sourceUrl", "content"],
    },
  })
  @ApiResponse({
    status: 202,
    description:
      "Article accepted for processing. Returns job ID to track progress.",
    schema: {
      example: {
        jobId: "12345",
        title: "Venezuelan Official Sanctioned by OFAC",
        status: "queued",
        message:
          "Article queued for ingestion. Check job status with /ingestion/webhook/status/12345",
      },
    },
  })
  async submitArticleWebhook(
    @Body()
    body: {
      title: string;
      sourceUrl: string;
      content: string;
      language?: string;
      source?: string;
    },
  ) {
    if (!body.title || !body.sourceUrl || !body.content) {
      throw new BadRequestException(
        "title, sourceUrl, and content are required",
      );
    }

    const jobId = await this.rssService.enqueueArticle({
      title: body.title,
      sourceUrl: body.sourceUrl,
      content: body.content,
      language: body.language || "es",
      source: body.source || "Manual Submission",
    });

    return {
      jobId,
      title: body.title,
      status: "queued",
      message: `Article queued for ingestion. Track progress with /ingestion/webhook/status/${jobId}`,
    };
  }

  @Post("webhook/poll")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Manually trigger RSS feed polling cycle",
    description:
      "Force an immediate check of all configured RSS feeds instead of waiting for the scheduled 15-minute cycle. " +
      "Useful for testing or urgent content ingestion.",
  })
  @ApiResponse({
    status: 200,
    description: "Feed poll cycle completed",
    schema: {
      example: {
        status: "completed",
        checked: 3,
        newArticles: 5,
        errors: 0,
        message: "RSS poll complete: 3 feeds checked, 5 new articles queued",
      },
    },
  })
  async manualPollFeeds() {
    this.logger.log("[MANUAL] Manual feed poll triggered via webhook");
    await this.rssService.pollFeeds();
    return {
      status: "completed",
      message:
        "RSS feed poll cycle triggered. Check /ingestion/review-queue for queued items",
    };
  }

  @Post("sample")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Ingest sample Venezuelan articles for testing/demo",
  })
  @ApiResponse({
    status: 200,
    description: "Sample articles ingested and pipeline executed",
    schema: {
      example: {
        message: "Sample data processing complete",
        articlesIngested: 8,
        pipelineResults: [],
        summary: {
          totalProcessed: 8,
          successful: 8,
          withErrors: 0,
          totalEntitiesExtracted: 42,
          totalRelationsExtracted: 28,
          tier1Matches: 4,
        },
      },
    },
  })
  async ingestSampleData() {
    try {
      this.logger.log(`Ingesting ${SAMPLE_ARTICLES.length} sample articles...`);

      const ingestedArticles = [];
      for (const article of SAMPLE_ARTICLES) {
        try {
          const ingested = await this.articlesService.ingestArticle(article);
          ingestedArticles.push(ingested);
          this.logger.debug(`Ingested: ${article.title}`);
        } catch (error) {
          this.logger.error(`Failed to ingest ${article.title}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      this.logger.log(`Running pipeline on ${ingestedArticles.length} articles...`);
      const pipelineResults = await this.orchestrator.processPipeline(50);

      return {
        message: "Sample data processing complete",
        articlesIngested: ingestedArticles.length,
        pipelineResults,
        summary: {
          totalProcessed: pipelineResults.length,
          successful: pipelineResults.filter((r) => r.errors.length === 0).length,
          withErrors: pipelineResults.filter((r) => r.errors.length > 0).length,
          totalEntitiesExtracted: pipelineResults.reduce((sum, r) => sum + r.entityCount, 0),
          totalRelationsExtracted: pipelineResults.reduce((sum, r) => sum + r.relationCount, 0),
          tier1Matches: pipelineResults.filter((r) => r.tier1Match).length,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Sample data endpoint error: ${message}`);
      throw new InternalServerErrorException({
        message: "Sample data processing failed",
        error: message,
      });
    }
  }

  @Get("nodes/:nodeId/confidence")
  @ApiOperation({ summary: "Get confidence score for a node (entity)" })
  @ApiParam({ name: "nodeId", type: "string", description: "Node UUID" })
  @ApiResponse({
    status: 200,
    description: "Confidence score calculated",
    schema: {
      example: {
        overall: 4,
        components: {
          sourceReliability: 3,
          extractionQuality: 4,
          matchQuality: 5,
          evidenceStrength: 3,
        },
        reasoning: "Matched to verified Tier1 official (OFAC/ICC), from reputable news source, with moderate evidence",
      },
    },
  })
  async getNodeConfidence(@Param("nodeId") nodeId: string) {
    return this.confidenceService.scoreNode(nodeId);
  }

  @Get("edges/:edgeId/confidence")
  @ApiOperation({ summary: "Get confidence score for an edge (relationship)" })
  @ApiParam({ name: "edgeId", type: "string", description: "Edge UUID" })
  @ApiResponse({
    status: 200,
    description: "Confidence score calculated",
    schema: {
      example: {
        overall: 3,
        components: {
          sourceReliability: 3,
          extractionQuality: 3,
          matchQuality: 3,
          evidenceStrength: 2,
        },
        reasoning: "Relationship between MEXICO and BRASIL with 60% extraction confidence",
      },
    },
  })
  async getEdgeConfidence(@Param("edgeId") edgeId: string) {
    return this.confidenceService.scoreEdge(edgeId);
  }

  @Get("review-queue")
  @ApiOperation({ summary: "Get review queue for entities needing validation" })
  @ApiResponse({
    status: 200,
    description: "List of pending entities for human review",
    schema: {
      example: {
        pending: [
          {
            entityId: "uuid-123",
            entity: { id: "uuid-123", rawText: "UTILIZ", normText: "UTILIZ", type: "PERSON" },
            status: "pending",
            issues: ["Likely not a person name: \"UTILIZ\" detected as PERSON (NER error)"],
            duplicates: [{ entityId: "uuid-456", similarity: 0.92 }],
            createdAt: "2026-01-04T12:00:00Z",
          },
        ],
        stats: {
          total: 15,
          pending: 8,
          approved: 5,
          rejected: 2,
          merged: 0,
          autoApproved: 12,
          topIssues: [
            { issue: "Likely not a person name", count: 5 },
            { issue: "Geographic term misclassified", count: 3 },
          ],
        },
      },
    },
  })
  async getReviewQueue() {
    return {
      pending: this.reviewQueueService.getPendingItems(),
      stats: this.reviewQueueService.getQueueStats(),
    };
  }

  @Post("review-queue/approve/:entityId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Curator approves an entity for graph ingestion" })
  @ApiParam({ name: "entityId", type: "string", description: "Entity UUID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        curatorId: { type: "string", description: "Curator user ID" },
        notes: { type: "string", description: "Optional approval notes" },
      },
      required: ["curatorId"],
    },
  })
  async approveEntity(
    @Param("entityId") entityId: string,
    @Body() body: { curatorId: string; notes?: string },
  ) {
    if (!body.curatorId) {
      throw new BadRequestException("curatorId is required");
    }
    return this.reviewQueueService.approveEntity(
      entityId,
      body.curatorId,
      body.notes,
    );
  }

  @Post("review-queue/reject/:entityId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Curator rejects an entity (won't be added to graph)" })
  @ApiParam({ name: "entityId", type: "string", description: "Entity UUID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        curatorId: { type: "string", description: "Curator user ID" },
        reason: { type: "string", description: "Reason for rejection" },
      },
      required: ["curatorId", "reason"],
    },
  })
  async rejectEntity(
    @Param("entityId") entityId: string,
    @Body() body: { curatorId: string; reason: string },
  ) {
    if (!body.curatorId || !body.reason) {
      throw new BadRequestException("curatorId and reason are required");
    }
    return this.reviewQueueService.rejectEntity(
      entityId,
      body.curatorId,
      body.reason,
    );
  }

  @Post("review-queue/merge")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Curator merges duplicate entities into one" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        primaryId: { type: "string", description: "Primary entity UUID (keeps this)" },
        duplicateIds: {
          type: "array",
          items: { type: "string" },
          description: "Entity UUIDs to merge into primary",
        },
        curatorId: { type: "string", description: "Curator user ID" },
      },
      required: ["primaryId", "duplicateIds", "curatorId"],
    },
  })
  async mergeDuplicates(
    @Body()
    body: {
      primaryId: string;
      duplicateIds: string[];
      curatorId: string;
    },
  ) {
    if (!body.primaryId || !body.duplicateIds || !body.curatorId) {
      throw new BadRequestException(
        "primaryId, duplicateIds, and curatorId are required",
      );
    }
    return this.reviewQueueService.mergeDuplicates(
      body.primaryId,
      body.duplicateIds,
      body.curatorId,
    );
  }

  @Get("entities/:entityId/duplicates")
  @ApiOperation({ summary: "Find potential duplicate entities" })
  @ApiParam({ name: "entityId", type: "string", description: "Entity UUID" })
  @ApiResponse({
    status: 200,
    description: "List of potential duplicates with similarity scores",
    schema: {
      example: {
        entity: { id: "uuid-123", rawText: "Juan Pérez", normText: "JUAN PEREZ" },
        duplicates: [
          { entityIds: ["uuid-123", "uuid-456"], similarity: 0.95, reason: "Same normalized name" },
          { entityIds: ["uuid-123", "uuid-789"], similarity: 0.88, reason: "Variant spelling" },
        ],
      },
    },
  })
  async findDuplicates(@Param("entityId") entityId: string) {
    const entity = await this.articlesService.getEntity(entityId);
    if (!entity) {
      throw new BadRequestException(`Entity ${entityId} not found`);
    }
    const duplicates = await this.dedupService.findDuplicates(entity, 0.85);
    return { entity, duplicates };
  }

  @Get("curator/status")
  @ApiOperation({
    summary: "Get LLM curator status and configuration",
    description:
      "Check if Claude 3.5 Sonnet is configured for automated entity review. " +
      "Requires ANTHROPIC_API_KEY in environment variables.",
  })
  @ApiResponse({
    status: 200,
    description: "LLM curator status",
    schema: {
      example: {
        enabled: true,
        model: "claude-3-5-sonnet-20241022",
        status: "ready",
        message:
          "LLM curator is active. Entities will be pre-screened by Claude before human review.",
      },
    },
  })
  async getCuratorStatus() {
    const enabled = this.llmCurator.isEnabled();
    return {
      enabled,
      model: "meta-llama/Llama-3.1-70b-Instruct-Turbo (Together.AI)",
      status: enabled ? "ready" : "disabled",
      message: enabled
        ? "LLM curator is active. Entities will be pre-screened by Llama 3.1 70B before human review."
        : "LLM curator disabled. Set TOGETHER_API_KEY to enable Llama curation.",
    };
  }

  @Post("curator/review/:entityId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Manually trigger LLM review for an entity",
    description:
      "Ask Claude to review a specific entity for false positive risk, duplicates, and categorization suggestions. " +
      "This happens automatically during ingestion, but you can manually request review here.",
  })
  @ApiParam({ name: "entityId", type: "string", description: "Entity UUID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        articleContext: {
          type: "string",
          description: "Optional article text for context (improves accuracy)",
        },
        confidenceScore: {
          type: "number",
          description: "Confidence score 1-5 (default: 3)",
          example: 4,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "LLM review completed",
    schema: {
      example: {
        entityId: "uuid-123",
        entity: { id: "uuid-123", rawText: "Nicolas Maduro", normText: "NICOLAS MADURO" },
        review: {
          recommendation: "approve",
          confidence: 0.95,
          explanation:
            "Nicolas Maduro is a well-known Venezuelan political figure with multiple official sanctions. High confidence match to Tier 1 official.",
          suggestedCategory: "PERSON",
        },
      },
    },
  })
  async reviewEntity(
    @Param("entityId") entityId: string,
    @Body() body?: { articleContext?: string; confidenceScore?: number },
  ) {
    const entity = await this.articlesService.getEntity(entityId);
    if (!entity) {
      throw new BadRequestException(`Entity ${entityId} not found`);
    }

    const review = await this.llmCurator.reviewEntity(
      entity,
      body?.confidenceScore || 3,
      body?.articleContext || `Named entity: ${entity.rawText}`,
    );

    return {
      entityId,
      entity,
      review,
      note: "LLM review is a suggestion. Human curators must approve final additions to the graph.",
    };
  }
}


