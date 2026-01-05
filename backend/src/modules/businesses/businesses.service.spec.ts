import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BusinessesService } from "./businesses.service";
import { Business } from "../../entities";
import { CreateBusinessDto, SourceType } from "./dto/create-business.dto";

describe("BusinessesService", () => {
  let service: BusinessesService;

  const mockBusiness: Business = {
    id: "business-123",
    name: "Test Business",
    confidenceLevel: 3,
    sources: [],
  } as unknown as Business;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a business with sources", async () => {
      const payload = {
        name: "Test Business",
        sources: [
          {
            url: "https://example.com/source",
            type: SourceType.OFFICIAL,
          },
        ],
      };

      mockRepository.create.mockReturnValue(mockBusiness);
      mockRepository.save.mockResolvedValue(mockBusiness);

      await service.create(payload);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: payload.sources,
        }),
      );
    });

    it("should default confidence level to 3", async () => {
      const payload = {
        name: "Test Business",
      };

      mockRepository.create.mockReturnValue(mockBusiness);
      mockRepository.save.mockResolvedValue(mockBusiness);

      await service.create(payload);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          confidenceLevel: 3,
          sources: [],
        }),
      );
    });
  });

  describe("update", () => {
    it("should update confidence level", async () => {
      const updatedBusiness = { ...mockBusiness, confidenceLevel: 4 };
      mockRepository.findOne.mockResolvedValue(mockBusiness);
      mockRepository.save.mockResolvedValue(updatedBusiness);

      const result = await service.update("business-123", {
        confidenceLevel: 4,
      });

      expect(result.confidenceLevel).toBe(4);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ confidenceLevel: 4 }),
      );
    });
  });

  describe("validation", () => {
    it("should validate sources payload", async () => {
      const dto = plainToInstance(CreateBusinessDto, {
        sources: [
          {
            url: "https://example.com/source",
            type: SourceType.COURT,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should reject invalid sources payload", async () => {
      const dto = plainToInstance(CreateBusinessDto, {
        sources: "invalid",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should allow null sources", async () => {
      const dto = plainToInstance(CreateBusinessDto, {
        sources: null,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
