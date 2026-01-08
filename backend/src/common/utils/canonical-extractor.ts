import { Logger } from "@nestjs/common";
import { load } from "cheerio";
import { NormalizedUrlResult, urlNormalizer } from "./url-normalizer";

/**
 * Canonical URL information extracted from HTML or RSS.
 * Contains both raw and normalized forms of the canonical URL.
 */
export interface CanonicalInfo {
  /** Original fetched URL normalized */
  fetchedUrl: NormalizedUrlResult;
  /** Raw canonical URL as found in HTML/RSS */
  canonicalRaw?: string;
  /** Normalized canonical URL */
  canonicalNormalized?: NormalizedUrlResult;
  /** Source of canonical: "link", "og:url", "guid", or null */
  source?: "link" | "og:url" | "guid";
}

/**
 * Canonical URL Extractor for Venezuelan news articles.
 * Extracts canonical URLs from HTML <link rel="canonical"> tags
 * and RSS feed metadata to enable more accurate deduplication.
 *
 * Handles:
 * - HTML <link rel="canonical">
 * - Open Graph <meta property="og:url">
 * - RSS <guid isPermaLink="true">
 * - Relative URL resolution
 * - URL normalization of canonical references
 */
export class CanonicalExtractor {
  private readonly logger = new Logger(CanonicalExtractor.name);

  /**
   * Extract canonical URL from HTML content.
   * Looks for canonical in this priority order:
   * 1. <link rel="canonical"> (most authoritative)
   * 2. <meta property="og:url"> (Open Graph fallback)
   *
   * @param html HTML content to parse
   * @param fetchedUrl Original URL that was fetched
   * @returns CanonicalInfo with extracted canonical URL or null if invalid
   */
  extractFromHtml(html: string, fetchedUrl: string): CanonicalInfo | null {
    const fetchedNorm = urlNormalizer.normalize(fetchedUrl);
    if (!fetchedNorm) {
      this.logger.debug(`Invalid fetched URL: ${fetchedUrl}`);
      return null;
    }

    try {
      const $ = load(html);

      // Priority 1: <link rel="canonical">
      const canonicalLink = $('link[rel="canonical"]').attr("href");
      if (canonicalLink) {
        return this.resolveCanonical(canonicalLink, fetchedNorm, "link");
      }

      // Priority 2: <meta property="og:url">
      const ogUrl = $('meta[property="og:url"]').attr("content");
      if (ogUrl) {
        return this.resolveCanonical(ogUrl, fetchedNorm, "og:url");
      }

      // No canonical found, return fetched URL
      return {
        fetchedUrl: fetchedNorm,
      };
    } catch (err) {
      this.logger.error(
        `Error extracting canonical from HTML: ${err instanceof Error ? err.message : String(err)}`,
      );
      return {
        fetchedUrl: fetchedNorm,
      };
    }
  }

  /**
   * Extract canonical URL from RSS item metadata.
   * RSS items may contain canonical URLs in:
   * 1. <link> element (item-level)
   * 2. <guid isPermaLink="true"> element
   *
   * @param rssItem RSS item object with link and/or guid
   * @param fetchedUrl Original feed item URL
   * @returns CanonicalInfo or null if invalid
   */
  extractFromRssItem(
    rssItem: { link?: string; guid?: string; isPermaLink?: boolean },
    fetchedUrl?: string,
  ): CanonicalInfo | null {
    // Use link as primary, guid as fallback
    const rawCanonical =
      rssItem.link || (rssItem.isPermaLink ? rssItem.guid : undefined);

    if (!rawCanonical) {
      return fetchedUrl
        ? {
            fetchedUrl: urlNormalizer.normalize(fetchedUrl) || {
              strictUrl: fetchedUrl,
              normalizedUrl: fetchedUrl,
            },
          }
        : null;
    }

    const fetchedNorm = fetchedUrl
      ? urlNormalizer.normalize(fetchedUrl)
      : undefined;

    if (!fetchedNorm) {
      // If no fetched URL, just normalize the RSS canonical
      const canonicalNorm = urlNormalizer.normalize(rawCanonical);
      if (!canonicalNorm) {
        return null;
      }

      return {
        fetchedUrl: canonicalNorm, // Use canonical as both fetched and canonical
        canonicalRaw: rawCanonical,
        canonicalNormalized: canonicalNorm,
        source: rssItem.link ? "link" : "guid",
      };
    }

    return this.resolveCanonical(rawCanonical, fetchedNorm, "guid");
  }

  /**
   * Resolve relative canonical URL and normalize it.
   * Handles both absolute and relative canonical URLs.
   *
   * @param rawCanonical Raw canonical URL (may be relative)
   * @param fetchedNorm Normalized fetched URL (used as base for relative URLs)
   * @param source Source of the canonical ("link", "og:url", or "guid")
   * @returns CanonicalInfo with resolved and normalized canonical
   */
  private resolveCanonical(
    rawCanonical: string,
    fetchedNorm: NormalizedUrlResult,
    source: "link" | "og:url" | "guid",
  ): CanonicalInfo {
    try {
      // Resolve relative URL against fetched URL
      // Use fetchedNorm.normalizedUrl as base (tracking params already removed)
      const resolved = new URL(
        rawCanonical,
        fetchedNorm.normalizedUrl,
      ).toString();

      const canonicalNorm = urlNormalizer.normalize(resolved);

      return {
        fetchedUrl: fetchedNorm,
        canonicalRaw: rawCanonical,
        canonicalNormalized: canonicalNorm || undefined,
        source,
      };
    } catch (err) {
      this.logger.debug(
        `Failed to resolve canonical "${rawCanonical}" against ${fetchedNorm.normalizedUrl}: ${err instanceof Error ? err.message : String(err)}`,
      );

      return {
        fetchedUrl: fetchedNorm,
        canonicalRaw: rawCanonical,
        source,
      };
    }
  }

  /**
   * Get the authoritative article URL for deduplication.
   * Prefers canonical URL if available and valid, falls back to fetched URL.
   *
   * @param canonical CanonicalInfo from extraction
   * @returns Normalized URL to use as dedup key
   */
  getArticleKey(canonical: CanonicalInfo | null): string | null {
    if (!canonical) {
      return null;
    }

    // Prefer canonical URL if normalized successfully
    if (canonical.canonicalNormalized?.normalizedUrl) {
      return canonical.canonicalNormalized.normalizedUrl;
    }

    // Fall back to fetched URL
    if (canonical.fetchedUrl?.normalizedUrl) {
      return canonical.fetchedUrl.normalizedUrl;
    }

    return null;
  }
}

/**
 * Global singleton instance of canonical extractor.
 * Used throughout the application for extracting article canonical URLs.
 */
export const canonicalExtractor = new CanonicalExtractor();
