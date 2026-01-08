import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { OfficialsService } from "./officials.service";
import { Official, OfficialStatus } from "../../entities/official.entity";
import { NotFoundException } from "@nestjs/common";
import { SourceType } from "./dto/source.dto";

describe("OfficialsService", () => {
  let service: OfficialsService;

  const mockOfficial: Official = {
    id: "uuid-123",
    firstName: "Nicolás",
    lastName: "Maduro",
    fullName: "Nicolás Maduro Moros",
    aliases: [],
    birthDate: undefined,
    birthPlace: undefined,
    nationality: "Venezuelan",
    cedula: undefined,
    passportNumber: undefined,
    biography: "Test biography",
    biographyEs: "Biografía de prueba",
    status: OfficialStatus.ACTIVE,
    confidenceLevel: 5,
    sources: [],
    photoUrl: undefined,
    metadata: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    sanctions: [],
    caseInvolvements: [],
    testaferros: [],
  } as any;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
    getRawMany: jest.fn(),
  };

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficialsService,
        {
          provide: getRepositoryToken(Official),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OfficialsService>(OfficialsService);

    // Setup default mockQueryBuilder return values
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockOfficial], 1]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated list of officials", async () => {
      const officials = [mockOfficial];
      mockRepository.findAndCount.mockResolvedValue([officials, 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(officials);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it("should handle pagination correctly", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockOfficial], 50]);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.meta).toEqual({
        total: 50,
        page: 2,
        limit: 10,
        totalPages: 5,
      });
    });

    it("should use default pagination values", async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });
  });

  describe("findOne", () => {
    it("should return an official by id", async () => {
      mockRepository.findOne.mockResolvedValue(mockOfficial);

      const result = await service.findOne("uuid-123");

      expect(result).toEqual(mockOfficial);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "uuid-123" },
        relations: ["sanctions", "caseInvolvements", "caseInvolvements.case"],
      });
    });

    it("should throw NotFoundException when official not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne("invalid-id")).rejects.toThrow(
        "Official with ID invalid-id not found",
      );
    });
  });

  describe("create", () => {
    it("should create a new official", async () => {
      const createDto = {
        firstName: "Test",
        lastName: "Official",
        status: OfficialStatus.ACTIVE,
        confidenceLevel: 3,
      };

      const expectedData = {
        ...createDto,
        fullName: "Test Official",
        confidenceLevel: 3,
        sources: [],
      };

      mockRepository.create.mockReturnValue(mockOfficial);
      mockRepository.save.mockResolvedValue(mockOfficial);

      const result = await service.create(createDto);

      expect(result).toEqual(mockOfficial);
      expect(mockRepository.create).toHaveBeenCalledWith(expectedData);
      expect(mockRepository.save).toHaveBeenCalledWith(mockOfficial);
    });

    it("should create official with default confidence level of 3", async () => {
      const createDto = {
        firstName: "Test",
        lastName: "Official",
      };

      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockResolvedValue(mockOfficial);

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          confidenceLevel: 3,
          sources: [],
        }),
      );
    });

    it("should create official with sources", async () => {
      const createDto = {
        firstName: "Test",
        lastName: "Official",
        sources: [
          {
            url: "https://ofac.treasury.gov/test",
            type: SourceType.OFFICIAL,
            title: "OFAC Sanctions",
          },
        ],
        confidenceLevel: 5,
      };

      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockResolvedValue(mockOfficial);

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: createDto.sources,
          confidenceLevel: 5,
        }),
      );
    });
  });

  describe("getStatistics", () => {
    it("should return statistics about officials", async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { status: "active", count: "10" },
        { status: "inactive", count: "5" },
      ]);
      mockQueryBuilder.getCount.mockResolvedValue(5);

      mockRepository.count.mockResolvedValue(15);

      const result = await service.getStatistics();

      expect(result.total).toBe(15);
      expect(result.byStatus).toHaveLength(2);
      expect(result.byStatus[0]).toHaveProperty("status", "active");
      expect(result.byStatus[0]).toHaveProperty("count");
      expect(mockRepository.count).toHaveBeenCalled();
    });
  });
});
