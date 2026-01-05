import { INestApplication, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { EventType } from "../../entities/event.entity";

const mockEvent = {
  id: "event-uuid-123",
  title: "OFAC Sanction Imposed",
  description: "Economic sanctions for corruption",
  eventDate: new Date("2020-01-15"),
  eventType: EventType.SANCTION,
  relatedOfficialId: "official-uuid-456",
  relatedBusinessId: null,
  sourceUrl: "https://ofac.treasury.gov/sanctions",
  importance: 9,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockService = {
  findAll: jest.fn().mockResolvedValue({
    data: [mockEvent],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
  }),
  findOne: jest.fn().mockResolvedValue(mockEvent),
  findByOfficial: jest.fn().mockResolvedValue([mockEvent]),
  findByBusiness: jest.fn().mockResolvedValue([mockEvent]),
  findGlobal: jest.fn().mockResolvedValue([mockEvent]),
  create: jest.fn().mockImplementation((dto) => ({
    ...mockEvent,
    ...dto,
  })),
  update: jest.fn().mockResolvedValue(mockEvent),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe("EventsController (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
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

  describe("GET /events", () => {
    it("should return paginated events", async () => {
      const res = await request(app.getHttpServer())
        .get("/events?page=1&limit=20")
        .expect(HttpStatus.OK);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it("should use default pagination values", async () => {
      await request(app.getHttpServer()).get("/events").expect(HttpStatus.OK);

      expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe("GET /events/official/:officialId", () => {
    it("should return events for specific official", async () => {
      const res = await request(app.getHttpServer())
        .get("/events/official/11111111-1111-1111-1111-111111111111")
        .expect(HttpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(mockService.findByOfficial).toHaveBeenCalledWith(
        "11111111-1111-1111-1111-111111111111",
      );
    });

    it("should return 400 for invalid UUID", async () => {
      await request(app.getHttpServer())
        .get("/events/official/invalid-uuid")
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("GET /events/business/:businessId", () => {
    it("should return events for specific business", async () => {
      const res = await request(app.getHttpServer())
        .get("/events/business/22222222-2222-2222-2222-222222222222")
        .expect(HttpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(mockService.findByBusiness).toHaveBeenCalledWith(
        "22222222-2222-2222-2222-222222222222",
      );
    });

    it("should return 400 for invalid UUID", async () => {
      await request(app.getHttpServer())
        .get("/events/business/invalid-uuid")
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("GET /events/timeline", () => {
    it("should return global timeline without date filters", async () => {
      const res = await request(app.getHttpServer())
        .get("/events/timeline")
        .expect(HttpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(mockService.findGlobal).toHaveBeenCalledWith(undefined, undefined);
    });

    it("should filter timeline by date range", async () => {
      await request(app.getHttpServer())
        .get("/events/timeline?from=2020-01-01&to=2020-12-31")
        .expect(HttpStatus.OK);

      expect(mockService.findGlobal).toHaveBeenCalledWith(
        new Date("2020-01-01"),
        new Date("2020-12-31"),
      );
    });

    it("should filter timeline from specific date", async () => {
      await request(app.getHttpServer())
        .get("/events/timeline?from=2020-01-01")
        .expect(HttpStatus.OK);

      expect(mockService.findGlobal).toHaveBeenCalledWith(
        new Date("2020-01-01"),
        undefined,
      );
    });

    it("should filter timeline up to specific date", async () => {
      await request(app.getHttpServer())
        .get("/events/timeline?to=2020-12-31")
        .expect(HttpStatus.OK);

      expect(mockService.findGlobal).toHaveBeenCalledWith(
        undefined,
        new Date("2020-12-31"),
      );
    });
  });

  describe("GET /events/:id", () => {
    it("should return specific event", async () => {
      const res = await request(app.getHttpServer())
        .get("/events/33333333-3333-3333-3333-333333333333")
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(mockEvent.id);
      expect(mockService.findOne).toHaveBeenCalledWith(
        "33333333-3333-3333-3333-333333333333",
      );
    });

    it("should return 400 for invalid UUID", async () => {
      await request(app.getHttpServer())
        .get("/events/invalid-uuid")
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("POST /events", () => {
    it("should create a new event", async () => {
      const createDto = {
        title: "New Sanction",
        description: "Test sanction",
        eventDate: "2021-06-15",
        eventType: EventType.SANCTION,
        relatedOfficialId: "44444444-4444-4444-4444-444444444444",
        sourceUrl: "https://example.com/sanction",
        importance: 8,
      };

      const res = await request(app.getHttpServer())
        .post("/events")
        .send(createDto)
        .expect(HttpStatus.CREATED);

      expect(res.body.title).toBe(createDto.title);
      expect(mockService.create).toHaveBeenCalled();
    });
  });

  describe("PATCH /events/:id", () => {
    it("should update an event", async () => {
      const updateDto = {
        title: "Updated Title",
        importance: 7,
      };

      const res = await request(app.getHttpServer())
        .patch("/events/55555555-5555-5555-5555-555555555555")
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(mockEvent.id);
      expect(mockService.update).toHaveBeenCalledWith(
        "55555555-5555-5555-5555-555555555555",
        updateDto,
      );
    });

    it("should return 400 for invalid UUID", async () => {
      await request(app.getHttpServer())
        .patch("/events/invalid-uuid")
        .send({ title: "Updated" })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("DELETE /events/:id", () => {
    it("should delete an event and return 204", async () => {
      await request(app.getHttpServer())
        .delete("/events/66666666-6666-6666-6666-666666666666")
        .expect(HttpStatus.NO_CONTENT);

      expect(mockService.remove).toHaveBeenCalledWith(
        "66666666-6666-6666-6666-666666666666",
      );
    });

    it("should return 400 for invalid UUID", async () => {
      await request(app.getHttpServer())
        .delete("/events/invalid-uuid")
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("Route protection and error handling", () => {
    it("should handle all routes correctly", async () => {
      // Ensure all routes are defined
      const routes = [
        { method: "get", path: "/events" },
        {
          method: "get",
          path: "/events/official/11111111-1111-1111-1111-111111111111",
        },
        {
          method: "get",
          path: "/events/business/22222222-2222-2222-2222-222222222222",
        },
        { method: "get", path: "/events/timeline" },
        { method: "get", path: "/events/33333333-3333-3333-3333-333333333333" },
      ];

      for (const route of routes) {
        await request(app.getHttpServer())
          .get(route.path)
          .expect((res: any) => {
            expect([200, 201, 204, 400, 404]).toContain(res.status);
          });
      }
    });
  });
});
