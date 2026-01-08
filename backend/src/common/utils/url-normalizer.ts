import { Logger } from "@nestjs/common";

/**
 * URL normalization result containing both normalized and strict URLs.
 * Strict URL retains all parameters for debugging/fallback.
 * Normalized URL strips tracking parameters and ensures stable key for deduplication.
 */
export interface NormalizedUrlResult {
  /** Normalized URL without tracking parameters - used as primary dedup key */
  normalizedUrl: string;
  /** URL with all parameters preserved - used for fallback and debugging */
  strictUrl: string;
}

/**
 * URL Normalization Service for Venezuelan news aggregation.
 * Implements industry best practices for stable URL canonicalization.
 * Handles:
 * - Tracking parameter removal (UTM, Facebook, Google)
 * - Query parameter sorting
 * - Domain normalization
 * - Fragment removal
 * - Port normalization
 */
export class UrlNormalizer {
  private readonly logger = new Logger(UrlNormalizer.name);

  /**
   * Tracking parameters commonly found on news sites that should be removed.
   * Includes UTM parameters, social media tracking, and common ad network params.
   */
  private readonly TRACKING_PARAMS = new Set([
    // UTM parameters
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id",
    // Social media tracking
    "fbclid", // Facebook Click ID
    "gclid", // Google Click ID
    "igshid", // Instagram tracking
    "mc_cid", // MailChimp Campaign ID
    "mc_eid", // MailChimp Email ID
    // Referral and campaign params
    "ref",
    "ref_",
    "spm", // Tracking from various sources
    "campaign",
    "src",
    // Analytics
    "utm", // Catch-all for any utm_ params not explicitly listed
  ]);

  /**
   * Normalize a URL for deduplication.
   * Returns both normalized (tracking-stripped) and strict (full) URLs.
   *
   * Normalization steps:
   * 1. Parse URL safely
   * 2. Lowercase scheme and hostname
   * 3. Strip default ports
   * 4. Remove leading www. (if configured)
   * 5. Remove fragment (#...)
   * 6. Remove tracking parameters
   * 7. Sort remaining query parameters alphabetically
   *
   * @param raw Raw URL string to normalize
   * @param stripWWW Whether to strip www. prefix (default: true)
   * @returns NormalizedUrlResult or null if URL is invalid/non-HTTP
   */
  normalize(raw: string, stripWWW = true): NormalizedUrlResult | null {
    let url: URL;

    try {
      url = new URL(raw);
    } catch (err) {
      this.logger.debug(`Invalid URL: ${raw}`, err);
      return null;
    }

    // Only accept HTTP(S)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      this.logger.debug(`Non-HTTP URL protocol: ${url.protocol}`);
      return null;
    }

    // Lowercase scheme + host
    url.protocol = url.protocol.toLowerCase();
    url.hostname = url.hostname.toLowerCase();

    // Strip default ports
    if (
      (url.protocol === "http:" && url.port === "80") ||
      (url.protocol === "https:" && url.port === "443")
    ) {
      url.port = "";
    }

    // Strip www. if requested
    if (stripWWW && url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
    }

    // Remove fragment (#...)
    url.hash = "";

    // Get strict URL (all parameters intact)
    const strictUrl = url.toString();

    // Now build normalized URL (tracking-stripped)
    const normalized = new URL(strictUrl);
    const params = normalized.searchParams;

    // Collect parameters to delete (tracking params)
    const toDelete: string[] = [];
    params.forEach((_, key) => {
      if (this.isTrackingParam(key)) {
        toDelete.push(key);
      }
    });

    // Remove tracking parameters
    toDelete.forEach((key) => params.delete(key));

    // Sort remaining query parameters alphabetically for stable ordering
    const sortedParams = new URLSearchParams();
    Array.from(params.keys())
      .sort()
      .forEach((key) => {
        const values = params.getAll(key);
        values.forEach((v) => sortedParams.append(key, v));
      });

    // Rebuild normalized URL with sorted params
    normalized.search = sortedParams.toString()
      ? `?${sortedParams.toString()}`
      : "";

    const normalizedUrl = normalized.toString();

    this.logger.debug(`URL normalized: ${raw} -> ${normalizedUrl}`);

    return { strictUrl, normalizedUrl };
  }

  /**
   * Check if a parameter name is a tracking/advertising parameter.
   * Uses case-insensitive matching.
   *
   * @param paramKey Parameter name to check
   * @returns true if parameter should be removed for dedup
   */
  private isTrackingParam(paramKey: string): boolean {
    const lowerKey = paramKey.toLowerCase();

    // Exact matches
    if (this.TRACKING_PARAMS.has(lowerKey)) {
      return true;
    }

    // Prefix matches for utm_* pattern
    if (lowerKey.startsWith("utm_")) {
      return true;
    }

    return false;
  }

  /**
   * Normalize multiple URLs and return results.
   * Useful for batch processing.
   *
   * @param urls Array of URLs to normalize
   * @returns Array of normalized results (null entries for invalid URLs)
   */
  normalizeMultiple(urls: string[]): (NormalizedUrlResult | null)[] {
    return urls.map((url) => this.normalize(url));
  }

  /**
   * Extract domain from a URL.
   * Returns domain without protocol or path.
   *
   * @param url URL to extract domain from
   * @returns Domain name or null if invalid
   */
  extractDomain(url: string): string | null {
    try {
      const parsed = new URL(url);
      return parsed.hostname || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if two URLs refer to the same content after normalization.
   * Returns true if normalized URLs match.
   *
   * @param url1 First URL
   * @param url2 Second URL
   * @returns true if both normalize to the same URL
   */
  isSameUrl(url1: string, url2: string): boolean {
    const norm1 = this.normalize(url1);
    const norm2 = this.normalize(url2);

    if (!norm1 || !norm2) {
      return false;
    }

    return norm1.normalizedUrl === norm2.normalizedUrl;
  }
}

/**
 * Global singleton instance of URL normalizer.
 * Used throughout the application for consistent URL normalization.
 */
export const urlNormalizer = new UrlNormalizer();
