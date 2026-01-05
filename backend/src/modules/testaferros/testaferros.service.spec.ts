import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TestaferrosService } from "./testaferros.service";
import {
  Testaferro,
  TestaferroCategory,
  TestaferroStatus,
} from "../../entities";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { SourceType } from "../officials/dto/source.dto";

describe("TestaferrosService", () => {
  let service: TestaferrosService;

  const mockTestaferro: Testaferro = {
    id: "uuid-123",
    fullName: "Test Testaferro",
    aliases: undefined,
    identificationNumber: "V-12345678",
    identificationType: "cedula",
    dateOfBirth: "1980-01-01",
    nationality: "Venezuelan",
    beneficialOwnerId: undefined,
    beneficialOwner: undefined,
    relationshipToOfficial: "business associate",
    relationshipToOfficialEs: "socio comercial",
    category: TestaferroCategory.MONEY_LAUNDERER,
    status: TestaferroStatus.ACTIVE,
    statusNotes: undefined,
    description: "Test description",
    descriptionEs: "Descripción de prueba",
    country: "Venezuela",
    city: "Caracas",
    knownResidencies: undefined,
    estimatedWealthAmount: 1000000,
    knownAssets: undefined,
    bankAccounts: undefined,
    businessStakes: undefined,
    operatedBusinesses: [],
    bankingConnections: undefined,
    tradingPartners: undefined,
    knownAssociates: undefined,
    indictments: undefined,
    sanctions: undefined,
    casesInvolvement: undefined,
    confidenceLevel: 3,
    sources: [],
    evidenceSources: undefined,
    isDisputed: false,
    disputeNotes: undefined,
    dissolutionDate: undefined,
    notes: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestaferrosService,
        {
          provide: getRepositoryToken(Testaferro),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TestaferrosService>(TestaferrosService);

    // Setup default mockQueryBuilder return values
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTestaferro], 1]);
    mockQueryBuilder.getMany.mockResolvedValue([mockTestaferro]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a testaferro with default confidence level", async () => {
      const createDto = {
        fullName: "Test Testaferro",
        category: TestaferroCategory.MONEY_LAUNDERER,
      };

      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockResolvedValue(mockTestaferro);

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          confidenceLevel: 3,
          sources: [],
        }),
      );
    });

    it("should create a testaferro with sources", async () => {
      const createDto = {
        fullName: "Test Testaferro",
        category: TestaferroCategory.MONEY_LAUNDERER,
        sources: [
          {
            url: "https://ofac.treasury.gov/test",
            type: SourceType.OFFICIAL,
            title: "OFAC SDN List",
          },
        ],
        confidenceLevel: 5,
      };

      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockResolvedValue(mockTestaferro);

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: createDto.sources,
          confidenceLevel: 5,
        }),
      );
    });

    it("should throw BadRequestException when fullName is missing", async () => {
      const createDto = {
        category: TestaferroCategory.MONEY_LAUNDERER,
      } as any;

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        "Full name is required",
      );
    });

    it("should throw BadRequestException when category is missing", async () => {
      const createDto = {
        fullName: "Test Testaferro",
      } as any;

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        "Category is required",
      );
    });
  });

  describe("findOne", () => {
    it("should return a testaferro by id", async () => {
      mockRepository.findOne.mockResolvedValue(mockTestaferro);

      const result = await service.findOne("uuid-123");

      expect(result).toEqual(mockTestaferro);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "uuid-123" },
        relations: ["beneficialOwner"],
      });
    });

    it("should throw NotFoundException when testaferro not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne("invalid-id")).rejects.toThrow(
        "Testaferro with ID invalid-id not found",
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated list with confidence filter", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTestaferro], 1]);

      const result = await service.findAll(1, 20, {
        minConfidence: 4,
      });

      expect(result.data).toEqual([mockTestaferro]);
      expect(result.meta.total).toBe(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "t.confidenceLevel >= :minConfidence",
        { minConfidence: 4 },
      );
    });
  });
});
