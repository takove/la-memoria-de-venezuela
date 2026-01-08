import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StgArticle } from "src/entities";
import * as https from "https";
import * as http from "http";
import * as xml2js from "xml2js";

interface RssFeed {
  url: string;
  name: string;
  language: "es" | "en";
}

/**
 * RSS Polling Service
 *
 * Periodically checks RSS feeds for new articles and enqueues them
 * for processing. Uses BullMQ for reliable job queuing.
 *
 * Supported feeds (add more as needed):
 * - Twitter/X (via Nitter RSS)
 * - News outlets (Reuters, BBC, El País, etc.)
 * - Government announcements
 * - OFAC/Sanctions lists
 */
@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);
  private readonly xmlParser = new xml2js.Parser();

  // RSS feeds to monitor (add more sources as needed)
  private readonly feeds: RssFeed[] = [
    {
      url: "http://feeds.bloomberg.com/markets/news.rss",
      name: "Bloomberg Markets",
      language: "en",
    },
    {
      url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
      name: "CNBC International",
      language: "en",
    },
    // Add Spanish-language sources
    {
      url: "https://feeds.bbci.co.uk/mundo/rss.xml",
      name: "BBC Mundo",
      language: "es",
    },
  ];

  constructor(
    @InjectQueue("ingestion") private ingestionQueue: Queue,
    @InjectRepository(StgArticle)
    private articlesRepository: Repository<StgArticle>,
  ) {}

  /**
   * Poll RSS feeds every 10 minutes for new articles
   * This runs automatically via @nestjs/schedule
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async pollFeeds() {
    this.logger.log("[RSS] Starting feed poll cycle...");

    const results = {
      checked: 0,
      newArticles: 0,
      errors: 0,
    };

    for (const feed of this.feeds) {
      try {
        results.checked++;
        this.logger.debug(`[RSS] Checking feed: ${feed.name}`);

        const articles = await this.fetchFeedArticles(feed);
        this.logger.log(
          `[RSS] Found ${articles.length} articles from ${feed.name}`,
        );

        // Check which articles are new (not already ingested)
        for (const article of articles) {
          const existing = await this.articlesRepository.findOne({
            where: { url: article.source_url },
          });

          if (!existing) {
            // Queue new article for ingestion
            await this.ingestionQueue.add(
              "ingest-article",
              {
                title: article.title,
                sourceUrl: article.source_url,
                content: article.content,
                publishedAt: article.published_at,
                language: feed.language,
                source: feed.name,
              },
              {
                attempts: 3,
                backoff: {
                  type: "exponential",
                  delay: 2000,
                },
              },
            );

            results.newArticles++;
            this.logger.log(
              `[RSS] Queued: "${article.title}" from ${feed.name}`,
            );
          }
        }
      } catch (error) {
        results.errors++;
        this.logger.error(
          `[RSS] Error polling feed "${feed.name}": ${error.message}`,
        );
      }
    }

    this.logger.log(
      `[RSS] Cycle complete. Checked: ${results.checked}, New: ${results.newArticles}, Errors: ${results.errors}`,
    );
  }

  /**
   * Fetch articles from a single RSS feed
   *
   * @param feed RSS feed configuration
   * @returns Array of parsed articles with title, URL, content, published date
   */
  private async fetchFeedArticles(feed: RssFeed): Promise<
    Array<{
      title: string;
      source_url: string;
      content: string;
      published_at: Date;
    }>
  > {
    return new Promise((resolve, reject) => {
      const protocol = feed.url.startsWith("https") ? https : http;

      const req = protocol.get(feed.url, { timeout: 5000 }, async (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", async () => {
          try {
            const parsed = await this.xmlParser.parseStringPromise(data);

            // Handle RSS 2.0 format
            if (parsed.rss?.channel?.[0]?.item) {
              const items = parsed.rss.channel[0].item;
              const articles = items
                .slice(0, 10) // Limit to last 10 items per feed
                .map((item: any) => ({
                  title: item.title?.[0] || "No title",
                  source_url: item.link?.[0] || feed.url,
                  content: item.description?.[0] || "",
                  published_at: item.pubDate?.[0]
                    ? new Date(item.pubDate[0])
                    : new Date(),
                }));
              resolve(articles);
              return;
            }

            // Handle Atom 1.0 format
            if (parsed.feed?.entry) {
              const entries = parsed.feed.entry;
              const articles = entries
                .slice(0, 10) // Limit to last 10 items
                .map((entry: any) => ({
                  title: entry.title?.[0]?._ || entry.title?.[0] || "No title",
                  source_url:
                    entry.link?.[0]?.$.href || entry.link?.[0] || feed.url,
                  content: entry.summary?.[0]?._ || entry.summary?.[0] || "",
                  published_at: entry.published?.[0]
                    ? new Date(entry.published[0])
                    : new Date(),
                }));
              resolve(articles);
              return;
            }

            resolve([]);
          } catch (error) {
            reject(new Error(`Failed to parse RSS: ${error.message}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`Failed to fetch RSS: ${error.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("RSS feed request timeout"));
      });
    });
  }

  /**
   * Manually enqueue an article (for webhook submissions)
   * This allows manual article submission via HTTP endpoint
   *
   * @param article Article data to ingest
   * @returns Job ID
   */
  async enqueueArticle(article: {
    title: string;
    sourceUrl: string;
    content: string;
    language?: string;
    source?: string;
  }): Promise<string> {
    const job = await this.ingestionQueue.add(
      "ingest-article",
      {
        title: article.title,
        sourceUrl: article.sourceUrl,
        content: article.content,
        language: article.language || "es",
        source: article.source || "Manual Submission",
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    );

    this.logger.log(
      `[RSS] Manually enqueued article "${article.title}" (Job ID: ${job.id || "unknown"})`,
    );
    return job.id || "";
  }
}
