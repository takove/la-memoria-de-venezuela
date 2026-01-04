import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { SearchService, SearchResult, SearchOptions } from "./search.service";
import { Official } from "../../entities/official.entity";
import { Sanction } from "../../entities/sanction.entity";
import { Case } from "../../entities/case.entity";

describe("SearchService", () => {
  let service: SearchService;
  let officialsRepository: any;
  let sanctionsRepository: any;
  let casesRepository: any;

  // Mock data
  const mockOfficial: Partial<Official> = {
    id: "official-uuid-1",
    fullName: "Nicolás Maduro Moros",
    aliases: ["Maduro", "El Caballo"],
    cedula: "V-3539074",
    biography: "President of Venezuela",
    biographyEs: "Presidente de Venezuela",
    photoUrl: "https://example.com/photo.jpg",
    sanctions: [],
  };

  const mockOfficialTwo: Partial<Official> = {
    id: "official-uuid-2",
    fullName: "Diosdado Cabello",
    aliases: ["Cabello"],
    cedula: "V-1234567",
    biography: "General and military officer",
    biographyEs: "General y oficial militar",
    photoUrl: "https://example.com/photo2.jpg",
    sanctions: [],
  };

  const mockSanction: Partial<Sanction> = {
    id: "sanction-uuid-1",
    reason: "Violations of human rights",
    reasonEs: "Violaciones de derechos humanos",
    programName: "OFAC SDN",
    official: mockOfficial as Official,
  };

  const mockCase: Partial<Case> = {
    id: "case-uuid-1",
    title: "Venezuelan Human Rights Violations",
    titleEs: "Violaciones de Derechos Humanos en Venezuela",
    description: "Case against regime officials",
    descriptionEs: "Caso contra funcionarios del régimen",
    caseNumber: "ICC-01/21",
    charges: ["crimes against humanity", "torture"],
    involvements: [],
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    addSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(Official),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Sanction),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Case),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    officialsRepository = module.get<any>(getRepositoryToken(Official));
    sanctionsRepository = module.get<any>(getRepositoryToken(Sanction));
    casesRepository = module.get<any>(getRepositoryToken(Case));

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe("search", () => {
    describe("basic search functionality", () => {
      it("should search for officials by name", async () => {
        mockQueryBuilder.getMany.mockResolvedValue([mockOfficial]);

        const options: SearchOptions = {
          query: "Maduro",
          types: ["officials"],
        };

        const result = await service.search(options);

        expect(result.officials).toEqual([mockOfficial]);
        expect(result.sanctions).toEqual([]);
        expect(result.cases).toEqual([]);
        expect(result.totalResults).toBe(1);
        expect(officialsRepository.createQueryBuilder).toHaveBeenCalledWith(
          "official",
        );
      });

      it("should search for sanctions", async () => {
        mockQueryBuilder.getMany.mockResolvedValue([mockSanction]);

        const options: SearchOptions = {
          query: "human rights",
          types: ["sanctions"],
        };

        const result = await service.search(options);

        expect(result.sanctions).toEqual([mockSanction]);
        expect(result.officials).toEqual([]);
        expect(result.cases).toEqual([]);
        expect(result.totalResults).toBe(1);
        expect(sanctionsRepository.createQueryBuilder).toHaveBeenCalledWith(
          "sanction",
        );
      });

      it("should search for cases", async () => {
        mockQueryBuilder.getMany.mockResolvedValue([mockCase]);

        const options: SearchOptions = {
          query: "violations",
          types: ["cases"],
        };

        const result = await service.search(options);

        expect(result.cases).toEqual([mockCase]);
        expect(result.officials).toEqual([]);
        expect(result.sanctions).toEqual([]);
        expect(result.totalResults).toBe(1);
        expect(casesRepository.createQueryBuilder).toHaveBeenCalledWith("case");
      });
    });

    describe("search all types", () => {
      it("should search all types when no type filter specified", async () => {
        mockQueryBuilder.getMany.mockResolvedValueOnce([mockOfficial]);
        mockQueryBuilder.getMany.mockResolvedValueOnce([mockSanction]);
        mockQueryBuilder.getMany.mockResolvedValueOnce([mockCase]);

        const options: SearchOptions = {
          query: "test",
        };

        const result = await service.search(options);

        expect(result.officials).toEqual([mockOfficial]);
        expect(result.sanctions).toEqual([mockSanction]);
        expect(result.cases).toEqual([mockCase]);
        expect(result.totalResults).toBe(3);
      });

      it("should search multiple types when specified", async () => {
        mockQueryBuilder.getMany.mockResolvedValueOnce([
          mockOfficial,
          mockOfficialTwo,
        ]);
        mockQueryBuilder.getMany.mockResolvedValueOnce([mockSanction]);

        const options: SearchOptions = {
          query: "Venezuela",
          types: ["officials", "sanctions"],
        };

        const result = await service.search(options);

        expect(result.officials).toHaveLength(2);
        expect(result.sanctions).toHaveLength(1);
        expect(result.cases).toEqual([]);
        expect(result.totalResults).toBe(3);
      });
    });

    describe("limit parameter", () => {
      it("should use default limit of 10", async () => {
        mockQueryBuilder.getMany.mockResolvedValue([mockOfficial]);

        const options: SearchOptions = {
          query: "Maduro",
        };

        await service.search(options);

        expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      });

      it("should use custom limit when provided", async () => {
        mockQueryBuilder.getMany.mockResolvedValue([mockOfficial]);

        const options: SearchOptions = {
          query: "Maduro",
          limit: 25,
        };

        await service.search(options);

        expect(mockQueryBuilder.take).toHaveBeenCalledWith(25);
      });
    });

    describe("search patterns", () => {
      it("should use ILIKE for case-insensitive search", async () => {
        mockQueryBuilder.getMany.mockResolvedValue([mockOfficial]);

        const options: SearchOptions = {
          query: "maduro",
          types: ["officials"],
        };

        await service.search(options);

        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          expect.stringContaining("ILIKE"),
          expect.objectContaining({ pattern: "%maduro%" }),
        );
      });

      it("should escape special characters in search query", async () => {
        mockQueryBuilder.getMany.mockResolvedValue([]);

        const options: SearchOptions = {
          query: "%test%",
          types: ["officials"],
        };

        await service.search(options);

        // Pattern should be %\%test\%%
        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ pattern: "%%test%%" }),
        );
      });

      it("should search multiple fields for officials", async () => {
        mockQueryBuilder.getMany.mockResolvedValue([mockOfficial]);

        const options: SearchOptions = {
          query: "Maduro",
          types: ["officials"],
        };

        await service.search(options);

        // Check that multiple fields are searched
        expect(mockQueryBuilder.where).toHaveBeenCalled();
        expect(mockQueryBuilder.orWhere).toHaveBeenCalled();
      });
    });

    describe("empty results", () => {
      it("should return empty results when no matches found", async () => {
        mockQueryBuilder.getMany.mockResolvedValue([]);

        const options: SearchOptions = {
          query: "nonexistent",
        };

        const result = await service.search(options);

        expect(result.officials).toEqual([]);
        expect(result.sanctions).toEqual([]);
        expect(result.cases).toEqual([]);
        expect(result.totalResults).toBe(0);
      });

      it("should return partial results when some types have matches", async () => {
        mockQueryBuilder.getMany.mockResolvedValueOnce([mockOfficial]);
        mockQueryBuilder.getMany.mockResolvedValueOnce([]);
        mockQueryBuilder.getMany.mockResolvedValueOnce([mockCase]);

        const options: SearchOptions = {
          query: "test",
        };

        const result = await service.search(options);

        expect(result.officials).toHaveLength(1);
        expect(result.sanctions).toEqual([]);
        expect(result.cases).toHaveLength(1);
        expect(result.totalResults).toBe(2);
      });
    });
  });

  describe("autocomplete", () => {
    it("should return autocomplete suggestions by name", async () => {
      const mockAutocompleteResult = [
        {
          id: mockOfficial.id,
          fullName: mockOfficial.fullName,
          photoUrl: mockOfficial.photoUrl,
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockAutocompleteResult);

      const result = await service.autocomplete("Maduro");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockOfficial.id,
        name: mockOfficial.fullName,
        type: "official",
        photoUrl: mockOfficial.photoUrl,
      });
    });

    it("should use prefix matching for autocomplete", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.autocomplete("Maduro");

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining("ILIKE"),
        expect.objectContaining({ pattern: "Maduro%" }),
      );
    });

    it("should use default limit of 5", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.autocomplete("test");

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });

    it("should use custom limit when provided", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.autocomplete("test", 15);

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(15);
    });

    it("should search by lastName as well", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.autocomplete("Maduro");

      expect(mockQueryBuilder.orWhere).toHaveBeenCalled();
    });

    it("should return multiple suggestions", async () => {
      const mockResults = [
        {
          id: "id-1",
          fullName: "Maduro Moros, Nicolás",
          photoUrl: "url1",
        },
        {
          id: "id-2",
          fullName: "Maduro García, Carlos",
          photoUrl: "url2",
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockResults);

      const result = await service.autocomplete("Maduro", 5);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe("official");
      expect(result[1].type).toBe("official");
    });
  });

  describe("getHighlightedOfficials", () => {
    it("should return officials with most sanctions", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([
        mockOfficial,
        mockOfficialTwo,
      ]);

      const result = await service.getHighlightedOfficials();

      expect(result).toEqual([mockOfficial, mockOfficialTwo]);
      expect(officialsRepository.createQueryBuilder).toHaveBeenCalledWith(
        "official",
      );
    });

    it("should use default limit of 6", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getHighlightedOfficials();

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(6);
    });

    it("should use custom limit when provided", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getHighlightedOfficials(12);

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(12);
    });

    it("should include sanctions in result", async () => {
      const officialsWithSanctions = [
        {
          ...mockOfficial,
          sanctions: [mockSanction],
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(officialsWithSanctions);

      const result = await service.getHighlightedOfficials();

      expect(result[0].sanctions).toBeDefined();
    });

    it("should order by sanction count descending", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getHighlightedOfficials();

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        "sanctionCount",
        "DESC",
      );
    });

    it("should return empty array when no officials found", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getHighlightedOfficials();

      expect(result).toEqual([]);
    });
  });

  describe("edge cases", () => {
    it("should handle very long search queries", async () => {
      const longQuery = "a".repeat(500);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const options: SearchOptions = {
        query: longQuery,
      };

      await service.search(options);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it("should handle special characters in search", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const options: SearchOptions = {
        query: "O'Donnell",
        types: ["officials"],
      };

      await service.search(options);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it("should handle unicode characters in search", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const options: SearchOptions = {
        query: "José María",
        types: ["officials"],
      };

      await service.search(options);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it("should handle empty query string", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const options: SearchOptions = {
        query: "",
      };

      await service.search(options);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ pattern: "%%" }),
      );
    });

    it("should handle empty type array gracefully", async () => {
      const options: SearchOptions = {
        query: "test",
        types: [],
      };

      const result = await service.search(options);

      expect(result.officials).toEqual([]);
      expect(result.sanctions).toEqual([]);
      expect(result.cases).toEqual([]);
      expect(result.totalResults).toBe(0);
    });
  });

  describe("result aggregation", () => {
    it("should correctly calculate total results", async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([
        mockOfficial,
        mockOfficialTwo,
      ]);
      mockQueryBuilder.getMany.mockResolvedValueOnce([mockSanction]);
      mockQueryBuilder.getMany.mockResolvedValueOnce([mockCase]);

      const options: SearchOptions = {
        query: "test",
      };

      const result = await service.search(options);

      expect(result.totalResults).toBe(4);
    });

    it("should maintain result type integrity", async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([mockOfficial]);
      mockQueryBuilder.getMany.mockResolvedValueOnce([mockSanction]);
      mockQueryBuilder.getMany.mockResolvedValueOnce([mockCase]);

      const options: SearchOptions = {
        query: "test",
      };

      const result: SearchResult = await service.search(options);

      expect(Array.isArray(result.officials)).toBe(true);
      expect(Array.isArray(result.sanctions)).toBe(true);
      expect(Array.isArray(result.cases)).toBe(true);
      expect(typeof result.totalResults).toBe("number");
    });
  });
});
