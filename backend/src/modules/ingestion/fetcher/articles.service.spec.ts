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
    repository = module.get<Repository<StgArticle>>(
      getRepositoryToken(StgArticle),
    );
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
      expect(mockArticleRepository.createQueryBuilder).toHaveBeenCalledWith("a");
    });
  });
});
