import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TestaferroIngestionService } from "./testaferro-ingestion.service";
import { Testaferro } from "../../entities/testaferro.entity";
import { Official } from "../../entities/official.entity";
import { ImportTestaferroDto } from "./dto/import-testaferro.dto";

describe("TestaferroIngestionService", () => {
  let service: TestaferroIngestionService;

  const mockTestaferroRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockOfficialRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestaferroIngestionService,
        {
          provide: getRepositoryToken(Testaferro),
          useValue: mockTestaferroRepository,
        },
        {
          provide: getRepositoryToken(Official),
          useValue: mockOfficialRepository,
        },
      ],
    }).compile();

    service = module.get<TestaferroIngestionService>(
      TestaferroIngestionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("importFromJson", () => {
    it("should import valid testaferros successfully", async () => {
      const testData: ImportTestaferroDto[] = [
        {
          fullName: "Test Testaferro 1",
          confidenceLevel: 4,
          knownFor: "Money laundering",
          sources: [
            {
              url: "https://treasury.gov/test",
              type: "official" as any,
              title: "OFAC Sanction",
              publicationDate: "2020-01-01",
            },
          ],
        },
        {
          fullName: "Test Testaferro 2",
          confidenceLevel: 5,
          knownFor: "Corruption",
        },
      ];

      mockTestaferroRepository.findOne.mockResolvedValue(null);
      mockTestaferroRepository.create.mockImplementation((dto) => dto);
      mockTestaferroRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.importFromJson(testData);

      expect(result.imported).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockTestaferroRepository.save).toHaveBeenCalledTimes(2);
    });

    it("should handle duplicate entries gracefully", async () => {
      const testData: ImportTestaferroDto[] = [
        {
          fullName: "Existing Testaferro",
          confidenceLevel: 3,
        },
      ];

      mockTestaferroRepository.findOne.mockResolvedValue({
        id: "existing-id",
        fullName: "Existing Testaferro",
      });

      const result = await service.importFromJson(testData);

      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("already exists");
    });

    it("should link testaferro to related official when found", async () => {
      const mockOfficial = {
        id: "official-123",
        fullName: "Nicolás Maduro",
      };

      const testData: ImportTestaferroDto[] = [
        {
          fullName: "Test Testaferro",
          confidenceLevel: 5,
          relatedOfficialId: "official-123",
        },
      ];

      mockTestaferroRepository.findOne.mockResolvedValue(null);
      mockOfficialRepository.findOne.mockResolvedValue(mockOfficial);
      mockTestaferroRepository.create.mockImplementation((dto) => dto);
      mockTestaferroRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.importFromJson(testData);

      expect(result.imported).toBe(1);
      expect(mockOfficialRepository.findOne).toHaveBeenCalledWith({
        where: { id: "official-123" },
      });
    });

    it("should find official by name when ID not provided", async () => {
      const mockOfficial = {
        id: "official-123",
        fullName: "Nicolás Maduro",
      };

      const testData: ImportTestaferroDto[] = [
        {
          fullName: "Test Testaferro",
          confidenceLevel: 5,
          relatedOfficialName: "Maduro",
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockOfficial),
      };

      mockTestaferroRepository.findOne.mockResolvedValue(null);
      mockOfficialRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockTestaferroRepository.create.mockImplementation((dto) => dto);
      mockTestaferroRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.importFromJson(testData);

      expect(result.imported).toBe(1);
      expect(mockOfficialRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe("validateImportData", () => {
    it("should pass validation for valid data", () => {
      const validData: ImportTestaferroDto[] = [
        {
          fullName: "Valid Name",
          confidenceLevel: 4,
        },
      ];

      const result = service.validateImportData(validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail validation when fullName is missing", () => {
      const invalidData: ImportTestaferroDto[] = [
        {
          fullName: "",
          confidenceLevel: 4,
        },
      ];

      const result = service.validateImportData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Row 1: fullName is required");
    });

    it("should fail validation when confidenceLevel is out of range", () => {
      const invalidData: ImportTestaferroDto[] = [
        {
          fullName: "Test",
          confidenceLevel: 6,
        },
      ];

      const result = service.validateImportData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("must be between 1 and 5");
    });

    it("should fail validation when sources is not an array", () => {
      const invalidData: any[] = [
        {
          fullName: "Test",
          confidenceLevel: 4,
          sources: "not-an-array",
        },
      ];

      const result = service.validateImportData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("sources must be an array");
    });
  });

  describe("getImportStats", () => {
    it("should return correct statistics", async () => {
      mockTestaferroRepository.count.mockResolvedValue(100);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { level: 3, count: "30" },
          { level: 4, count: "50" },
          { level: 5, count: "20" },
        ]),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(75),
      };

      mockTestaferroRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const stats = await service.getImportStats();

      expect(stats.totalTestaferros).toBe(100);
      expect(stats.byConfidenceLevel[3]).toBe(30);
      expect(stats.byConfidenceLevel[4]).toBe(50);
      expect(stats.byConfidenceLevel[5]).toBe(20);
      expect(stats.withOfficialLinks).toBe(75);
      expect(stats.withoutOfficialLinks).toBe(25);
    });
  });
});
