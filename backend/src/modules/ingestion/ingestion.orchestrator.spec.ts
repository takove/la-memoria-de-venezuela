import { Test, TestingModule } from "@nestjs/testing";
import { IngestionOrchestrator } from "./ingestion.orchestrator";
import { ArticlesService } from "./fetcher/articles.service";
import { EntitiesService } from "./ner/entities.service";
import { WinkNerService } from "./ner/wink-ner.service";
import { MatchService } from "./match/match.service";

describe("IngestionOrchestrator", () => {
  let orchestrator: IngestionOrchestrator;

  const mockArticlesService = {
    findUnprocessedArticles: jest.fn(),
    findArticleById: jest.fn(),
  };

  const mockEntitiesService = {
    storeEntities: jest.fn(),
    storeRelations: jest.fn(),
  };

  const mockWinkNerService = {
    extractEntities: jest.fn(),
    extractRelations: jest.fn(),
  };

  const mockMatchService = {
    matchTier1ByName: jest.fn(),
    fuzzyMatchTier1: jest.fn(),
    upsertNode: jest.fn(),
    upsertEdge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionOrchestrator,
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
        {
          provide: EntitiesService,
          useValue: mockEntitiesService,
        },
        {
          provide: WinkNerService,
          useValue: mockWinkNerService,
        },
        {
          provide: MatchService,
          useValue: mockMatchService,
        },
      ],
    }).compile();

    orchestrator = module.get<IngestionOrchestrator>(IngestionOrchestrator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("processPipeline", () => {
    it("should process articles through full pipeline", async () => {
      const article = {
        id: "uuid-123",
        url: "https://test.com",
        cleanText: "Juan Pérez es testaferro de Nicolás Maduro",
      };

      mockArticlesService.findUnprocessedArticles.mockResolvedValueOnce([
        article,
      ]);
      mockArticlesService.findArticleById.mockResolvedValueOnce(article);
      mockWinkNerService.extractEntities.mockResolvedValueOnce([
        {
          rawText: "Juan Pérez",
          normText: "JUAN PEREZ",
          type: "PERSON",
          confidence: 0.8,
        },
      ]);
      mockWinkNerService.extractRelations.mockResolvedValueOnce([]);
      mockEntitiesService.storeEntities.mockResolvedValueOnce([
        {
          id: "entity-1",
          type: "PERSON",
          rawText: "Juan Pérez",
          normText: "JUAN PEREZ",
        },
      ]);
      mockEntitiesService.storeRelations.mockResolvedValueOnce([]);
      mockMatchService.matchTier1ByName.mockResolvedValueOnce(null);
      mockMatchService.fuzzyMatchTier1.mockResolvedValueOnce({
        id: "official-1",
        fullName: "Nicolas Maduro",
      });
      mockMatchService.upsertNode.mockResolvedValueOnce({
        id: "node-1",
        type: "person",
        canonicalName: "JUAN PEREZ",
      });

      const results = await orchestrator.processPipeline(10);

      expect(results).toHaveLength(1);
      expect(results[0].articleId).toBe("uuid-123");
      expect(results[0].entityCount).toBe(1);
      expect(results[0].tier1Match).toBe("official-1");
    });

    it("should handle errors gracefully", async () => {
      const article = {
        id: "uuid-456",
        url: "https://test2.com",
        cleanText: "Some article text",
      };

      mockArticlesService.findUnprocessedArticles.mockResolvedValueOnce([
        article,
      ]);
      mockArticlesService.findArticleById.mockResolvedValueOnce(article);
      mockWinkNerService.extractEntities.mockRejectedValueOnce(
        new Error("NER extraction failed"),
      );

      const results = await orchestrator.processPipeline(10);

      expect(results).toHaveLength(1);
      expect(results[0].errors).toContain("NER extraction failed");
    });

    it("should return empty results for no articles", async () => {
      mockArticlesService.findUnprocessedArticles.mockResolvedValueOnce([]);

      const results = await orchestrator.processPipeline(10);

      expect(results).toHaveLength(0);
    });
  });
});
