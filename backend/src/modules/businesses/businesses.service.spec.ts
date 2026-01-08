import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BusinessesService } from "./businesses.service";
import { Business, BusinessCategory, BusinessStatus } from "../../entities";
import { NotFoundException } from "@nestjs/common";
import { SourceType } from "../officials/dto/source.dto";

describe("BusinessesService", () => {
  let service: BusinessesService;

  const mockBusiness: Business = {
    id: "uuid-123",
    name: "Test Business Corp",
    registrationNumber: "RIF-12345",
    country: "Venezuela",
    industry: "Energy",
    category: BusinessCategory.PDVSA_CONTRACTOR,
    status: BusinessStatus.SANCTIONED,
    aliases: [],
    estimatedContractValue: 1000000,
    estimatedTheftAmount: 500000,
    description: "Test description",
    descriptionEs: "Descripción de prueba",
    beneficialOwner: undefined,
    frontMan: "John Doe",
    contracts: [],
    sanctions: [],
    sources: [],
    confidenceLevel: 3,
    isDisputed: false,
    disputeDetails: undefined,
    dissolutionDate: undefined,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getMany: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
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
        BusinessesService,
        {
          provide: getRepositoryToken(Business),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BusinessesService>(BusinessesService);

    // Setup default mockQueryBuilder return values
    mockQueryBuilder.getCount.mockResolvedValue(1);
    mockQueryBuilder.getMany.mockResolvedValue([mockBusiness]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a business with default confidence level", async () => {
      const createDto = {
        name: "Test Business",
        category: BusinessCategory.PDVSA_CONTRACTOR,
      };

      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockResolvedValue(mockBusiness);

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          confidenceLevel: 3,
          sources: [],
        }),
      );
    });

    it("should create a business with sources", async () => {
      const createDto = {
        name: "Test Business",
        category: BusinessCategory.PDVSA_CONTRACTOR,
        sources: [
          {
            url: "https://ofac.treasury.gov/test",
            type: SourceType.OFFICIAL,
            title: "OFAC Report",
          },
        ],
        confidenceLevel: 5,
      };

      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockResolvedValue(mockBusiness);

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: createDto.sources,
          confidenceLevel: 5,
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return a business by id", async () => {
      mockRepository.findOne.mockResolvedValue(mockBusiness);

      const result = await service.findOne("uuid-123");

      expect(result).toEqual(mockBusiness);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "uuid-123" },
        relations: ["beneficialOwner"],
      });
    });

    it("should throw NotFoundException when business not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne("invalid-id")).rejects.toThrow(
        "Business with ID invalid-id not found",
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated list with confidence filter", async () => {
      mockQueryBuilder.getCount.mockResolvedValue(10);
      mockQueryBuilder.getMany.mockResolvedValue([mockBusiness]);

      const result = await service.findAll(1, 20, undefined, undefined, 4);

      expect(result.data).toEqual([mockBusiness]);
      expect(result.meta.total).toBe(10);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "business.confidence_level >= :minConfidence",
        { minConfidence: 4 },
      );
    });
  });
});
