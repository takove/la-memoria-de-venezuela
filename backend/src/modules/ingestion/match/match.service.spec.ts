import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MatchService } from "./match.service";
import {
  Official,
  StgNode,
  StgEdge,
  StgEntity,
  StgNodeType,
  StgEdgeType,
} from "../../../entities";

describe("MatchService", () => {
  let service: MatchService;

  const mockOfficialRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockNodeRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEdgeRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEntityRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: getRepositoryToken(Official),
          useValue: mockOfficialRepository,
        },
        {
          provide: getRepositoryToken(StgNode),
          useValue: mockNodeRepository,
        },
        {
          provide: getRepositoryToken(StgEdge),
          useValue: mockEdgeRepository,
        },
        {
          provide: getRepositoryToken(StgEntity),
          useValue: mockEntityRepository,
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("upsertNode", () => {
    it("should create a new node", async () => {
      const dto = {
        type: StgNodeType.PERSON,
        canonicalName: "JUAN PEREZ",
        altNames: ["Juan Pérez"],
      };

      mockNodeRepository.findOne.mockResolvedValueOnce(null);
      mockOfficialRepository.findOne.mockResolvedValueOnce(null);
      mockNodeRepository.save.mockImplementation(async (node) => ({
        id: "uuid-node",
        ...node,
      }));

      const result = await service.upsertNode(dto);

      expect(result.id).toBe("uuid-node");
      expect(mockNodeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          canonicalName: "JUAN PEREZ",
          type: StgNodeType.PERSON,
        }),
      );
    });

    it("should update existing node with new alt names", async () => {
      const existing = {
        id: "uuid-node",
        type: StgNodeType.PERSON,
        canonicalName: "JUAN PEREZ",
        altNames: ["Juan Pérez"],
      };

      mockNodeRepository.findOne.mockResolvedValueOnce(existing);
      mockNodeRepository.save.mockResolvedValueOnce({
        ...existing,
        altNames: ["Juan Pérez", "John Perez"],
      });

      const result = await service.upsertNode({
        type: StgNodeType.PERSON,
        canonicalName: "JUAN PEREZ",
        altNames: ["John Perez"],
      });

      expect(result.altNames).toContain("John Perez");
    });
  });

  describe("upsertEdge", () => {
    it("should create a new edge", async () => {
      const srcNode = { id: "src-id" };
      const dstNode = { id: "dst-id" };

      mockEdgeRepository.findOne.mockResolvedValueOnce(null);
      mockNodeRepository.findOne
        .mockResolvedValueOnce(srcNode)
        .mockResolvedValueOnce(dstNode);
      mockEdgeRepository.create.mockReturnValueOnce({
        id: "uuid-edge",
        srcNode,
        dstNode,
        type: StgEdgeType.RELATION_PATTERN,
      });
      mockEdgeRepository.save.mockResolvedValueOnce({
        id: "uuid-edge",
        srcNode,
        dstNode,
        type: StgEdgeType.RELATION_PATTERN,
      });

      const result = await service.upsertEdge({
        srcNodeId: "src-id",
        dstNodeId: "dst-id",
        type: StgEdgeType.RELATION_PATTERN,
      });

      expect(result.id).toBe("uuid-edge");
      expect(mockEdgeRepository.create).toHaveBeenCalled();
    });
  });

  describe("matchTier1ByName", () => {
    it("should find official by exact name match", async () => {
      const official = {
        id: "official-id",
        fullName: "Nicolas Maduro Moros",
      };

      const mockQb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(official),
      };

      mockOfficialRepository.createQueryBuilder.mockReturnValueOnce(mockQb);

      const result = await service.matchTier1ByName("Nicolas Maduro");

      expect(result?.id).toBe("official-id");
      expect(mockOfficialRepository.createQueryBuilder).toHaveBeenCalledWith(
        "o",
      );
    });

    it("should return null if no match found", async () => {
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(null),
      };

      mockOfficialRepository.createQueryBuilder.mockReturnValueOnce(mockQb);

      const result = await service.matchTier1ByName("Unknown Person");

      expect(result).toBeNull();
    });
  });

  describe("fuzzyMatchTier1", () => {
    it("should find official by fuzzy match with shared words", async () => {
      const officials = [
        {
          id: "1",
          fullName: "Nicolas Maduro Moros",
          nationality: "Venezuelan",
        } as any,
      ];

      const mockQb = {
        where: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(officials),
      };

      mockOfficialRepository.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.fuzzyMatchTier1("Nicolas Maduro", 0.5);

      expect(result?.id).toBe("1");
    });
  });
});
