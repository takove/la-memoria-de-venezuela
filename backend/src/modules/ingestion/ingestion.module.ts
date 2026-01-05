import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { ScheduleModule } from "@nestjs/schedule";
import { FetcherModule } from "./fetcher/fetcher.module";
import { NerModule } from "./ner/ner.module";
import { MatchModule } from "./match/match.module";
import { IngestionOrchestrator } from "./ingestion.orchestrator";
import { IngestionController } from "./ingestion.controller";
import { ConfidenceService } from "./scoring/confidence.service";
import { DedupService } from "./dedup/dedup.service";
import { ReviewQueueService } from "./dedup/review-queue.service";
import { LlmCuratorService } from "./dedup/llm-curator.service";
import { RssService } from "./rss.service";
import { IngestionProcessor } from "./ingestion.processor";
import { StgNode, StgEdge, StgEntity, StgArticle } from "../../entities";
import { Tier1Module } from "./tier1/tier1.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([StgNode, StgEdge, StgEntity, StgArticle]),
    BullModule.registerQueue({
      name: "ingestion",
    }),
    ScheduleModule.forRoot(),
    FetcherModule,
    NerModule,
    MatchModule,
    Tier1Module, // Import for service injection
  ],
  controllers: [IngestionController],
  providers: [
    IngestionOrchestrator,
    ConfidenceService,
    DedupService,
    ReviewQueueService,
    LlmCuratorService,
    RssService,
    IngestionProcessor,
  ],
  exports: [
    IngestionOrchestrator,
    ConfidenceService,
    DedupService,
    ReviewQueueService,
    LlmCuratorService,
    RssService,
  ],
})
export class IngestionModule {}
