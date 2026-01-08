import { UrlNormalizer } from "./url-normalizer";

describe("UrlNormalizer", () => {
  let normalizer: UrlNormalizer;

  beforeEach(() => {
    normalizer = new UrlNormalizer();
  });

  describe("normalize - Basic URL normalization", () => {
    it("should normalize a simple HTTP URL", () => {
      const result = normalizer.normalize("http://example.com/article");
      expect(result).toBeDefined();
      expect(result?.normalizedUrl).toBe("http://example.com/article");
      expect(result?.strictUrl).toBe("http://example.com/article");
    });

    it("should normalize HTTPS URLs", () => {
      const result = normalizer.normalize("https://example.com/article");
      expect(result).toBeDefined();
      expect(result?.normalizedUrl).toContain("https://example.com");
    });

    it("should lowercase scheme and hostname", () => {
      const result = normalizer.normalize("HTTPS://EXAMPLE.COM/article");
      expect(result?.normalizedUrl).toBe("https://example.com/article");
    });

    it("should strip www. prefix by default", () => {
      const result = normalizer.normalize("https://www.example.com/article");
      expect(result?.normalizedUrl).toBe("https://example.com/article");
    });

    it("should keep www. when stripWWW is false", () => {
      const result = normalizer.normalize(
        "https://www.example.com/article",
        false,
      );
      expect(result?.normalizedUrl).toBe("https://www.example.com/article");
    });

    it("should remove fragment (#...)", () => {
      const result = normalizer.normalize(
        "https://example.com/article#section",
      );
      expect(result?.normalizedUrl).not.toContain("#");
      expect(result?.normalizedUrl).toBe("https://example.com/article");
    });

    it("should remove default HTTP port 80", () => {
      const result = normalizer.normalize("http://example.com:80/article");
      expect(result?.normalizedUrl).not.toContain(":80");
    });

    it("should remove default HTTPS port 443", () => {
      const result = normalizer.normalize("https://example.com:443/article");
      expect(result?.normalizedUrl).not.toContain(":443");
    });

    it("should keep non-default ports", () => {
      const result = normalizer.normalize("https://example.com:8443/article");
      expect(result?.normalizedUrl).toContain(":8443");
    });
  });

  describe("normalize - UTM parameter removal", () => {
    it("should remove UTM tracking parameters", () => {
      const url =
        "https://example.com/article?utm_source=twitter&utm_medium=social&utm_campaign=news";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).not.toContain("utm_source");
      expect(result?.normalizedUrl).not.toContain("utm_medium");
      expect(result?.normalizedUrl).not.toContain("utm_campaign");
      expect(result?.normalizedUrl).toBe("https://example.com/article");
    });

    it("should remove all utm_* parameters", () => {
      const url =
        "https://example.com/article?utm_source=fb&utm_term=venezuela&utm_content=banner&utm_id=123";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).toBe("https://example.com/article");
    });

    it("should remove Facebook Click ID (fbclid)", () => {
      const url = "https://example.com/article?id=123&fbclid=abc123xyz";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).toBe("https://example.com/article?id=123");
      expect(result?.normalizedUrl).not.toContain("fbclid");
    });

    it("should remove Google Click ID (gclid)", () => {
      const url = "https://example.com/article?id=123&gclid=abc123xyz";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).toBe("https://example.com/article?id=123");
      expect(result?.normalizedUrl).not.toContain("gclid");
    });

    it("should remove Instagram ID (igshid)", () => {
      const url = "https://example.com/article?id=123&igshid=abc123";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).toBe("https://example.com/article?id=123");
    });

    it("should remove MailChimp parameters", () => {
      const url =
        "https://example.com/article?id=123&mc_cid=campaign123&mc_eid=email123";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).toBe("https://example.com/article?id=123");
    });

    it("should preserve content-bearing query parameters", () => {
      const url = "https://example.com/article?id=123&page=2&lang=es";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).toContain("id=123");
      expect(result?.normalizedUrl).toContain("page=2");
      expect(result?.normalizedUrl).toContain("lang=es");
    });
  });

  describe("normalize - Query parameter sorting", () => {
    it("should sort query parameters alphabetically", () => {
      const url = "https://example.com/article?z=3&a=1&m=2";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).toBe(
        "https://example.com/article?a=1&m=2&z=3",
      );
    });

    it("should deduplicate URLs with differently-ordered parameters", () => {
      const url1 = "https://example.com/article?a=1&b=2&c=3";
      const url2 = "https://example.com/article?c=3&a=1&b=2";

      const result1 = normalizer.normalize(url1);
      const result2 = normalizer.normalize(url2);

      expect(result1?.normalizedUrl).toBe(result2?.normalizedUrl);
    });

    it("should sort after removing tracking params", () => {
      const url =
        "https://example.com/article?z=3&utm_source=fb&a=1&utm_medium=social";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).toBe("https://example.com/article?a=1&z=3");
    });
  });

  describe("normalize - Real-world Venezuelan news examples", () => {
    it("should normalize El Universal URL with tracking", () => {
      const url =
        "https://www.eluniversal.com/noticias/politica/2024-01-15/maduro-anuncia-nuevas-medidas?utm_source=twitter&utm_medium=social&fbclid=12345";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).not.toContain("utm_");
      expect(result?.normalizedUrl).not.toContain("fbclid");
      expect(result?.normalizedUrl).toContain(
        "https://eluniversal.com/noticias/politica/2024-01-15/maduro-anuncia-nuevas-medidas",
      );
    });

    it("should normalize Efecto Cocuyo URL", () => {
      const url =
        "https://efectococuyo.com/politica/maduro-aumento-salarial?ref=twitter&utm_campaign=news";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).not.toContain("ref=");
      expect(result?.normalizedUrl).not.toContain("utm_");
    });

    it("should deduplicate El Nacional URLs with different tracking", () => {
      const url1 =
        "https://www.elnacional.com/venezuela/politica/2024/articulo-1?utm_source=facebook";
      const url2 =
        "https://www.elnacional.com/venezuela/politica/2024/articulo-1?utm_source=twitter&fbclid=xyz";

      const result1 = normalizer.normalize(url1);
      const result2 = normalizer.normalize(url2);

      expect(result1?.normalizedUrl).toBe(result2?.normalizedUrl);
    });
  });

  describe("normalize - Error handling", () => {
    it("should return null for invalid URLs", () => {
      const result = normalizer.normalize("not a url");
      expect(result).toBeNull();
    });

    it("should return null for non-HTTP protocols", () => {
      const result = normalizer.normalize("ftp://example.com/file");
      expect(result).toBeNull();
    });

    it("should return null for file:// URLs", () => {
      const result = normalizer.normalize("file:///usr/local/file.txt");
      expect(result).toBeNull();
    });

    it("should handle empty string", () => {
      const result = normalizer.normalize("");
      expect(result).toBeNull();
    });

    it("should handle relative URLs", () => {
      const result = normalizer.normalize("/article/123");
      expect(result).toBeNull();
    });
  });

  describe("normalizeMultiple - Batch normalization", () => {
    it("should normalize multiple URLs", () => {
      const urls = [
        "https://example.com/a?utm_source=fb",
        "https://example.com/b",
        "invalid-url",
      ];

      const results = normalizer.normalizeMultiple(urls);

      expect(results).toHaveLength(3);
      expect(results[0]).toBeDefined();
      expect(results[0]?.normalizedUrl).toBe("https://example.com/a");
      expect(results[1]).toBeDefined();
      expect(results[2]).toBeNull();
    });
  });

  describe("extractDomain - Domain extraction", () => {
    it("should extract domain from URL", () => {
      const domain = normalizer.extractDomain("https://example.com/article");
      expect(domain).toBe("example.com");
    });

    it("should extract domain with www", () => {
      const domain = normalizer.extractDomain(
        "https://www.example.com/article",
      );
      expect(domain).toBe("www.example.com");
    });

    it("should return null for invalid URL", () => {
      const domain = normalizer.extractDomain("not-a-url");
      expect(domain).toBeNull();
    });

    it("should extract domain from Venezuelan news site", () => {
      const domain = normalizer.extractDomain(
        "https://www.eluniversal.com/noticias",
      );
      expect(domain).toBe("www.eluniversal.com");
    });
  });

  describe("isSameUrl - URL comparison", () => {
    it("should identify identical URLs as same", () => {
      const result = normalizer.isSameUrl(
        "https://example.com/article",
        "https://example.com/article",
      );
      expect(result).toBe(true);
    });

    it("should identify URLs with different tracking params as same", () => {
      const result = normalizer.isSameUrl(
        "https://example.com/article?utm_source=facebook",
        "https://example.com/article?utm_source=twitter",
      );
      expect(result).toBe(true);
    });

    it("should identify differently-ordered params as same", () => {
      const result = normalizer.isSameUrl(
        "https://example.com/article?a=1&b=2",
        "https://example.com/article?b=2&a=1",
      );
      expect(result).toBe(true);
    });

    it("should identify different articles as different", () => {
      const result = normalizer.isSameUrl(
        "https://example.com/article1",
        "https://example.com/article2",
      );
      expect(result).toBe(false);
    });

    it("should return false for invalid URLs", () => {
      const result = normalizer.isSameUrl("not-a-url", "https://example.com");
      expect(result).toBe(false);
    });

    it("should handle www. prefix consistently", () => {
      const result = normalizer.isSameUrl(
        "https://www.example.com/article",
        "https://example.com/article",
      );
      expect(result).toBe(true);
    });
  });

  describe("Edge cases and real-world scenarios", () => {
    it("should handle URLs with multiple tracking parameters mixed with content params", () => {
      const url =
        "https://example.com/article?id=123&utm_source=fb&section=news&fbclid=abc&page=2";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).toContain("id=123");
      expect(result?.normalizedUrl).toContain("section=news");
      expect(result?.normalizedUrl).toContain("page=2");
      expect(result?.normalizedUrl).not.toContain("utm_");
      expect(result?.normalizedUrl).not.toContain("fbclid");
    });

    it("should handle URLs with encoded characters", () => {
      const url =
        "https://example.com/article?title=Maduro%20anuncia&utm_source=fb";
      const result = normalizer.normalize(url);
      expect(result).toBeDefined();
      expect(result?.normalizedUrl).toContain("Maduro");
    });

    it("should handle URLs with query params only (no path)", () => {
      const url = "https://example.com?id=123&utm_source=fb";
      const result = normalizer.normalize(url);
      expect(result?.normalizedUrl).toBe("https://example.com/?id=123");
    });

    it("should preserve original URL in strictUrl", () => {
      const url =
        "https://www.EXAMPLE.COM/article?z=3&a=1&utm_source=fb#section";
      const result = normalizer.normalize(url);
      expect(result?.strictUrl).toContain("z=3");
      expect(result?.strictUrl).toContain("a=1");
      expect(result?.normalizedUrl).not.toContain("utm_");
    });
  });
});
