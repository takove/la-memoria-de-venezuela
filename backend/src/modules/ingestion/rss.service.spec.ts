import { Test, TestingModule } from "@nestjs/testing";
import { getQueueToken } from "@nestjs/bullmq";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RssService } from "./rss.service";
import { StgArticle } from "../../entities";
import * as https from "https";
import { EventEmitter } from "events";

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
    jest.restoreAllMocks();
  });

  describe("fetchFeedArticles", () => {
    it("should parse RSS 2.0 format correctly (Spanish source)", async () => {
      // Mock RSS 2.0 XML response (typical for CNN Español, BBC Mundo)
      const mockRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CNN Español</title>
    <link>https://cnnespanol.cnn.com</link>
    <description>Últimas noticias</description>
    <item>
      <title>Venezuela: Nuevas sanciones de EEUU</title>
      <link>https://cnnespanol.cnn.com/2026/01/08/venezuela-sanciones</link>
      <description>El Departamento del Tesoro de EEUU anunció nuevas sanciones contra funcionarios venezolanos.</description>
      <pubDate>Wed, 08 Jan 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Maduro nombra nuevo ministro</title>
      <link>https://cnnespanol.cnn.com/2026/01/07/maduro-ministro</link>
      <description>Nicolás Maduro designó a un nuevo ministro de economía.</description>
      <pubDate>Tue, 07 Jan 2026 14:30:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

      // Mock HTTP response
      const mockResponse = new EventEmitter() as any;
      mockResponse.statusCode = 200;

      const mockRequest = new EventEmitter() as any;
      mockRequest.destroy = jest.fn();

      jest
        .spyOn(https, "get")
        .mockImplementation((url: any, options: any, callback: any) => {
          if (typeof options === "function") {
            callback = options;
          }

          process.nextTick(() => {
            callback(mockResponse);

            // Emit data chunks
            mockResponse.emit("data", mockRssXml);
            mockResponse.emit("end");
          });

          return mockRequest;
        });

      const feed = {
        url: "https://cnnespanol.cnn.com/feed/",
        name: "CNN Español",
        language: "es" as const,
      };

      const articles = await service["fetchFeedArticles"](feed);

      expect(articles).toHaveLength(2);
      expect(articles[0]).toEqual({
        title: "Venezuela: Nuevas sanciones de EEUU",
        source_url: "https://cnnespanol.cnn.com/2026/01/08/venezuela-sanciones",
        content:
          "El Departamento del Tesoro de EEUU anunció nuevas sanciones contra funcionarios venezolanos.",
        published_at: new Date("Wed, 08 Jan 2026 10:00:00 GMT"),
      });
      expect(articles[1]).toEqual({
        title: "Maduro nombra nuevo ministro",
        source_url: "https://cnnespanol.cnn.com/2026/01/07/maduro-ministro",
        content: "Nicolás Maduro designó a un nuevo ministro de economía.",
        published_at: new Date("Tue, 07 Jan 2026 14:30:00 GMT"),
      });
    });

    it("should parse Atom 1.0 format correctly (official source)", async () => {
      // Mock Atom 1.0 XML response (typical for UK FCDO, some gov feeds)
      const mockAtomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>UK FCDO Publications</title>
  <link href="https://www.gov.uk/government/organisations/foreign-commonwealth-development-office" rel="alternate"/>
  <id>https://www.gov.uk/government/organisations/foreign-commonwealth-development-office</id>
  <updated>2026-01-08T10:00:00Z</updated>
  <entry>
    <title>Foreign Secretary statement on Venezuela sanctions</title>
    <link href="https://www.gov.uk/government/news/venezuela-sanctions-2026" rel="alternate"/>
    <id>https://www.gov.uk/government/news/venezuela-sanctions-2026</id>
    <published>2026-01-08T09:00:00Z</published>
    <summary>The UK has announced new sanctions targeting Venezuelan officials involved in human rights abuses.</summary>
  </entry>
  <entry>
    <title>Update on diplomatic relations with Venezuela</title>
    <link href="https://www.gov.uk/government/news/venezuela-diplomatic-update" rel="alternate"/>
    <id>https://www.gov.uk/government/news/venezuela-diplomatic-update</id>
    <published>2026-01-06T15:00:00Z</published>
    <summary>The Foreign Secretary provided an update on UK-Venezuela diplomatic relations.</summary>
  </entry>
</feed>`;

      // Mock HTTP response
      const mockResponse = new EventEmitter() as any;
      mockResponse.statusCode = 200;

      const mockRequest = new EventEmitter() as any;
      mockRequest.destroy = jest.fn();

      jest
        .spyOn(https, "get")
        .mockImplementation((url: any, options: any, callback: any) => {
          if (typeof options === "function") {
            callback = options;
          }

          process.nextTick(() => {
            callback(mockResponse);

            // Emit data chunks
            mockResponse.emit("data", mockAtomXml);
            mockResponse.emit("end");
          });

          return mockRequest;
        });

      const feed = {
        url: "https://www.gov.uk/government/organisations/foreign-commonwealth-development-office.atom",
        name: "UK FCDO",
        language: "en" as const,
      };

      const articles = await service["fetchFeedArticles"](feed);

      expect(articles).toHaveLength(2);
      expect(articles[0]).toEqual({
        title: "Foreign Secretary statement on Venezuela sanctions",
        source_url:
          "https://www.gov.uk/government/news/venezuela-sanctions-2026",
        content:
          "The UK has announced new sanctions targeting Venezuelan officials involved in human rights abuses.",
        published_at: new Date("2026-01-08T09:00:00Z"),
      });
      expect(articles[1]).toEqual({
        title: "Update on diplomatic relations with Venezuela",
        source_url:
          "https://www.gov.uk/government/news/venezuela-diplomatic-update",
        content:
          "The Foreign Secretary provided an update on UK-Venezuela diplomatic relations.",
        published_at: new Date("2026-01-06T15:00:00Z"),
      });
    });

    it("should handle malformed XML gracefully without crashing", async () => {
      const malformedXml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Broken Feed</title>
    <item>
      <title>Unclosed tag
    </item>
  </channel>`;

      // Mock HTTP response
      const mockResponse = new EventEmitter() as any;
      mockResponse.statusCode = 200;

      const mockRequest = new EventEmitter() as any;
      mockRequest.destroy = jest.fn();

      jest
        .spyOn(https, "get")
        .mockImplementation((url: any, options: any, callback: any) => {
          if (typeof options === "function") {
            callback = options;
          }

          process.nextTick(() => {
            callback(mockResponse);

            // Emit data chunks
            mockResponse.emit("data", malformedXml);
            mockResponse.emit("end");
          });

          return mockRequest;
        });

      const feed = {
        url: "https://example.com/broken-feed.xml",
        name: "Broken Feed",
        language: "en" as const,
      };

      await expect(service["fetchFeedArticles"](feed)).rejects.toThrow(
        /Failed to parse RSS/,
      );
    });

    it("should return empty array for non-RSS/Atom XML", async () => {
      const nonRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <record>
    <field>value</field>
  </record>
</data>`;

      // Mock HTTP response
      const mockResponse = new EventEmitter() as any;
      mockResponse.statusCode = 200;

      const mockRequest = new EventEmitter() as any;
      mockRequest.destroy = jest.fn();

      jest
        .spyOn(https, "get")
        .mockImplementation((url: any, options: any, callback: any) => {
          if (typeof options === "function") {
            callback = options;
          }

          process.nextTick(() => {
            callback(mockResponse);

            // Emit data chunks
            mockResponse.emit("data", nonRssXml);
            mockResponse.emit("end");
          });

          return mockRequest;
        });

      const feed = {
        url: "https://example.com/non-rss.xml",
        name: "Non-RSS Feed",
        language: "en" as const,
      };

      const articles = await service["fetchFeedArticles"](feed);

      expect(articles).toEqual([]);
    });
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

      // Common HTML entities should be converted to numeric/standard XML
      expect(sanitized).toContain("&#160;"); // &nbsp;
      expect(sanitized).toContain("&#8220;"); // &ldquo;
      expect(sanitized).toContain("&#8221;"); // &rdquo;
      expect(sanitized).toContain("&#8212;"); // &mdash;
      expect(sanitized).toContain("&#8230;"); // &hellip;
    });

    it("should handle mixed malformed and valid entities", () => {
      const mixedXml = `<?xml version="1.0"?>
        <rss>
          <item>
            <title>Test &amp; &lt; &gt; Example</title>
            <description>Unescaped & ampersand &nbsp; HTML entity</description>
          </item>
        </rss>`;

      const sanitized = (service as any).sanitizeXml(mixedXml);

      // Should preserve valid XML entities
      expect(sanitized).toContain("&amp;");
      expect(sanitized).toContain("&lt;");
      expect(sanitized).toContain("&gt;");
      // Should convert HTML entities
      expect(sanitized).toContain("&#160;");
    });
  });

  describe("Content-Type Detection", () => {
    it("should detect HTML content-type", () => {
      expect((service as any).isHtmlResponse("text/html")).toBe(true);
      expect((service as any).isHtmlResponse("text/html; charset=utf-8")).toBe(true);
    });

    it("should not flag XML/RSS content-types as HTML", () => {
      expect((service as any).isHtmlResponse("application/rss+xml")).toBe(false);
      expect((service as any).isHtmlResponse("application/xml")).toBe(false);
      expect((service as any).isHtmlResponse("text/xml")).toBe(false);
    });
  });

  describe("enqueueArticle", () => {
    it("should enqueue article with provided data", async () => {
      mockQueue.add.mockResolvedValueOnce({ id: "job-123" });

      const article = {
        title: "Test Article",
        sourceUrl: "https://example.com/test",
        content: "Test content",
        language: "es",
        source: "Test Source",
      };

      const jobId = await service.enqueueArticle(article);

      expect(jobId).toBe("job-123");
      expect(mockQueue.add).toHaveBeenCalledWith(
        "ingest-article",
        {
          title: "Test Article",
          sourceUrl: "https://example.com/test",
          content: "Test content",
          language: "es",
          source: "Test Source",
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        },
      );
    });

    it("should use default language if not provided", async () => {
      mockQueue.add.mockResolvedValueOnce({ id: "job-456" });

      const article = {
        title: "Test Article",
        sourceUrl: "https://example.com/test",
        content: "Test content",
      };

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
  });
});
