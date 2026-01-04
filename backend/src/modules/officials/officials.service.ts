import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Official, OfficialStatus } from "../../entities/official.entity";

export interface FindOfficialsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: OfficialStatus;
}

@Injectable()
export class OfficialsService {
  constructor(
    @InjectRepository(Official)
    private officialsRepository: Repository<Official>,
  ) {}

  async findAll(options: FindOfficialsOptions = {}) {
    const { page = 1, limit = 20, search, status } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.officialsRepository
      .createQueryBuilder("official")
      .leftJoinAndSelect("official.sanctions", "sanctions")
      .leftJoinAndSelect("official.caseInvolvements", "involvements")
      .leftJoinAndSelect("involvements.case", "case");

    if (search) {
      queryBuilder.andWhere(
        "(official.fullName ILIKE :search OR official.aliases::text ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere("official.status = :status", { status });
    }

    const [officials, total] = await queryBuilder
      .orderBy("official.lastName", "ASC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: officials,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const official = await this.officialsRepository.findOne({
      where: { id },
      relations: ["sanctions", "caseInvolvements", "caseInvolvements.case"],
    });

    if (!official) {
      throw new NotFoundException(`Official with ID ${id} not found`);
    }

    return official;
  }

  async findByName(name: string) {
    return this.officialsRepository.find({
      where: [
        { fullName: ILike(`%${name}%`) },
        { firstName: ILike(`%${name}%`) },
        { lastName: ILike(`%${name}%`) },
      ],
      relations: ["sanctions"],
    });
  }

  async create(data: Partial<Official>) {
    const official = this.officialsRepository.create({
      ...data,
      fullName: `${data.firstName} ${data.lastName}`,
    });
    return this.officialsRepository.save(official);
  }

  async update(id: string, data: Partial<Official>) {
    const official = await this.findOne(id);
    Object.assign(official, data);
    if (data.firstName || data.lastName) {
      official.fullName = `${data.firstName || official.firstName} ${data.lastName || official.lastName}`;
    }
    return this.officialsRepository.save(official);
  }

  async getStatistics() {
    const total = await this.officialsRepository.count();
    const byStatus = await this.officialsRepository
      .createQueryBuilder("official")
      .select("official.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("official.status")
      .getRawMany();

    const sanctioned = await this.officialsRepository
      .createQueryBuilder("official")
      .innerJoin("official.sanctions", "sanction")
      .where("sanction.status = :status", { status: "active" })
      .getCount();

    return {
      total,
      byStatus,
      sanctioned,
    };
  }
}
