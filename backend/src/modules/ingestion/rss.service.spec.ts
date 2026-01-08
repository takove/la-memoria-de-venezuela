import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { getQueueToken } from "@nestjs/bullmq";
import { RssService } from "./rss.service";
import { StgArticle } from "../../entities";

describe("RssService", () => {
  let service: RssService;

  const mockQueue = {
    add: jest.fn(),
  };

  const mockArticleRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RssService,
        {
          provide: getQueueToken("ingestion"),
          useValue: mockQueue,
        },
        {
          provide: getRepositoryToken(StgArticle),
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    service = module.get<RssService>(RssService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("XML Sanitization", () => {
    it("should sanitize unescaped ampersands", () => {
      const malformedXml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Maduro &amp; Corruption</title>
              <description>Test & Example</description>
            </item>
          </channel>
        </rss>`;

      // Access private method via type assertion for testing
      const sanitized = (service as any).sanitizeXml(malformedXml);

      // Should convert unescaped & to &amp; but leave already-escaped ones
      expect(sanitized).toContain("Test &amp; Example");
      expect(sanitized).toContain("Maduro &amp; Corruption");
    });

    it("should convert HTML entities to XML numeric entities", () => {
      const htmlEntities = `<?xml version="1.0"?>
        <rss>
          <channel>
            <item>
              <title>Test&nbsp;Article</title>
              <description>Quote: &ldquo;example&rdquo; &mdash; dash &hellip;</description>
            </item>
          </channel>
        </rss>`;

      const sanitized = (service as any).sanitizeXml(htmlEntities);

      expect(sanitized).toContain("&#160;"); // nbsp
      expect(sanitized).toContain("&#8220;"); // ldquo
      expect(sanitized).toContain("&#8221;"); // rdquo
      expect(sanitized).toContain("&#8212;"); // mdash
      expect(sanitized).toContain("&#8230;"); // hellip
    });

    it("should handle mixed malformed and valid entities", () => {
      const mixedXml = `<item>
        <title>Valid &amp; Invalid & Mixed</title>
        <description>&nbsp; &lt; &gt;</description>
      </item>`;

      const sanitized = (service as any).sanitizeXml(mixedXml);

      // Valid entities should remain unchanged
      expect(sanitized).toContain("&amp;");
      expect(sanitized).toContain("&lt;");
      expect(sanitized).toContain("&gt;");

      // HTML entities should be converted
      expect(sanitized).toContain("&#160;");

      // Invalid bare & should be escaped
      expect(sanitized.match(/&amp;/g)?.length).toBeGreaterThan(1);
    });
  });

  describe("Content-Type Detection", () => {
    it("should detect HTML content-type", () => {
      expect((service as any).isHtmlContent("text/html")).toBe(true);
      expect((service as any).isHtmlContent("text/html; charset=utf-8")).toBe(
        true,
      );
      expect((service as any).isHtmlContent("TEXT/HTML")).toBe(true);
    });

    it("should not flag XML/RSS content-types as HTML", () => {
      expect((service as any).isHtmlContent("application/rss+xml")).toBe(false);
      expect((service as any).isHtmlContent("application/xml")).toBe(false);
      expect((service as any).isHtmlContent("text/xml")).toBe(false);
      expect((service as any).isHtmlContent(undefined)).toBe(false);
    });
  });

  describe("enqueueArticle", () => {
    it("should manually enqueue an article", async () => {
      const article = {
        title: "Test Article",
        sourceUrl: "https://example.com/test",
        content: "Test content",
        language: "es",
        source: "Test Source",
      };

      mockQueue.add.mockResolvedValueOnce({ id: "job-123" });

      const jobId = await service.enqueueArticle(article);

      expect(jobId).toBe("job-123");
      expect(mockQueue.add).toHaveBeenCalledWith(
        "ingest-article",
        {
          title: article.title,
          sourceUrl: article.sourceUrl,
          content: article.content,
          language: article.language,
          source: article.source,
        },
        expect.objectContaining({
          attempts: 3,
          backoff: expect.any(Object),
        }),
      );
    });

    it("should use default language and source if not provided", async () => {
      const article = {
        title: "Test Article",
        sourceUrl: "https://example.com/test",
        content: "Test content",
      };

      mockQueue.add.mockResolvedValueOnce({ id: "job-456" });

      await service.enqueueArticle(article);

      expect(mockQueue.add).toHaveBeenCalledWith(
        "ingest-article",
        expect.objectContaining({
          language: "es",
          source: "Manual Submission",
        }),
        expect.any(Object),
      );
    });

    it("should handle queue without job ID", async () => {
      const article = {
        title: "Test",
        sourceUrl: "https://example.com",
        content: "Content",
      };

      mockQueue.add.mockResolvedValueOnce({});

      const jobId = await service.enqueueArticle(article);

      expect(jobId).toBe("");
    });
  });
});
