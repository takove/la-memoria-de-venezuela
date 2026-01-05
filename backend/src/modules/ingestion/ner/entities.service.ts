import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  StgArticle,
  StgEntity,
  StgEntityType,
  StgRelation,
} from "../../../entities";

export interface ExtractedEntity {
  type: keyof typeof StgEntityType;
  rawText: string;
  normText: string;
  offsets?: Record<string, any>;
}

export interface ExtractedRelation {
  pattern: string;
  sentence: string;
  subjectText?: string;
  objectText?: string;
  confidence?: number;
}

export interface NERResultDto {
  articleId: string;
  entities: ExtractedEntity[];
  relations: ExtractedRelation[];
  modelVersion: string;
}

@Injectable()
export class EntitiesService {
  private readonly logger = new Logger(EntitiesService.name);
  private readonly modelVersion = "v1-placeholder";

  constructor(
    @InjectRepository(StgEntity)
    private entitiesRepository: Repository<StgEntity>,
    @InjectRepository(StgRelation)
    private relationsRepository: Repository<StgRelation>,
    @InjectRepository(StgArticle)
    private articlesRepository: Repository<StgArticle>,
  ) {}

  /**
   * Store extracted entities for an article.
   */
  async storeEntities(
    articleId: string,
    entities: ExtractedEntity[],
  ): Promise<StgEntity[]> {
    const article = await this.articlesRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error(`Article ${articleId} not found`);
    }

    const stored: StgEntity[] = [];
    for (const entity of entities) {
      const stgEntity = this.entitiesRepository.create({
        article,
        type: StgEntityType[entity.type],
        rawText: entity.rawText,
        normText: this.normalizeText(entity.normText),
        offsets: entity.offsets,
        lang: article.lang,
        modelVersion: this.modelVersion,
      });
      stored.push(await this.entitiesRepository.save(stgEntity));
    }

    this.logger.log(
      `Stored ${stored.length} entities for article ${articleId}`,
    );
    return stored;
  }

  /**
   * Store extracted relations for an article.
   */
  async storeRelations(
    articleId: string,
    relations: ExtractedRelation[],
  ): Promise<StgRelation[]> {
    const article = await this.articlesRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error(`Article ${articleId} not found`);
    }

    const stored: StgRelation[] = [];
    for (const rel of relations) {
      // Find entities by normalized text (simplified matching)
      const subject = rel.subjectText
        ? await this.entitiesRepository.findOne({
            where: { normText: this.normalizeText(rel.subjectText) },
          })
        : null;

      const object = rel.objectText
        ? await this.entitiesRepository.findOne({
            where: { normText: this.normalizeText(rel.objectText) },
          })
        : null;

      const relationData: any = {
        article,
        pattern: rel.pattern,
        sentence: rel.sentence,
        confidence: rel.confidence,
        modelVersion: this.modelVersion,
      };

      if (subject) relationData.subjectEntity = subject;
      if (object) relationData.objectEntity = object;

      const stgRelation = this.relationsRepository.create(relationData);
      const saved = await this.relationsRepository.save(stgRelation as any);
      stored.push(saved);
    }

    this.logger.log(
      `Stored ${stored.length} relations for article ${articleId}`,
    );
    return stored;
  }

  /**
   * Normalize text: uppercase, remove accents (placeholder).
   */
  private normalizeText(text: string): string {
    return text
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
}
