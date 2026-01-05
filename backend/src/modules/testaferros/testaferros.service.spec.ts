import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { TestaferrosService } from "./testaferros.service";
import { Testaferro, TestaferroCategory } from "../../entities";
import { CreateTestaferroDto, SourceType } from "./dto/create-testaferro.dto";

describe("TestaferrosService", () => {
  let service: TestaferrosService;

  const mockTestaferro: Testaferro = {
    id: "testaferro-123",
    fullName: "Testaferro One",
    category: TestaferroCategory.BUSINESS_FRONT,
    confidenceLevel: 3,
    sources: [],
  } as unknown as Testaferro;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a testaferro with sources", async () => {
      const payload = {
        fullName: "Testaferro One",
        category: TestaferroCategory.BUSINESS_FRONT,
        sources: [
          {
            url: "https://example.com/source",
            type: SourceType.ACADEMIC,
          },
        ],
      };

      mockRepository.create.mockReturnValue(mockTestaferro);
      mockRepository.save.mockResolvedValue(mockTestaferro);

      await service.create(payload);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: payload.sources,
        }),
      );
    });

    it("should default confidence level to 3", async () => {
      const payload = {
        fullName: "Testaferro One",
        category: TestaferroCategory.BUSINESS_FRONT,
      };

      mockRepository.create.mockReturnValue(mockTestaferro);
      mockRepository.save.mockResolvedValue(mockTestaferro);

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
      const updatedTestaferro = { ...mockTestaferro, confidenceLevel: 5 };
      mockRepository.findOne.mockResolvedValue(mockTestaferro);
      mockRepository.save.mockResolvedValue(updatedTestaferro);

      const result = await service.update("testaferro-123", {
        confidenceLevel: 5,
      });

      expect(result.confidenceLevel).toBe(5);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ confidenceLevel: 5 }),
      );
    });
  });

  describe("validation", () => {
    it("should validate sources payload", async () => {
      const dto = plainToInstance(CreateTestaferroDto, {
        sources: [
          {
            url: "https://example.com/source",
            type: SourceType.OFFICIAL,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should reject invalid sources payload", async () => {
      const dto = plainToInstance(CreateTestaferroDto, {
        sources: "invalid",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should allow null sources", async () => {
      const dto = plainToInstance(CreateTestaferroDto, {
        sources: null,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
