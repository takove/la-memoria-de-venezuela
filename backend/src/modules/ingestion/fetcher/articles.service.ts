import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StgArticle, StgEntity } from "../../../entities";
import { urlNormalizer, canonicalExtractor } from "../../../common/utils";
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
   * Ingest article into staging table with URL normalization and canonical deduplication.
   * Uses multi-tier deduplication:
   * 1. Check by canonical URL (if present)
   * 2. Check by normalized URL (tracking params stripped)
   * 3. Check by content hash (exact duplicate detection)
   *
   * @param dto Article ingestion data transfer object
   * @returns Created or existing article
   */
  async ingestArticle(dto: ArticleIngestDto): Promise<StgArticle> {
    const contentHash = this.computeHash(dto.cleanText || dto.rawHtml || "");

    // Step 1: Normalize the fetched URL
    const normalizedUrl = urlNormalizer.normalize(dto.url);
    if (!normalizedUrl) {
      this.logger.warn(`Failed to normalize URL: ${dto.url}`);
      return this.createArticleWithoutNormalization(dto, contentHash);
    }

    // Step 2: Extract canonical URL from HTML if available
    let canonicalUrl: string | undefined;
    if (dto.rawHtml) {
      const canonical = canonicalExtractor.extractFromHtml(
        dto.rawHtml,
        dto.url,
      );
      canonicalUrl = canonicalExtractor.getArticleKey(canonical) || undefined;
    }

    // Step 3: Determine the article key for deduplication
    // Prefer canonical URL, fall back to normalized URL
    const articleKey = canonicalUrl || normalizedUrl.normalizedUrl;

    // Step 4: Check for existing article by article key (canonical or normalized URL)
    let existing = await this.articlesRepository.findOne({
      where: { canonicalUrl: articleKey },
    });

    if (!existing && !canonicalUrl) {
      // If no canonical URL was found, also check by normalized URL
      existing = await this.articlesRepository.findOne({
        where: { normalizedUrl: articleKey },
      });
    }

    if (!existing) {
      // Step 5: Check for exact content duplicate (same content, different URL)
      existing = await this.articlesRepository.findOne({
        where: { contentHash },
      });

      if (existing) {
        this.logger.debug(
          `Found article with same content hash: ${contentHash}`,
        );
        return existing;
      }
    } else {
      this.logger.debug(`Article already exists: ${articleKey}`);
      return existing;
    }

    // Step 6: Create new article with normalized and canonical URLs
    const article = this.articlesRepository.create({
      outlet: dto.outlet,
      title: dto.title,
      url: dto.url,
      normalizedUrl: normalizedUrl.normalizedUrl,
      canonicalUrl,
      lang: dto.lang,
      publishedAt: dto.publishedAt,
      retrievedAt: new Date(),
      rawHtml: dto.rawHtml,
      cleanText: dto.cleanText,
      contentHash,
    });

    await this.articlesRepository.save(article);
    this.logger.log(`Ingested article: ${dto.url} (key: ${articleKey})`);
    return article;
  }

  /**
   * Create article when URL normalization fails.
   * Falls back to basic deduplication by content hash.
   *
   * @private
   */
  private async createArticleWithoutNormalization(
    dto: ArticleIngestDto,
    contentHash: string,
  ): Promise<StgArticle> {
    // Check by content hash only
    const existing = await this.articlesRepository.findOne({
      where: { contentHash },
    });

    if (existing) {
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
    this.logger.log(`Ingested article (no normalization): ${dto.url}`);
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
   * Find article by normalized URL (with tracking params stripped).
   *
   * @param url URL to search for (will be normalized)
   * @returns Article if found, null otherwise
   */
  async findByNormalizedUrl(url: string): Promise<StgArticle | null> {
    const normalized = urlNormalizer.normalize(url);
    if (!normalized) {
      return null;
    }

    return this.articlesRepository.findOne({
      where: [
        { normalizedUrl: normalized.normalizedUrl },
        { canonicalUrl: normalized.normalizedUrl },
      ],
    });
  }

  /**
   * Compute SHA256 hash of content.
   *
   * @private
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
