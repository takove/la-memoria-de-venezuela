import { Injectable, Logger } from "@nestjs/common";
import { ArticlesService } from "./fetcher/articles.service";
import { EntitiesService, ExtractedEntity, ExtractedRelation } from "./ner/entities.service";
import { WinkNerService } from "./ner/wink-ner.service";
import { MatchService } from "./match/match.service";
import { StgNodeType, StgEdgeType } from "../../entities";

export interface PipelineResultDto {
  articleId: string;
  entityCount: number;
  relationCount: number;
  nodesCreated: number;
  edgesCreated: number;
  tier1Match?: string;
  errors: string[];
}

@Injectable()
export class IngestionOrchestrator {
  private readonly logger = new Logger(IngestionOrchestrator.name);

  constructor(
    private articlesService: ArticlesService,
    private entitiesService: EntitiesService,
    private winkNerService: WinkNerService,
    private matchService: MatchService,
  ) {}

  /**
   * Orchestrate full ingestion pipeline for unprocessed articles.
   * Returns results per article.
   */
  async processPipeline(limit = 10): Promise<PipelineResultDto[]> {
    const results: PipelineResultDto[] = [];
    const articles = await this.articlesService.findUnprocessedArticles(limit);

    for (const article of articles) {
      try {
        const result = await this.processArticle(article.id);
        results.push(result);
      } catch (error) {
        this.logger.error(`Pipeline error for article ${article.id}: ${error.message}`);
        results.push({
          articleId: article.id,
          entityCount: 0,
          relationCount: 0,
          nodesCreated: 0,
          edgesCreated: 0,
          errors: [error.message],
        });
      }
    }

    this.logger.log(`Pipeline completed: processed ${results.length} articles`);
    return results;
  }

  /**
   * Process single article: extract entities/relations, match to Tier 1, build graph.
   */
  private async processArticle(articleId: string): Promise<PipelineResultDto> {
    const errors: string[] = [];
    let entityCount = 0;
    let relationCount = 0;
    let nodesCreated = 0;
    let edgesCreated = 0;
    let tier1Match: string | undefined;

    try {
      // Step 1: Get article content
      const article = await this.articlesService.findArticleById(articleId);
      if (!article) {
        throw new Error(`Article ${articleId} not found`);
      }

      // Step 2: Extract entities and relations using real NER
      const extractedEntities = await this.winkNerService.extractEntities(
        article.cleanText || article.rawHtml || "",
      );
      const extractedRelations = await this.winkNerService.extractRelations(
        article.cleanText || article.rawHtml || "",
      );

      this.logger.debug(
        `NER extracted ${extractedEntities.length} entities and ${extractedRelations.length} relations`,
      );

      // Step 3: Store entities in staging
      const storedEntities = await this.entitiesService.storeEntities(
        articleId,
        extractedEntities,
      );
      entityCount = storedEntities.length;

      // Step 4: Store relations in staging
      const storedRelations = await this.entitiesService.storeRelations(
        articleId,
        extractedRelations,
      );
      relationCount = storedRelations.length;
      const personEntities = storedEntities.filter((e) => e.type === "PERSON");
      const nodeMap = new Map<string, string>();

      for (const entity of personEntities) {
        // Try deterministic match first
        let tier1 = await this.matchService.matchTier1ByName(entity.rawText);

        // Fallback to fuzzy match
        if (!tier1) {
          tier1 = await this.matchService.fuzzyMatchTier1(entity.rawText);
        }

        const node = await this.matchService.upsertNode({
          type: StgNodeType.PERSON,
          canonicalName: entity.normText,
          altNames: [entity.rawText],
          sourceIds: { stg_entity_id: entity.id },
          tier1Id: tier1?.id,
        });

        nodeMap.set(entity.id, node.id);
        nodesCreated++;

        if (tier1) {
          tier1Match = tier1.id;
          this.logger.log(`Matched person ${entity.rawText} to Tier 1 ${tier1.fullName}`);
        }
      }

      // Step 5: Create edges for relations
      for (const relation of storedRelations) {
        if (relation.subjectEntity && relation.objectEntity) {
          const srcId = nodeMap.get(relation.subjectEntity.id);
          const dstId = nodeMap.get(relation.objectEntity.id);

          if (srcId && dstId) {
            await this.matchService.upsertEdge({
              srcNodeId: srcId,
              dstNodeId: dstId,
              type: StgEdgeType.RELATION_PATTERN,
              weight: relation.confidence,
              evidenceRef: {
                relationId: relation.id,
                sentence: relation.sentence,
              },
            });
            edgesCreated++;
          }
        }
      }

      this.logger.log(
        `Article ${articleId}: ${entityCount} entities, ${relationCount} relations, ${nodesCreated} nodes, ${edgesCreated} edges`,
      );
    } catch (error) {
      errors.push(error.message);
      this.logger.error(`Error processing article ${articleId}: ${error.message}`);
    }

    return {
      articleId,
      entityCount,
      relationCount,
      nodesCreated,
      edgesCreated,
      tier1Match,
      errors,
    };
  }
}

