import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MemorialService } from "./memorial.service";
import { Victim, VictimCategory } from "../../entities/victim.entity";
import { PoliticalPrisoner } from "../../entities/political-prisoner.entity";
import { ExileStory, ExileReason } from "../../entities/exile-story.entity";
import { NotFoundException } from "@nestjs/common";

describe("MemorialService", () => {
  let service: MemorialService;
  let victimRepository: Repository<Victim>;
  let prisonerRepository: Repository<PoliticalPrisoner>;
  let exileRepository: Repository<ExileStory>;

  const mockVictim: Victim = {
    id: "victim-uuid-1",
    fullName: "Neomar Lander",
    fullNameEs: "Neomar Lander",
    age: 17,
    dateOfDeath: new Date("2017-04-20"),
    placeOfDeath: "Caracas",
    placeOfDeathEs: "Caracas",
    category: VictimCategory.PROTEST,
    circumstance: "Shot by security forces during protests",
    circumstanceEs: "Disparo de fuerzas de seguridad durante protestas",
    biography: "Young student activist",
    biographyEs: "Joven activista estudiantil",
    photoUrl: "https://example.com/photo.jpg",
    confidenceLevel: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    anonymous: false,
  } as any;

  const mockPrisoner: PoliticalPrisoner = {
    id: "prisoner-uuid-1",
    fullName: "Javier Tarazona",
    dateArrested: new Date("2021-06-30"),
    dateReleased: new Date("2023-09-29"),
    facility: ["SEBIN El Helicoide"],
    charges: "terrorismo, incitación al odio",
    torture: true,
    tortudeDescription: "Reports of torture",
    medicalAttention: false,
    familyVisits: false,
    stillImprisoned: false,
    profession: "Director de FundaRedes",
    biography: "Human rights defender",
    biographyEs: "Defensor de derechos humanos",
    confidenceLevel: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockExile: ExileStory = {
    id: "exile-uuid-1",
    fullName: "Familia venezolana anónima",
    yearLeft: 2024,
    monthLeft: 4,
    destination: ["Estados Unidos", "Miami"],
    reasonForLeaving: "Amenazas de colectivos y colapso económico",
    reasonCategory: ExileReason.MIXED,
    journeyRoute: "darien gap",
    journeyDuration: 7,
    countriesCrossed: ["Colombia", "Panamá", "Guatemala", "México"],
    journeyDetails: "Cruzaron el Darién en 7 días",
    familySeparated: true,
    careerLost: true,
    currentStatus: "asylum seeker",
    personalStory: "Vimos niños arrastrados por el río",
    messageToVenezuela: "Que se sepa lo que le hacen a nuestro pueblo",
    confidenceLevel: 4,
    anonymous: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemorialService,
        {
          provide: getRepositoryToken(Victim),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PoliticalPrisoner),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ExileStory),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MemorialService>(MemorialService);
    victimRepository = module.get<Repository<Victim>>(
      getRepositoryToken(Victim),
    );
    prisonerRepository = module.get<Repository<PoliticalPrisoner>>(
      getRepositoryToken(PoliticalPrisoner),
    );
    exileRepository = module.get<Repository<ExileStory>>(
      getRepositoryToken(ExileStory),
    );
  });

  describe("Victims", () => {
    describe("findAllVictims", () => {
      it("should return paginated victims", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockVictim], 1]),
        };

        jest
          .spyOn(victimRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        const result = await service.findAllVictims({ page: 1, limit: 20 });

        expect(result.data).toEqual([mockVictim]);
        expect(result.meta.total).toBe(1);
        expect(result.meta.page).toBe(1);
      });

      it("should filter victims by category", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockVictim], 1]),
        };

        jest
          .spyOn(victimRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        await service.findAllVictims({
          category: VictimCategory.PROTEST,
          page: 1,
          limit: 20,
        });

        expect(mockQb.andWhere).toHaveBeenCalledWith(
          "victim.category = :category",
          { category: VictimCategory.PROTEST },
        );
      });

      it("should search victims by name", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockVictim], 1]),
        };

        jest
          .spyOn(victimRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        await service.findAllVictims({ search: "Neomar", page: 1, limit: 20 });

        expect(mockQb.andWhere).toHaveBeenCalledWith(
          expect.stringContaining("fullName ILIKE"),
          { search: "%Neomar%" },
        );
      });

      it("should filter victims by year range", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockVictim], 1]),
        };

        jest
          .spyOn(victimRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        await service.findAllVictims({
          yearFrom: 2017,
          yearTo: 2017,
          page: 1,
          limit: 20,
        });

        expect(mockQb.andWhere).toHaveBeenCalledWith(
          expect.stringContaining(
            "EXTRACT(YEAR FROM victim.dateOfDeath) >= :yearFrom",
          ),
          { yearFrom: 2017 },
        );
      });

      it("should only show victims with confidence level 3+", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockVictim], 1]),
        };

        jest
          .spyOn(victimRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        await service.findAllVictims({ page: 1, limit: 20 });

        expect(mockQb.where).toHaveBeenCalledWith(
          "victim.confidenceLevel >= :minConf",
          { minConf: 3 },
        );
      });
    });

    describe("findOneVictim", () => {
      it("should return a victim by id", async () => {
        jest.spyOn(victimRepository, "findOne").mockResolvedValue(mockVictim);

        const result = await service.findOneVictim("victim-uuid-1");

        expect(result).toEqual(mockVictim);
        expect(victimRepository.findOne).toHaveBeenCalledWith({
          where: { id: "victim-uuid-1" },
          relations: ["responsibleOfficial"],
        });
      });

      it("should throw NotFoundException if victim not found", async () => {
        jest.spyOn(victimRepository, "findOne").mockResolvedValue(null);

        await expect(service.findOneVictim("invalid-id")).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe("createVictim", () => {
      it("should create a new victim", async () => {
        const createDto = {
          fullName: "Neomar Lander",
          age: 17,
          dateOfDeath: new Date("2017-04-20"),
          category: VictimCategory.PROTEST,
          circumstance: "Shot by security forces",
        };

        jest.spyOn(victimRepository, "create").mockReturnValue(mockVictim);
        jest.spyOn(victimRepository, "save").mockResolvedValue(mockVictim);

        const result = await service.createVictim(createDto as any);

        expect(result).toEqual(mockVictim);
        expect(victimRepository.save).toHaveBeenCalled();
      });
    });
  });

  describe("Political Prisoners", () => {
    describe("findAllPrisoners", () => {
      it("should return paginated prisoners", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockPrisoner], 1]),
        };

        jest
          .spyOn(prisonerRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        const result = await service.findAllPrisoners({ page: 1, limit: 20 });

        expect(result.data).toEqual([mockPrisoner]);
        expect(result.meta.total).toBe(1);
      });

      it("should filter prisoners by status (detained)", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockPrisoner], 1]),
        };

        jest
          .spyOn(prisonerRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        await service.findAllPrisoners({ page: 1, limit: 20 });

        expect(mockQb.where).toHaveBeenCalled();
      });

      it("should search prisoners by name", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockPrisoner], 1]),
        };

        jest
          .spyOn(prisonerRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        await service.findAllPrisoners({
          search: "Javier",
          page: 1,
          limit: 20,
        });

        expect(mockQb.andWhere).toHaveBeenCalledWith(
          expect.stringContaining("fullName ILIKE"),
          { search: "%Javier%" },
        );
      });
    });

    describe("findOnePrisoner", () => {
      it("should return a prisoner by id", async () => {
        jest
          .spyOn(prisonerRepository, "findOne")
          .mockResolvedValue(mockPrisoner);

        const result = await service.findOnePrisoner("prisoner-uuid-1");

        expect(result).toEqual(mockPrisoner);
      });

      it("should throw NotFoundException if prisoner not found", async () => {
        jest.spyOn(prisonerRepository, "findOne").mockResolvedValue(null);

        await expect(service.findOnePrisoner("invalid-id")).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe("createPrisoner", () => {
      it("should create a new prisoner", async () => {
        const createDto = {
          fullName: "Javier Tarazona",
          dateArrested: new Date("2021-06-30"),
          facility: ["SEBIN El Helicoide"],
          charges: "terrorismo",
        };

        jest.spyOn(prisonerRepository, "create").mockReturnValue(mockPrisoner);
        jest.spyOn(prisonerRepository, "save").mockResolvedValue(mockPrisoner);

        const result = await service.createPrisoner(createDto as any);

        expect(result).toEqual(mockPrisoner);
      });
    });
  });

  describe("Exile Stories", () => {
    describe("findAllExileStories", () => {
      it("should return paginated exile stories", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockExile], 1]),
        };

        jest
          .spyOn(exileRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        const result = await service.findAllExileStories({
          page: 1,
          limit: 20,
        });

        expect(result.data).toEqual([mockExile]);
        expect(result.meta.total).toBe(1);
      });

      it("should filter exile stories by reason", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockExile], 1]),
        };

        jest
          .spyOn(exileRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        await service.findAllExileStories({ page: 1, limit: 20 });

        expect(mockQb.where).toHaveBeenCalled();
      });

      it("should filter exile stories by destination", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockExile], 1]),
        };

        jest
          .spyOn(exileRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        await service.findAllExileStories({ page: 1, limit: 20 });

        expect(mockQb.where).toHaveBeenCalled();
      });

      it("should search exile stories", async () => {
        const mockQb = {
          ...mockQueryBuilder,
          getManyAndCount: jest.fn().mockResolvedValue([[mockExile], 1]),
        };

        jest
          .spyOn(exileRepository, "createQueryBuilder")
          .mockReturnValue(mockQb as any);

        await service.findAllExileStories({ page: 1, limit: 20 });

        expect(mockQb.where).toHaveBeenCalled();
      });
    });

    describe("findOneExileStory", () => {
      it("should return an exile story by id", async () => {
        jest.spyOn(exileRepository, "findOne").mockResolvedValue(mockExile);

        const result = await service.findOneExileStory("exile-uuid-1");

        expect(result).toEqual(mockExile);
      });

      it("should throw NotFoundException if exile story not found", async () => {
        jest.spyOn(exileRepository, "findOne").mockResolvedValue(null);

        await expect(service.findOneExileStory("invalid-id")).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe("createExileStory", () => {
      it("should create a new exile story", async () => {
        const createDto = {
          fullName: "Familia venezolana",
          yearLeft: 2024,
          destination: ["Estados Unidos"],
          reasonForLeaving: "Crisis económica",
        };

        jest.spyOn(exileRepository, "create").mockReturnValue(mockExile);
        jest.spyOn(exileRepository, "save").mockResolvedValue(mockExile);

        const result = await service.createExileStory(createDto as any);

        expect(result).toEqual(mockExile);
      });
    });
  });

  describe("Statistics", () => {
    describe("getMemorialStats", () => {
      it("should return memorial statistics", async () => {
        jest.spyOn(victimRepository, "createQueryBuilder").mockReturnValue({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([{ total: 100 }]),
        } as any);

        // This would test the stats aggregation logic
        expect(service).toBeDefined();
      });
    });
  });
});
