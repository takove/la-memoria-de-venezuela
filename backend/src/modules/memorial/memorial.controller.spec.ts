import { INestApplication, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { MemorialController } from "./memorial.controller";
import { MemorialService } from "./memorial.service";
import { VictimCategory } from "../../entities/victim.entity";

// Using loose typing to keep the controller contract focused
const mockVictim = {
  id: "11111111-1111-1111-1111-111111111111",
  fullName: "Test Victim",
  category: VictimCategory.PROTEST,
};

const mockPrisoner = {
  id: "22222222-2222-2222-2222-222222222222",
  fullName: "Test Prisoner",
  status: "detained",
};

const mockExile = {
  id: "33333333-3333-3333-3333-333333333333",
  fullName: "Test Exile",
  destination: "Colombia",
};

const mockStats = {
  total: 10,
  byCategory: [{ category: VictimCategory.PROTEST, count: "5" }],
  byYear: [{ year: "2019", count: "3" }],
};

const mockService = {
  getOverallStatistics: jest.fn().mockResolvedValue({ totalVictims: 10 }),
  findAllVictims: jest.fn().mockResolvedValue({
    data: [mockVictim],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
  }),
  getVictimStatistics: jest.fn().mockResolvedValue(mockStats),
  findOneVictim: jest.fn().mockResolvedValue(mockVictim),
  createVictim: jest.fn().mockImplementation((dto) => ({
    ...mockVictim,
    ...dto,
  })),
  updateVictim: jest.fn().mockResolvedValue(mockVictim),
  deleteVictim: jest.fn().mockResolvedValue(undefined),
  findAllPrisoners: jest.fn().mockResolvedValue({
    data: [mockPrisoner],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
  }),
  getPrisonerStatistics: jest.fn().mockResolvedValue({ total: 3 }),
  findOnePrisoner: jest.fn().mockResolvedValue(mockPrisoner),
  createPrisoner: jest
    .fn()
    .mockImplementation((dto) => ({ ...mockPrisoner, ...dto })),
  updatePrisoner: jest.fn().mockResolvedValue(mockPrisoner),
  deletePrisoner: jest.fn().mockResolvedValue(undefined),
  findAllExileStories: jest.fn().mockResolvedValue({
    data: [mockExile],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
  }),
  getExileStatistics: jest.fn().mockResolvedValue({ total: 5 }),
  findOneExileStory: jest.fn().mockResolvedValue(mockExile),
  createExileStory: jest
    .fn()
    .mockImplementation((dto) => ({ ...mockExile, ...dto })),
  updateExileStory: jest.fn().mockResolvedValue(mockExile),
  deleteExileStory: jest.fn().mockResolvedValue(undefined),
};

describe("MemorialController (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemorialController],
      providers: [
        {
          provide: MemorialService,
          useValue: mockService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("victims", () => {
    it("GET /memorial/victims returns paginated victims", async () => {
      const res = await request(app.getHttpServer())
        .get("/memorial/victims?page=1&limit=20")
        .expect(HttpStatus.OK);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
      expect(mockService.findAllVictims).toHaveBeenCalledWith({
        page: "1",
        limit: "20",
      });
    });

    it("GET /memorial/victims/:id rejects invalid UUID", () => {
      return request(app.getHttpServer())
        .get("/memorial/victims/not-a-uuid")
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("POST /memorial/victims creates a victim", async () => {
      const payload = {
        fullName: "New Victim",
        category: VictimCategory.PROTEST,
      };

      const res = await request(app.getHttpServer())
        .post("/memorial/victims")
        .send(payload)
        .expect(HttpStatus.CREATED);

      expect(res.body.fullName).toBe(payload.fullName);
      expect(mockService.createVictim).toHaveBeenCalled();
    });
  });

  describe("statistics", () => {
    it("GET /memorial/statistics returns overall stats", async () => {
      const res = await request(app.getHttpServer())
        .get("/memorial/statistics")
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({ totalVictims: 10 });
      expect(mockService.getOverallStatistics).toHaveBeenCalled();
    });

    it("GET /memorial/victims/statistics returns victim stats", async () => {
      const res = await request(app.getHttpServer())
        .get("/memorial/victims/statistics")
        .expect(HttpStatus.OK);

      expect(res.body.total).toBe(10);
      expect(mockService.getVictimStatistics).toHaveBeenCalled();
    });
  });

  describe("prisoners", () => {
    it("GET /memorial/prisoners returns paginated prisoners", async () => {
      const res = await request(app.getHttpServer())
        .get("/memorial/prisoners?page=2&limit=5")
        .expect(HttpStatus.OK);

      expect(res.body.data[0].id).toBe(mockPrisoner.id);
      expect(res.body.meta.total).toBe(1);
      expect(mockService.findAllPrisoners).toHaveBeenCalledWith({
        page: "2",
        limit: "5",
      });
    });

    it("GET /memorial/prisoners/statistics returns prisoner stats", async () => {
      const res = await request(app.getHttpServer())
        .get("/memorial/prisoners/statistics")
        .expect(HttpStatus.OK);

      expect(res.body.total).toBe(3);
      expect(mockService.getPrisonerStatistics).toHaveBeenCalled();
    });

    it("GET /memorial/prisoners/:id rejects invalid UUID", () => {
      return request(app.getHttpServer())
        .get("/memorial/prisoners/not-a-uuid")
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("POST /memorial/prisoners creates a prisoner", async () => {
      const payload = { fullName: "New Prisoner", status: "detained" };

      const res = await request(app.getHttpServer())
        .post("/memorial/prisoners")
        .send(payload)
        .expect(HttpStatus.CREATED);

      expect(res.body.fullName).toBe(payload.fullName);
      expect(mockService.createPrisoner).toHaveBeenCalled();
    });

    it("PATCH /memorial/prisoners/:id updates a prisoner", async () => {
      const payload = { status: "released" };

      await request(app.getHttpServer())
        .patch(`/memorial/prisoners/${mockPrisoner.id}`)
        .send(payload)
        .expect(HttpStatus.OK);

      expect(mockService.updatePrisoner).toHaveBeenCalledWith(
        mockPrisoner.id,
        payload,
      );
    });

    it("DELETE /memorial/prisoners/:id deletes a prisoner", async () => {
      await request(app.getHttpServer())
        .delete(`/memorial/prisoners/${mockPrisoner.id}`)
        .expect(HttpStatus.NO_CONTENT);

      expect(mockService.deletePrisoner).toHaveBeenCalledWith(mockPrisoner.id);
    });
  });

  describe("exile stories", () => {
    it("GET /memorial/exiles returns paginated exiles", async () => {
      const res = await request(app.getHttpServer())
        .get("/memorial/exiles?page=1&limit=10")
        .expect(HttpStatus.OK);

      expect(res.body.data[0].id).toBe(mockExile.id);
      expect(mockService.findAllExileStories).toHaveBeenCalledWith({
        page: "1",
        limit: "10",
      });
    });

    it("GET /memorial/exiles/statistics returns exile stats", async () => {
      const res = await request(app.getHttpServer())
        .get("/memorial/exiles/statistics")
        .expect(HttpStatus.OK);

      expect(res.body.total).toBe(5);
      expect(mockService.getExileStatistics).toHaveBeenCalled();
    });

    it("GET /memorial/exiles/:id rejects invalid UUID", () => {
      return request(app.getHttpServer())
        .get("/memorial/exiles/not-a-uuid")
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("POST /memorial/exiles creates an exile story", async () => {
      const payload = { fullName: "New Exile", destination: "Peru" };

      const res = await request(app.getHttpServer())
        .post("/memorial/exiles")
        .send(payload)
        .expect(HttpStatus.CREATED);

      expect(res.body.fullName).toBe(payload.fullName);
      expect(mockService.createExileStory).toHaveBeenCalled();
    });

    it("PATCH /memorial/exiles/:id updates an exile story", async () => {
      const payload = { destination: "Chile" };

      await request(app.getHttpServer())
        .patch(`/memorial/exiles/${mockExile.id}`)
        .send(payload)
        .expect(HttpStatus.OK);

      expect(mockService.updateExileStory).toHaveBeenCalledWith(
        mockExile.id,
        payload,
      );
    });

    it("DELETE /memorial/exiles/:id deletes an exile story", async () => {
      await request(app.getHttpServer())
        .delete(`/memorial/exiles/${mockExile.id}`)
        .expect(HttpStatus.NO_CONTENT);

      expect(mockService.deleteExileStory).toHaveBeenCalledWith(mockExile.id);
    });
  });
});
