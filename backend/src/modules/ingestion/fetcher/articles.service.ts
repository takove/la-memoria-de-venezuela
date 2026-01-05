import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StgArticle, StgEntity } from "../../../entities";
import * as crypto from "crypto";

export interface ArticleIngestDto {
  outlet: string;
  title: string;
  url: string;
  lang: string;
  publishedAt?: Date;
  rawHtml?: string;
  cleanText?: string;
}

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(StgArticle)
    private articlesRepository: Repository<StgArticle>,
    @InjectRepository(StgEntity)
    private entitiesRepository: Repository<StgEntity>,
  ) {}

  /**
   * Ingest article into staging table with deduplication by content hash.
   * Returns created or existing article.
   */
  async ingestArticle(dto: ArticleIngestDto): Promise<StgArticle> {
    const contentHash = this.computeHash(dto.cleanText || dto.rawHtml || "");

    // Check for existing article by URL or content hash
    const existing = await this.articlesRepository.findOne({
      where: [{ url: dto.url }, { contentHash }],
    });

    if (existing) {
      this.logger.debug(`Article already exists: ${dto.url}`);
      return existing;
    }

    const article = this.articlesRepository.create({
      outlet: dto.outlet,
      title: dto.title,
      url: dto.url,
      lang: dto.lang,
      publishedAt: dto.publishedAt,
      retrievedAt: new Date(),
      rawHtml: dto.rawHtml,
      cleanText: dto.cleanText,
      contentHash,
    });

    await this.articlesRepository.save(article);
    this.logger.log(`Ingested article: ${dto.url}`);
    return article;
  }

  /**
   * Find articles not yet processed by NER.
   */
  async findUnprocessedArticles(limit = 50): Promise<StgArticle[]> {
    return (
      this.articlesRepository
        .createQueryBuilder("a")
        .leftJoinAndSelect("a.entities", "e")
        .where("e.id IS NULL")
        // Use entity property name to avoid TypeORM databaseName bug
        .orderBy("a.retrievedAt", "DESC")
        .take(limit)
        .getMany()
    );
  }

  /**
   * Find article by ID.
   */
  async findArticleById(id: string): Promise<StgArticle | null> {
    return this.articlesRepository.findOne({ where: { id } });
  }

  /**
   * Compute SHA256 hash of content.
   */
  private computeHash(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Get entity by ID for deduplication/validation.
   */
  async getEntity(id: string): Promise<StgEntity | null> {
    return this.entitiesRepository.findOne({ where: { id } });
  }
}
