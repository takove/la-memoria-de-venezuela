import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ArticlesService } from "./articles.service";
import { StgArticle, StgEntity } from "../../../entities";

describe("ArticlesService", () => {
  let service: ArticlesService;

  const mockArticleRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEntityRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(StgArticle),
          useValue: mockArticleRepository,
        },
        {
          provide: getRepositoryToken(StgEntity),
          useValue: mockEntityRepository,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("ingestArticle", () => {
    it("should ingest a new article", async () => {
      const dto = {
        outlet: "armando.info",
        title: "Test Article",
        url: "https://armando.info/test",
        lang: "es",
        cleanText: "Test content",
      };

      mockArticleRepository.findOne.mockResolvedValueOnce(null);
      const createdArticle = {
        ...dto,
        id: "uuid-123",
        contentHash: expect.any(String),
        retrievedAt: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockArticleRepository.create.mockReturnValueOnce(createdArticle);
      mockArticleRepository.save.mockResolvedValueOnce(createdArticle);

      const result = await service.ingestArticle(dto);

      expect(result?.id).toBe("uuid-123");
      expect(mockArticleRepository.findOne).toHaveBeenCalled();
      expect(mockArticleRepository.create).toHaveBeenCalled();
      expect(mockArticleRepository.save).toHaveBeenCalled();
    });

    it("should return existing article if already ingested by URL", async () => {
      const existing = {
        id: "uuid-456",
        url: "https://armando.info/test",
        outlet: "armando.info",
      };

      mockArticleRepository.findOne.mockResolvedValueOnce(existing);

      const result = await service.ingestArticle({
        outlet: "armando.info",
        title: "Test Article",
        url: "https://armando.info/test",
        lang: "es",
      });

      expect(result.id).toBe("uuid-456");
      expect(mockArticleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("findUnprocessedArticles", () => {
    it("should find articles without entities", async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([
          {
            id: "uuid-789",
            url: "https://test.com",
            outlet: "test",
            entities: [],
          },
        ]),
      };

      mockArticleRepository.createQueryBuilder.mockReturnValueOnce(
        mockQueryBuilder,
      );

      const result = await service.findUnprocessedArticles(10);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("uuid-789");
      expect(mockArticleRepository.createQueryBuilder).toHaveBeenCalledWith(
        "a",
      );
    });
  });

  describe("ingestArticle - URL Normalization & Dedup", () => {
    it("should call findOne to check for duplicates by canonical URL", async () => {
      const dto = {
        outlet: "test",
        title: "Article",
        url: "https://example.com/article?utm_source=fb",
        lang: "es",
        rawHtml:
          '<link rel="canonical" href="https://example.com/canonical" />',
        cleanText: "Content",
      };

      mockArticleRepository.findOne.mockResolvedValue(null);
      mockArticleRepository.create.mockReturnValue({
        ...dto,
        id: "uuid",
        contentHash: "hash",
        retrievedAt: new Date(),
        normalizedUrl: "https://example.com/article",
        canonicalUrl: "https://example.com/canonical",
      });
      mockArticleRepository.save.mockResolvedValue({
        ...dto,
        id: "uuid",
        contentHash: "hash",
        retrievedAt: new Date(),
        normalizedUrl: "https://example.com/article",
        canonicalUrl: "https://example.com/canonical",
      });

      const result = await service.ingestArticle(dto);

      // Verify the service looked for duplicates
      expect(mockArticleRepository.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should attempt to find existing articles before creating", async () => {
      const dto = {
        outlet: "test",
        title: "Article",
        url: "https://example.com/article",
        lang: "es",
        cleanText: "Content",
      };

      mockArticleRepository.findOne.mockResolvedValue(null);
      mockArticleRepository.create.mockReturnValue({
        ...dto,
        id: "uuid",
        contentHash: expect.any(String),
        retrievedAt: expect.any(Date),
      });
      mockArticleRepository.save.mockResolvedValue({
        ...dto,
        id: "uuid",
        contentHash: expect.any(String),
        retrievedAt: expect.any(Date),
      });

      await service.ingestArticle(dto);

      // Verify duplicate checking
      expect(mockArticleRepository.findOne).toHaveBeenCalled();
      expect(mockArticleRepository.create).toHaveBeenCalled();
      expect(mockArticleRepository.save).toHaveBeenCalled();
    });

    it("should return existing article when found", async () => {
      const existing = {
        id: "uuid-existing",
        url: "https://example.com/article",
        outlet: "test",
        title: "Article",
        normalizedUrl: "https://example.com/article",
      };

      mockArticleRepository.findOne.mockResolvedValue(existing);

      const result = await service.ingestArticle({
        outlet: "test",
        title: "Article",
        url: "https://example.com/article?utm_source=twitter",
        lang: "es",
      });

      expect(result.id).toBe("uuid-existing");
      expect(mockArticleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("RSS Feed Error Handling", () => {
    it("should handle articles with malformed content gracefully", async () => {
      // Simulate an article that might come from a malformed RSS feed
      const malformedDto = {
        outlet: "test-outlet",
        title: "Article & Title with &nbsp; entities",
        url: "https://example.com/malformed",
        lang: "es",
        cleanText: "Content with special chars: & < > ' \"",
      };

      mockArticleRepository.findOne.mockResolvedValue(null);
      const createdArticle = {
        ...malformedDto,
        id: "uuid-malformed",
        contentHash: expect.any(String),
        retrievedAt: expect.any(Date),
        normalizedUrl: "https://example.com/malformed",
      };
      mockArticleRepository.create.mockReturnValueOnce(createdArticle);
      mockArticleRepository.save.mockResolvedValueOnce(createdArticle);

      const result = await service.ingestArticle(malformedDto);

      // Should successfully ingest even with special characters
      expect(result?.id).toBe("uuid-malformed");
      expect(mockArticleRepository.save).toHaveBeenCalled();
    });

    it("should compute different hashes for different content", async () => {
      const article1 = {
        outlet: "test",
        title: "Article 1",
        url: "https://test.com/1",
        lang: "es",
        cleanText: "Content 1",
      };

      const article2 = {
        outlet: "test",
        title: "Article 2",
        url: "https://test.com/2",
        lang: "es",
        cleanText: "Content 2",
      };

      mockArticleRepository.findOne.mockResolvedValue(null);
      mockArticleRepository.create.mockImplementation((dto) => ({
        ...dto,
        id: `uuid-${dto.url}`,
      }));
      mockArticleRepository.save.mockImplementation((article) =>
        Promise.resolve(article),
      );

      const result1 = await service.ingestArticle(article1);
      const result2 = await service.ingestArticle(article2);

      // Different content should produce different hashes
      expect(result1.contentHash).not.toBe(result2.contentHash);
    });
  });
});
