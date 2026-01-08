import { CanonicalExtractor } from "./canonical-extractor";

describe("CanonicalExtractor", () => {
  let extractor: CanonicalExtractor;

  beforeEach(() => {
    extractor = new CanonicalExtractor();
  });

  describe("extractFromHtml - Basic canonical extraction", () => {
    it('should extract <link rel="canonical">', () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://example.com/article" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(html, "https://example.com");
      expect(result).toBeDefined();
      expect(result?.canonicalRaw).toBe("https://example.com/article");
      expect(result?.canonicalNormalized?.normalizedUrl).toBe(
        "https://example.com/article",
      );
      expect(result?.source).toBe("link");
    });

    it('should extract <meta property="og:url"> as fallback', () => {
      const html = `
        <html>
          <head>
            <meta property="og:url" content="https://example.com/article-og" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(html, "https://example.com");
      expect(result?.canonicalRaw).toBe("https://example.com/article-og");
      expect(result?.source).toBe("og:url");
    });

    it('should prefer <link rel="canonical"> over og:url', () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://example.com/article" />
            <meta property="og:url" content="https://example.com/article-og" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(html, "https://example.com");
      expect(result?.canonicalRaw).toBe("https://example.com/article");
      expect(result?.source).toBe("link");
    });

    it("should return fetched URL when no canonical found", () => {
      const html = `
        <html>
          <head>
            <title>Article</title>
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(
        html,
        "https://example.com/article?utm_source=fb",
      );
      expect(result?.canonicalRaw).toBeUndefined();
      expect(result?.fetchedUrl.normalizedUrl).toBe(
        "https://example.com/article",
      );
    });
  });

  describe("extractFromHtml - Relative URLs", () => {
    it("should resolve relative canonical URL", () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="/article" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(
        html,
        "https://example.com/news/item",
      );
      expect(result?.canonicalNormalized?.normalizedUrl).toBe(
        "https://example.com/article",
      );
    });

    it("should resolve path-relative canonical URL", () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="../article" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(
        html,
        "https://example.com/news/item/page",
      );
      expect(result?.canonicalNormalized?.normalizedUrl).toBe(
        "https://example.com/news/article",
      );
    });

    it("should resolve og:url relative URLs", () => {
      const html = `
        <html>
          <head>
            <meta property="og:url" content="?id=123" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(
        html,
        "https://example.com/article",
      );
      expect(result?.canonicalNormalized?.normalizedUrl).toContain("id=123");
    });
  });

  describe("extractFromHtml - URL normalization", () => {
    it("should normalize extracted canonical URL", () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://example.com/article?utm_source=fb&id=123" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(html, "https://example.com");
      expect(result?.canonicalNormalized?.normalizedUrl).toBe(
        "https://example.com/article?id=123",
      );
      expect(result?.canonicalNormalized?.normalizedUrl).not.toContain(
        "utm_source",
      );
    });

    it("should strip www. from canonical", () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://www.example.com/article" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(html, "https://example.com");
      expect(result?.canonicalNormalized?.normalizedUrl).toBe(
        "https://example.com/article",
      );
    });
  });

  describe("extractFromRssItem - RSS item extraction", () => {
    it("should extract <link> from RSS item", () => {
      const rssItem = {
        link: "https://example.com/article",
      };

      const result = extractor.extractFromRssItem(rssItem);
      expect(result?.canonicalRaw).toBe("https://example.com/article");
      expect(result?.source).toBe("link");
    });

    it('should extract <guid isPermaLink="true"> as fallback', () => {
      const rssItem = {
        guid: "https://example.com/article-guid",
        isPermaLink: true,
      };

      const result = extractor.extractFromRssItem(rssItem);
      expect(result?.canonicalRaw).toBe("https://example.com/article-guid");
      expect(result?.source).toBe("guid");
    });

    it("should prefer link over guid", () => {
      const rssItem = {
        link: "https://example.com/article",
        guid: "https://example.com/article-guid",
        isPermaLink: true,
      };

      const result = extractor.extractFromRssItem(rssItem);
      expect(result?.canonicalRaw).toBe("https://example.com/article");
      expect(result?.source).toBe("link");
    });

    it("should ignore guid when isPermaLink is false", () => {
      const rssItem = {
        guid: "some-id-123",
        isPermaLink: false,
      };

      const result = extractor.extractFromRssItem(rssItem);
      expect(result).toBeNull();
    });

    it("should use fetched URL as base for relative RSS links", () => {
      const rssItem = {
        link: "/article",
      };

      const result = extractor.extractFromRssItem(
        rssItem,
        "https://example.com/feed",
      );
      expect(result?.canonicalNormalized?.normalizedUrl).toContain("/article");
    });
  });

  describe("extractFromRssItem - Real-world RSS examples", () => {
    it("should handle RSS 2.0 item with absolute link", () => {
      const rssItem = {
        link: "https://www.eluniversal.com/noticias/2024-01-15/maduro-anuncia",
      };

      const result = extractor.extractFromRssItem(
        rssItem,
        "https://eluniversal.com/feed/rss",
      );
      expect(result?.canonicalNormalized?.normalizedUrl).toContain(
        "eluniversal.com",
      );
    });

    it("should handle Atom entry with relative link", () => {
      const rssItem = {
        link: "article/123",
      };

      const result = extractor.extractFromRssItem(
        rssItem,
        "https://efectococuyo.com",
      );
      expect(result?.canonicalNormalized?.normalizedUrl).toBe(
        "https://efectococuyo.com/article/123",
      );
    });
  });

  describe("getArticleKey - Dedup key generation", () => {
    it("should return canonical URL when available", () => {
      const canonical = extractor.extractFromHtml(
        '<link rel="canonical" href="https://example.com/article" />',
        "https://example.com/article?utm_source=fb",
      );

      const key = extractor.getArticleKey(canonical);
      expect(key).toBe("https://example.com/article");
    });

    it("should fall back to fetched URL when no canonical", () => {
      const canonical = extractor.extractFromHtml(
        "<html><body></body></html>",
        "https://example.com/article?utm_source=fb",
      );

      const key = extractor.getArticleKey(canonical);
      expect(key).toBe("https://example.com/article");
    });

    it("should return null when both URLs fail to normalize", () => {
      const key = extractor.getArticleKey(null);
      expect(key).toBeNull();
    });

    it("should deduplicate articles with same canonical but different fetched URLs", () => {
      const canonical1 = extractor.extractFromHtml(
        '<link rel="canonical" href="https://example.com/article" />',
        "https://example.com/article",
      );

      const canonical2 = extractor.extractFromHtml(
        '<link rel="canonical" href="https://example.com/article" />',
        "https://example.com/article?utm_source=twitter",
      );

      const key1 = extractor.getArticleKey(canonical1);
      const key2 = extractor.getArticleKey(canonical2);

      expect(key1).toBe(key2);
    });
  });

  describe("Real-world Venezuelan news scenarios", () => {
    it("should extract canonical from El Universal article", () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://www.eluniversal.com/noticias/politica/2024-01-15/maduro-anuncia-nuevas-medidas" />
            <meta property="og:url" content="https://www.eluniversal.com/noticias/politica/2024-01-15/maduro-anuncia-nuevas-medidas" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(
        html,
        "https://www.eluniversal.com/noticias/politica/2024-01-15/maduro-anuncia-nuevas-medidas?fbclid=123&utm_source=fb",
      );

      const key = extractor.getArticleKey(result);
      expect(key).toContain("eluniversal.com");
      expect(key).not.toContain("fbclid");
      expect(key).not.toContain("utm_");
    });

    it("should handle redirects by using canonical as truth", () => {
      // Scenario: Short link redirects to full article, but canonical specifies the authoritative URL
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://efectococuyo.com/politica/maduro-aumento-salarial" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(html, "https://bit.ly/abc123");
      const key = extractor.getArticleKey(result);
      expect(key).toContain("efectococuyo.com");
      expect(key).toContain("maduro-aumento-salarial");
    });

    it("should normalize both fetched and canonical URLs consistently", () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://www.elnacional.com/ARTICLE?utm_source=fb" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(
        html,
        "https://www.elnacional.com/ARTICLE?utm_source=twitter&utm_medium=social",
      );

      const key = extractor.getArticleKey(result);
      // Should be lowercased domain but preserve path case
      expect(key).toContain("elnacional.com/ARTICLE");
      expect(key).not.toContain("utm_");
    });
  });

  describe("Error handling", () => {
    it("should handle malformed HTML gracefully", () => {
      const html = "<html><head><link rel='canonical'";

      const result = extractor.extractFromHtml(html, "https://example.com");
      expect(result).toBeDefined();
      expect(result?.canonicalRaw).toBeUndefined();
    });

    it("should handle invalid fetched URL", () => {
      const html = `<link rel="canonical" href="https://example.com/article" />`;
      const result = extractor.extractFromHtml(html, "not-a-url");
      expect(result).toBeNull();
    });

    it("should handle empty RSS item", () => {
      const result = extractor.extractFromRssItem({});
      expect(result).toBeNull();
    });

    it("should handle RFC3339 datetime in content", () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://example.com/article" />
            <meta property="article:published_time" content="2024-01-15T10:30:00Z" />
          </head>
        </html>
      `;

      const result = extractor.extractFromHtml(html, "https://example.com");
      expect(result?.canonicalRaw).toBe("https://example.com/article");
    });
  });
});
