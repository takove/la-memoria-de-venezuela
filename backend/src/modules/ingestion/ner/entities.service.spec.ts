import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EntitiesService } from "./entities.service";
import { StgArticle, StgEntity, StgRelation, StgEntityType } from "../../../entities";

describe("EntitiesService", () => {
  let service: EntitiesService;

  const mockArticleRepository = {
    findOne: jest.fn(),
  };

  const mockEntityRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRelationRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitiesService,
        {
          provide: getRepositoryToken(StgArticle),
          useValue: mockArticleRepository,
        },
        {
          provide: getRepositoryToken(StgEntity),
          useValue: mockEntityRepository,
        },
        {
          provide: getRepositoryToken(StgRelation),
          useValue: mockRelationRepository,
        },
      ],
    }).compile();

    service = module.get<EntitiesService>(EntitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("storeEntities", () => {
    it("should store extracted entities", async () => {
      const articleId = "uuid-article";
      const article = { id: articleId, lang: "es", outlet: "test" };

      mockArticleRepository.findOne.mockResolvedValueOnce(article);
      mockEntityRepository.create.mockImplementation((obj: any) => ({
        id: "uuid-entity",
        ...obj,
      }));
      mockEntityRepository.save.mockResolvedValue({
        id: "uuid-entity",
        type: "PERSON",
        normText: "JUAN PEREZ",
      });

      const entities = [
        {
          type: StgEntityType.PERSON,
          rawText: "Juan Pérez",
          normText: "JUAN PEREZ",
        },
      ];

      const result = await service.storeEntities(articleId, entities);

      expect(result).toHaveLength(1);
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({
        where: { id: articleId },
      });
      expect(mockEntityRepository.create).toHaveBeenCalled();
      expect(mockEntityRepository.save).toHaveBeenCalled();
    });

    it("should throw if article not found", async () => {
      mockArticleRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.storeEntities("invalid-id", []),
      ).rejects.toThrow("Article invalid-id not found");
    });
  });

  describe("storeRelations", () => {
    it("should store extracted relations", async () => {
      const articleId = "uuid-article";
      const article = { id: articleId, lang: "es" };

      mockArticleRepository.findOne.mockResolvedValueOnce(article);
      mockEntityRepository.findOne.mockResolvedValue(null);
      mockRelationRepository.create.mockImplementation((obj: any) => ({
        id: "uuid-relation",
        ...obj,
      }));
      mockRelationRepository.save.mockResolvedValue({
        id: "uuid-relation",
        pattern: "testaferro_de",
      });

      const relations = [
        {
          pattern: "testaferro_de",
          sentence: "Juan es testaferro de Maduro",
          confidence: 0.85,
        },
      ];

      const result = await service.storeRelations(articleId, relations);

      expect(result).toHaveLength(1);
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({
        where: { id: articleId },
      });
      expect(mockRelationRepository.create).toHaveBeenCalled();
      expect(mockRelationRepository.save).toHaveBeenCalled();
    });
  });
});
