import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Business, BusinessCategory, BusinessStatus } from "../../entities";

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 20,
    category?: BusinessCategory,
    country?: string,
    minConfidence?: number,
  ) {
    const query = this.businessRepository.createQueryBuilder("business");

    if (category) {
      query.andWhere("business.category = :category", { category });
    }

    if (country) {
      query.andWhere("business.country = :country", { country });
    }

    if (minConfidence) {
      query.andWhere("business.confidence_level >= :minConfidence", {
        minConfidence,
      });
    }

    const total = await query.getCount();
    const businesses = await query
      .leftJoinAndSelect("business.beneficialOwner", "official")
      .orderBy("business.estimated_theft_amount", "DESC")
      .addOrderBy("business.name", "ASC")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: businesses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ["beneficialOwner"],
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return business;
  }

  async search(q: string, limit: number = 10) {
    if (!q || q.length < 2) {
      throw new BadRequestException(
        "Search query must be at least 2 characters",
      );
    }

    return this.businessRepository.find({
      where: [
        { name: ILike(`%${q}%`) },
        { registrationNumber: ILike(`%${q}%`) },
        { frontMan: ILike(`%${q}%`) },
      ],
      take: limit,
      order: { name: "ASC" },
    });
  }

  async findByOfficialId(
    officialId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const query = this.businessRepository
      .createQueryBuilder("business")
      .where("business.beneficial_owner_id = :officialId", { officialId });

    const total = await query.getCount();
    const businesses = await query
      .orderBy("business.estimated_theft_amount", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: businesses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStatistics() {
    const total = await this.businessRepository.count();

    const byCategory = await this.businessRepository
      .createQueryBuilder("business")
      .select("business.category", "category")
      .addSelect("COUNT(*)", "count")
      .groupBy("business.category")
      .getRawMany();

    const byCountry = await this.businessRepository
      .createQueryBuilder("business")
      .select("business.country", "country")
      .addSelect("COUNT(*)", "count")
      .where("business.country IS NOT NULL")
      .groupBy("business.country")
      .orderBy("count", "DESC")
      .limit(10)
      .getRawMany();

    const totalTheft = await this.businessRepository
      .createQueryBuilder("business")
      .select("SUM(business.estimated_theft_amount)", "total")
      .getRawOne();

    const sanctioned = await this.businessRepository.count({
      where: { status: BusinessStatus.SANCTIONED },
    });

    return {
      total,
      sanctioned,
      totalEstimatedTheft: parseFloat(totalTheft.total || 0),
      byCategory,
      byCountry,
    };
  }

  async create(data: Partial<Business>) {
    const business = this.businessRepository.create({
      ...data,
      sources: data.sources === undefined ? [] : data.sources,
      confidenceLevel: data.confidenceLevel ?? 3,
    });
    return this.businessRepository.save(business);
  }

  async update(id: string, data: Partial<Business>) {
    const business = await this.findOne(id);
    Object.assign(business, data);
    return this.businessRepository.save(business);
  }

  async delete(id: string) {
    const business = await this.findOne(id);
    return this.businessRepository.remove(business);
  }
}
