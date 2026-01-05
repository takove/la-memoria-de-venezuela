import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "../../entities/event.entity";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

export interface FindEventsOptions {
  page?: number;
  limit?: number;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async findAll(options: FindEventsOptions = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [events, total] = await this.eventsRepository.findAndCount({
      relations: ["official", "business"],
      order: { eventDate: "DESC" },
      skip,
      take: limit,
    });

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ["official", "business"],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async findByOfficial(officialId: string): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { relatedOfficialId: officialId },
      relations: ["official", "business"],
      order: { eventDate: "DESC" },
    });
  }

  async findByBusiness(businessId: string): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { relatedBusinessId: businessId },
      relations: ["official", "business"],
      order: { eventDate: "DESC" },
    });
  }

  async findGlobal(fromDate?: Date, toDate?: Date): Promise<Event[]> {
    const queryBuilder = this.eventsRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.official", "official")
      .leftJoinAndSelect("event.business", "business");

    if (fromDate && toDate) {
      queryBuilder.andWhere("event.eventDate BETWEEN :fromDate AND :toDate", {
        fromDate,
        toDate,
      });
    } else if (fromDate) {
      queryBuilder.andWhere("event.eventDate >= :fromDate", { fromDate });
    } else if (toDate) {
      queryBuilder.andWhere("event.eventDate <= :toDate", { toDate });
    }

    return queryBuilder.orderBy("event.eventDate", "DESC").getMany();
  }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Validate importance level
    if (createEventDto.importance < 1 || createEventDto.importance > 10) {
      throw new BadRequestException("Importance must be between 1 and 10");
    }

    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    // Validate importance level if provided
    if (
      updateEventDto.importance !== undefined &&
      (updateEventDto.importance < 1 || updateEventDto.importance > 10)
    ) {
      throw new BadRequestException("Importance must be between 1 and 10");
    }

    Object.assign(event, updateEventDto);
    return this.eventsRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }
}
