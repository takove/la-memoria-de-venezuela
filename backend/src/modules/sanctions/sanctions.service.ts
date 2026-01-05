import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Sanction,
  SanctionType,
  SanctionStatus,
} from "../../entities/sanction.entity";
import { CreateSanctionDto } from "./dto/create-sanction.dto";
import { UpdateSanctionDto } from "./dto/update-sanction.dto";

export interface FindSanctionsOptions {
  page?: number;
  limit?: number;
  type?: SanctionType;
  status?: SanctionStatus;
  fromDate?: Date;
  toDate?: Date;
}

@Injectable()
export class SanctionsService {
  constructor(
    @InjectRepository(Sanction)
    private sanctionsRepository: Repository<Sanction>,
  ) {}

  async findAll(options: FindSanctionsOptions = {}) {
    const { page = 1, limit = 20, type, status, fromDate, toDate } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.sanctionsRepository
      .createQueryBuilder("sanction")
      .leftJoinAndSelect("sanction.official", "official");

    if (type) {
      queryBuilder.andWhere("sanction.type = :type", { type });
    }

    if (status) {
      queryBuilder.andWhere("sanction.status = :status", { status });
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere(
        "sanction.imposedDate BETWEEN :fromDate AND :toDate",
        {
          fromDate,
          toDate,
        },
      );
    }

    const [sanctions, total] = await queryBuilder
      .orderBy("sanction.imposedDate", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: sanctions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const sanction = await this.sanctionsRepository.findOne({
      where: { id },
      relations: ["official"],
    });

    if (!sanction) {
      throw new NotFoundException(`Sanction with ID ${id} not found`);
    }

    return sanction;
  }

  async findByOfficial(officialId: string) {
    return this.sanctionsRepository.find({
      where: { officialId },
      order: { imposedDate: "DESC" },
    });
  }

  async create(data: CreateSanctionDto) {
    const sanction = this.sanctionsRepository.create({
      ...data,
      confidenceLevel: data.confidenceLevel ?? 3,
      sources: data.sources ?? [],
    });
    return this.sanctionsRepository.save(sanction);
  }

  async update(id: string, data: UpdateSanctionDto) {
    const sanction = await this.findOne(id);
    Object.assign(sanction, data);
    return this.sanctionsRepository.save(sanction);
  }

  async getStatistics() {
    const total = await this.sanctionsRepository.count();

    const active = await this.sanctionsRepository.count({
      where: { status: SanctionStatus.ACTIVE },
    });

    const byType = await this.sanctionsRepository
      .createQueryBuilder("sanction")
      .select("sanction.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("sanction.type")
      .getRawMany();

    const byYear = await this.sanctionsRepository
      .createQueryBuilder("sanction")
      .select("EXTRACT(YEAR FROM sanction.imposedDate)", "year")
      .addSelect("COUNT(*)", "count")
      .groupBy("EXTRACT(YEAR FROM sanction.imposedDate)")
      .orderBy("year", "ASC")
      .getRawMany();

    return {
      total,
      active,
      byType,
      byYear,
    };
  }

  async getTimeline() {
    return this.sanctionsRepository
      .createQueryBuilder("sanction")
      .leftJoinAndSelect("sanction.official", "official")
      .select([
        "sanction.id",
        "sanction.imposedDate",
        "sanction.type",
        "sanction.programName",
        "sanction.reason",
        "official.id",
        "official.fullName",
        "official.photoUrl",
      ])
      .orderBy("sanction.imposedDate", "DESC")
      .limit(50)
      .getMany();
  }
}
