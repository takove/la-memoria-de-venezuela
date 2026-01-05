import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { EventsService } from "./events.service";
import { Event, EventType } from "../../entities/event.entity";
import { Official, OfficialStatus } from "../../entities/official.entity";

describe("EventsService", () => {
  let service: EventsService;

  const mockOfficial: Official = {
    id: "official-uuid-123",
    firstName: "Nicolás",
    lastName: "Maduro",
    fullName: "Nicolás Maduro Moros",
    status: OfficialStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockEvent: Event = {
    id: "event-uuid-789",
    title: "OFAC Sanction Imposed",
    description: "Economic sanctions for corruption",
    eventDate: new Date("2020-01-15"),
    eventType: EventType.SANCTION,
    relatedOfficialId: "official-uuid-123",
    relatedBusinessId: null,
    sourceUrl: "https://ofac.treasury.gov/sanctions",
    importance: 9,
    createdAt: new Date(),
    updatedAt: new Date(),
    official: mockOfficial,
    business: null,
  } as any;

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated list of events", async () => {
      const events = [mockEvent];
      mockRepository.findAndCount.mockResolvedValue([events, 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(events);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        relations: ["official", "business"],
        order: { eventDate: "DESC" },
        skip: 0,
        take: 20,
      });
    });

    it("should handle pagination correctly", async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockEvent], 50]);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.meta).toEqual({
        total: 50,
        page: 2,
        limit: 10,
        totalPages: 5,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        relations: ["official", "business"],
        order: { eventDate: "DESC" },
        skip: 10,
        take: 10,
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
    it("should return an event by id", async () => {
      mockRepository.findOne.mockResolvedValue(mockEvent);

      const result = await service.findOne("event-uuid-789");

      expect(result).toEqual(mockEvent);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "event-uuid-789" },
        relations: ["official", "business"],
      });
    });

    it("should throw NotFoundException when event not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne("invalid-id")).rejects.toThrow(
        "Event with ID invalid-id not found",
      );
    });
  });

  describe("findByOfficial", () => {
    it("should return events for a specific official", async () => {
      const events = [mockEvent];
      mockRepository.find.mockResolvedValue(events);

      const result = await service.findByOfficial("official-uuid-123");

      expect(result).toEqual(events);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { relatedOfficialId: "official-uuid-123" },
        relations: ["official", "business"],
        order: { eventDate: "DESC" },
      });
    });

    it("should return empty array when no events found", async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByOfficial("official-uuid-999");

      expect(result).toEqual([]);
    });
  });

  describe("findByBusiness", () => {
    it("should return events for a specific business", async () => {
      const businessEvent = {
        ...mockEvent,
        relatedBusinessId: "business-uuid-456",
      };
      mockRepository.find.mockResolvedValue([businessEvent]);

      const result = await service.findByBusiness("business-uuid-456");

      expect(result).toEqual([businessEvent]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { relatedBusinessId: "business-uuid-456" },
        relations: ["official", "business"],
        order: { eventDate: "DESC" },
      });
    });

    it("should return empty array when no events found", async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByBusiness("business-uuid-999");

      expect(result).toEqual([]);
    });
  });

  describe("findGlobal", () => {
    beforeEach(() => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([mockEvent]);
    });

    it("should return all events without date filter", async () => {
      const result = await service.findGlobal();

      expect(result).toEqual([mockEvent]);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("event");
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        "event.official",
        "official",
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        "event.business",
        "business",
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        "event.eventDate",
        "DESC",
      );
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it("should filter events by date range", async () => {
      const fromDate = new Date("2020-01-01");
      const toDate = new Date("2020-12-31");

      const result = await service.findGlobal(fromDate, toDate);

      expect(result).toEqual([mockEvent]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "event.eventDate BETWEEN :fromDate AND :toDate",
        { fromDate, toDate },
      );
    });

    it("should filter events from a specific date", async () => {
      const fromDate = new Date("2020-01-01");

      const result = await service.findGlobal(fromDate);

      expect(result).toEqual([mockEvent]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "event.eventDate >= :fromDate",
        { fromDate },
      );
    });

    it("should filter events up to a specific date", async () => {
      const toDate = new Date("2020-12-31");

      const result = await service.findGlobal(undefined, toDate);

      expect(result).toEqual([mockEvent]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "event.eventDate <= :toDate",
        { toDate },
      );
    });
  });

  describe("create", () => {
    it("should create a new event", async () => {
      const createDto = {
        title: "New Sanction",
        description: "Test sanction",
        eventDate: new Date("2021-06-15"),
        eventType: EventType.SANCTION,
        relatedOfficialId: "official-uuid-123",
        sourceUrl: "https://example.com",
        importance: 7,
      };

      mockRepository.create.mockReturnValue(mockEvent);
      mockRepository.save.mockResolvedValue(mockEvent);

      const result = await service.create(createDto);

      expect(result).toEqual(mockEvent);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockEvent);
    });

    it("should validate importance level", async () => {
      const createDto = {
        title: "Invalid Event",
        eventDate: new Date(),
        eventType: EventType.CHARGE,
        relatedOfficialId: "official-uuid-123",
        sourceUrl: "https://example.com",
        importance: 11, // Invalid: > 10
      };

      await expect(service.create(createDto as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto as any)).rejects.toThrow(
        "Importance must be between 1 and 10",
      );
    });

    it("should reject importance level below 1", async () => {
      const createDto = {
        title: "Invalid Event",
        eventDate: new Date(),
        eventType: EventType.CHARGE,
        relatedOfficialId: "official-uuid-123",
        sourceUrl: "https://example.com",
        importance: 0, // Invalid: < 1
      };

      await expect(service.create(createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("update", () => {
    it("should update an event", async () => {
      const updateDto = {
        title: "Updated Title",
        importance: 8,
      };

      const updatedEvent = { ...mockEvent, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockEvent);
      mockRepository.save.mockResolvedValue(updatedEvent);

      const result = await service.update("event-uuid-789", updateDto);

      expect(result).toEqual(updatedEvent);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should preserve timestamps when updating", async () => {
      const updateDto = { title: "New Title" };
      const originalCreatedAt = mockEvent.createdAt;

      mockRepository.findOne.mockResolvedValue(mockEvent);
      mockRepository.save.mockResolvedValue(mockEvent);

      await service.update("event-uuid-789", updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: originalCreatedAt,
        }),
      );
    });

    it("should validate importance level when updating", async () => {
      mockRepository.findOne.mockResolvedValue(mockEvent);

      await expect(
        service.update("event-uuid-789", { importance: 15 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException when event not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update("invalid-id", { title: "New Title" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should remove an event", async () => {
      mockRepository.findOne.mockResolvedValue(mockEvent);
      mockRepository.remove.mockResolvedValue(mockEvent);

      await service.remove("event-uuid-789");

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "event-uuid-789" },
        relations: ["official", "business"],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockEvent);
    });

    it("should throw NotFoundException when event not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should cascade correctly on delete", async () => {
      mockRepository.findOne.mockResolvedValue(mockEvent);
      mockRepository.remove.mockResolvedValue(mockEvent);

      await service.remove("event-uuid-789");

      expect(mockRepository.remove).toHaveBeenCalledWith(mockEvent);
    });
  });
});
