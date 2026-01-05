import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Testaferro, TestaferroCategory, TestaferroStatus } from "../../entities";

@Injectable()
export class TestaferrosService {
  constructor(
    @InjectRepository(Testaferro)
    private testaferrosRepository: Repository<Testaferro>
  ) {}

  /**
   * Find all testaferros with optional filters
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    filters?: {
      category?: TestaferroCategory;
      status?: TestaferroStatus;
      country?: string;
      minConfidence?: number;
    }
  ) {
    const query = this.testaferrosRepository.createQueryBuilder("t");

    if (filters?.category) {
      query.where("t.category = :category", { category: filters.category });
    }

    if (filters?.status) {
      query.andWhere("t.status = :status", { status: filters.status });
    }

    if (filters?.country) {
      query.andWhere("LOWER(t.country) LIKE LOWER(:country)", {
        country: `%${filters.country}%`,
      });
    }

    if (filters?.minConfidence) {
      query.andWhere("t.confidenceLevel >= :minConfidence", {
        minConfidence: filters.minConfidence,
      });
    }

    const [data, total] = await query
      .orderBy("t.created_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find single testaferro by ID
   */
  async findOne(id: string): Promise<Testaferro> {
    const testaferro = await this.testaferrosRepository.findOne({
      where: { id },
      relations: ["beneficialOwner"],
    });

    if (!testaferro) {
      throw new NotFoundException(
        `Testaferro with ID ${id} not found`
      );
    }

    return testaferro;
  }

  /**
   * Search testaferros by name or identity number
   */
  async search(query: string): Promise<Testaferro[]> {
    return this.testaferrosRepository
      .createQueryBuilder("t")
      .where("LOWER(t.fullName) LIKE LOWER(:query)", { query: `%${query}%` })
      .orWhere("t.identificationNumber LIKE :number", { number: `%${query}%` })
      .orderBy("t.fullName", "ASC")
      .take(50)
      .getMany();
  }

  /**
   * Find all testaferros for a specific official
   */
  async findByOfficialId(
    officialId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const [data, total] = await this.testaferrosRepository
      .createQueryBuilder("t")
      .where("t.beneficialOwnerId = :officialId", { officialId })
      .orderBy("t.fullName", "ASC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get statistics on testaferros
   */
  async getStatistics() {
    const [byCategory, byStatus, byCountry, totalWealth] = await Promise.all([
      this.testaferrosRepository
        .createQueryBuilder("t")
        .select("t.category", "category")
        .addSelect("COUNT(*)", "count")
        .groupBy("t.category")
        .getRawMany(),

      this.testaferrosRepository
        .createQueryBuilder("t")
        .select("t.status", "status")
        .addSelect("COUNT(*)", "count")
        .groupBy("t.status")
        .getRawMany(),

      this.testaferrosRepository
        .createQueryBuilder("t")
        .select("t.country", "country")
        .addSelect("COUNT(*)", "count")
        .where("t.country IS NOT NULL")
        .groupBy("t.country")
        .orderBy("count", "DESC")
        .take(10)
        .getRawMany(),

      this.testaferrosRepository
        .createQueryBuilder("t")
        .select(
          "SUM(CAST(t.estimatedWealthAmount AS NUMERIC))",
          "totalWealth"
        )
        .getRawOne(),
    ]);

    return {
      totalTestaferros: await this.testaferrosRepository.count(),
      byCategory,
      byStatus,
      topCountries: byCountry,
      totalEstimatedWealth: totalWealth.totalWealth || 0,
    };
  }

  /**
   * Create a new testaferro
   */
  async create(data: Partial<Testaferro>): Promise<Testaferro> {
    if (!data.fullName) {
      throw new BadRequestException("Full name is required");
    }

    if (!data.category) {
      throw new BadRequestException("Category is required");
    }

    const testaferro = this.testaferrosRepository.create(data);
    return this.testaferrosRepository.save(testaferro);
  }

  /**
   * Update a testaferro
   */
  async update(
    id: string,
    data: Partial<Testaferro>
  ): Promise<Testaferro> {
    const testaferro = await this.findOne(id);
    Object.assign(testaferro, data);
    return this.testaferrosRepository.save(testaferro);
  }

  /**
   * Delete a testaferro
   */
  async remove(id: string): Promise<void> {
    const testaferro = await this.findOne(id);
    await this.testaferrosRepository.remove(testaferro);
  }
}
