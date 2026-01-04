import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Victim } from "../../entities/victim.entity";
import {
  PoliticalPrisoner,
  PrisonerStatus,
} from "../../entities/political-prisoner.entity";
import { ExileStory } from "../../entities/exile-story.entity";
import {
  CreateVictimDto,
  UpdateVictimDto,
  VictimQueryDto,
  CreatePoliticalPrisonerDto,
  UpdatePoliticalPrisonerDto,
  PoliticalPrisonerQueryDto,
  CreateExileStoryDto,
  UpdateExileStoryDto,
  ExileStoryQueryDto,
} from "./dto";

/**
 * Memorial Service
 *
 * "This is why we exist."
 *
 * Manages the database of victims, political prisoners, and exile stories.
 * Every record here represents a Venezuelan who suffered under the regime.
 */
@Injectable()
export class MemorialService {
  constructor(
    @InjectRepository(Victim)
    private victimRepository: Repository<Victim>,
    @InjectRepository(PoliticalPrisoner)
    private prisonerRepository: Repository<PoliticalPrisoner>,
    @InjectRepository(ExileStory)
    private exileRepository: Repository<ExileStory>,
  ) {}

  // ==================== VICTIMS ====================

  /**
   * Find all victims with filtering and pagination
   */
  async findAllVictims(query: VictimQueryDto) {
    const {
      search,
      category,
      minConfidence,
      yearFrom,
      yearTo,
      placeOfDeath,
      page = 1,
      limit = 20,
      sortBy = "dateOfDeath",
      sortOrder = "DESC",
    } = query;

    const qb = this.victimRepository.createQueryBuilder("victim");

    // Only show victims with confidence level 3+ publicly
    qb.where("victim.confidenceLevel >= :minConf", {
      minConf: minConfidence || 3,
    });

    if (search) {
      qb.andWhere(
        "(victim.fullName ILIKE :search OR victim.biography ILIKE :search OR victim.biographyEs ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (category) {
      qb.andWhere("victim.category = :category", { category });
    }

    if (yearFrom) {
      qb.andWhere("EXTRACT(YEAR FROM victim.dateOfDeath) >= :yearFrom", {
        yearFrom,
      });
    }

    if (yearTo) {
      qb.andWhere("EXTRACT(YEAR FROM victim.dateOfDeath) <= :yearTo", {
        yearTo,
      });
    }

    if (placeOfDeath) {
      qb.andWhere("victim.placeOfDeath ILIKE :place", {
        place: `%${placeOfDeath}%`,
      });
    }

    // Sorting
    const validSortFields = [
      "fullName",
      "dateOfDeath",
      "createdAt",
      "category",
    ];
    const field = validSortFields.includes(sortBy) ? sortBy : "dateOfDeath";
    qb.orderBy(`victim.${field}`, sortOrder === "ASC" ? "ASC" : "DESC");

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

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
   * Find a single victim by ID
   */
  async findOneVictim(id: string): Promise<Victim> {
    const victim = await this.victimRepository.findOne({
      where: { id },
      relations: ["responsibleOfficial"],
    });

    if (!victim) {
      throw new NotFoundException(`Victim with ID ${id} not found`);
    }

    return victim;
  }

  /**
   * Create a new victim record
   */
  async createVictim(dto: CreateVictimDto): Promise<Victim> {
    const victim = this.victimRepository.create(dto);
    return this.victimRepository.save(victim);
  }

  /**
   * Update an existing victim record
   */
  async updateVictim(id: string, dto: UpdateVictimDto): Promise<Victim> {
    const victim = await this.findOneVictim(id);
    Object.assign(victim, dto);
    return this.victimRepository.save(victim);
  }

  /**
   * Delete a victim record (soft delete recommended in production)
   */
  async deleteVictim(id: string): Promise<void> {
    const victim = await this.findOneVictim(id);
    await this.victimRepository.remove(victim);
  }

  /**
   * Get victim statistics for the memorial wall
   */
  async getVictimStatistics() {
    const qb = this.victimRepository.createQueryBuilder("victim");

    // Total count
    const total = await qb.getCount();

    // By category
    const byCategory = await this.victimRepository
      .createQueryBuilder("victim")
      .select("victim.category", "category")
      .addSelect("COUNT(*)", "count")
      .groupBy("victim.category")
      .getRawMany();

    // By year
    const byYear = await this.victimRepository
      .createQueryBuilder("victim")
      .select("EXTRACT(YEAR FROM victim.dateOfDeath)", "year")
      .addSelect("COUNT(*)", "count")
      .where("victim.dateOfDeath IS NOT NULL")
      .groupBy("EXTRACT(YEAR FROM victim.dateOfDeath)")
      .orderBy("year", "ASC")
      .getRawMany();

    return {
      total,
      byCategory,
      byYear,
    };
  }

  // ==================== POLITICAL PRISONERS ====================

  /**
   * Find all political prisoners with filtering and pagination
   */
  async findAllPrisoners(query: PoliticalPrisonerQueryDto) {
    const {
      search,
      status,
      facilityType,
      torture,
      currentlyDetained,
      minConfidence,
      page = 1,
      limit = 20,
      sortBy = "dateArrested",
      sortOrder = "DESC",
    } = query;

    const qb = this.prisonerRepository.createQueryBuilder("prisoner");

    // Only show with confidence level 3+
    qb.where("prisoner.confidenceLevel >= :minConf", {
      minConf: minConfidence || 3,
    });

    if (search) {
      qb.andWhere(
        "(prisoner.fullName ILIKE :search OR prisoner.biography ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere("prisoner.status = :status", { status });
    }

    if (facilityType) {
      qb.andWhere("prisoner.primaryFacilityType = :facilityType", {
        facilityType,
      });
    }

    if (torture !== undefined) {
      qb.andWhere("prisoner.torture = :torture", { torture });
    }

    if (currentlyDetained) {
      qb.andWhere("prisoner.status = :imprisoned", {
        imprisoned: PrisonerStatus.IMPRISONED,
      });
    }

    // Sorting
    const validSortFields = [
      "fullName",
      "dateArrested",
      "dateReleased",
      "createdAt",
      "status",
    ];
    const field = validSortFields.includes(sortBy) ? sortBy : "dateArrested";
    qb.orderBy(`prisoner.${field}`, sortOrder === "ASC" ? "ASC" : "DESC");

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

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
   * Find a single political prisoner by ID
   */
  async findOnePrisoner(id: string): Promise<PoliticalPrisoner> {
    const prisoner = await this.prisonerRepository.findOne({
      where: { id },
      relations: ["arrestingOfficial"],
    });

    if (!prisoner) {
      throw new NotFoundException(`Political prisoner with ID ${id} not found`);
    }

    return prisoner;
  }

  /**
   * Create a new political prisoner record
   */
  async createPrisoner(
    dto: CreatePoliticalPrisonerDto,
  ): Promise<PoliticalPrisoner> {
    const prisoner = this.prisonerRepository.create(dto);
    return this.prisonerRepository.save(prisoner);
  }

  /**
   * Update an existing political prisoner record
   */
  async updatePrisoner(
    id: string,
    dto: UpdatePoliticalPrisonerDto,
  ): Promise<PoliticalPrisoner> {
    const prisoner = await this.findOnePrisoner(id);
    Object.assign(prisoner, dto);
    return this.prisonerRepository.save(prisoner);
  }

  /**
   * Delete a political prisoner record
   */
  async deletePrisoner(id: string): Promise<void> {
    const prisoner = await this.findOnePrisoner(id);
    await this.prisonerRepository.remove(prisoner);
  }

  /**
   * Get political prisoner statistics
   */
  async getPrisonerStatistics() {
    const qb = this.prisonerRepository.createQueryBuilder("prisoner");

    // Total count
    const total = await qb.getCount();

    // Currently detained
    const currentlyDetained = await this.prisonerRepository.count({
      where: { status: PrisonerStatus.IMPRISONED },
    });

    // Tortured
    const tortured = await this.prisonerRepository.count({
      where: { torture: true },
    });

    // By status
    const byStatus = await this.prisonerRepository
      .createQueryBuilder("prisoner")
      .select("prisoner.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("prisoner.status")
      .getRawMany();

    // By facility type
    const byFacility = await this.prisonerRepository
      .createQueryBuilder("prisoner")
      .select("prisoner.primaryFacilityType", "facility")
      .addSelect("COUNT(*)", "count")
      .where("prisoner.primaryFacilityType IS NOT NULL")
      .groupBy("prisoner.primaryFacilityType")
      .getRawMany();

    return {
      total,
      currentlyDetained,
      tortured,
      byStatus,
      byFacility,
    };
  }

  // ==================== EXILE STORIES ====================

  /**
   * Find all exile stories with filtering and pagination
   */
  async findAllExileStories(query: ExileStoryQueryDto) {
    const {
      search,
      reason,
      journeyRoute,
      destination,
      yearFrom,
      yearTo,
      familySeparated,
      page = 1,
      limit = 20,
      sortBy = "yearLeft",
      sortOrder = "DESC",
    } = query;

    const qb = this.exileRepository.createQueryBuilder("exile");

    if (search) {
      qb.andWhere(
        "(exile.fullName ILIKE :search OR exile.displayName ILIKE :search OR exile.story ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (reason) {
      qb.andWhere("exile.reason = :reason", { reason });
    }

    if (journeyRoute) {
      qb.andWhere("exile.journeyRoute = :journeyRoute", { journeyRoute });
    }

    if (destination) {
      qb.andWhere("exile.destination ILIKE :destination", {
        destination: `%${destination}%`,
      });
    }

    if (yearFrom) {
      qb.andWhere("exile.yearLeft >= :yearFrom", { yearFrom });
    }

    if (yearTo) {
      qb.andWhere("exile.yearLeft <= :yearTo", { yearTo });
    }

    if (familySeparated !== undefined) {
      qb.andWhere("exile.familySeparated = :familySeparated", {
        familySeparated,
      });
    }

    // Sorting
    const validSortFields = ["yearLeft", "destination", "createdAt"];
    const field = validSortFields.includes(sortBy) ? sortBy : "yearLeft";
    qb.orderBy(`exile.${field}`, sortOrder === "ASC" ? "ASC" : "DESC");

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

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
   * Find a single exile story by ID
   */
  async findOneExileStory(id: string): Promise<ExileStory> {
    const story = await this.exileRepository.findOne({
      where: { id },
    });

    if (!story) {
      throw new NotFoundException(`Exile story with ID ${id} not found`);
    }

    return story;
  }

  /**
   * Create a new exile story
   */
  async createExileStory(dto: CreateExileStoryDto): Promise<ExileStory> {
    const story = this.exileRepository.create(dto);
    return this.exileRepository.save(story);
  }

  /**
   * Update an existing exile story
   */
  async updateExileStory(
    id: string,
    dto: UpdateExileStoryDto,
  ): Promise<ExileStory> {
    const story = await this.findOneExileStory(id);
    Object.assign(story, dto);
    return this.exileRepository.save(story);
  }

  /**
   * Delete an exile story
   */
  async deleteExileStory(id: string): Promise<void> {
    const story = await this.findOneExileStory(id);
    await this.exileRepository.remove(story);
  }

  /**
   * Get exile statistics for dashboard
   */
  async getExileStatistics() {
    const qb = this.exileRepository.createQueryBuilder("exile");

    // Total stories documented
    const totalStories = await qb.getCount();

    // By destination country
    const byDestination = await this.exileRepository
      .createQueryBuilder("exile")
      .select("exile.destination", "destination")
      .addSelect("COUNT(*)", "count")
      .groupBy("exile.destination")
      .orderBy("count", "DESC")
      .limit(20)
      .getRawMany();

    // By year
    const byYear = await this.exileRepository
      .createQueryBuilder("exile")
      .select("exile.yearLeft", "year")
      .addSelect("COUNT(*)", "count")
      .groupBy("exile.yearLeft")
      .orderBy("year", "ASC")
      .getRawMany();

    // By reason
    const byReason = await this.exileRepository
      .createQueryBuilder("exile")
      .select("exile.reason", "reason")
      .addSelect("COUNT(*)", "count")
      .groupBy("exile.reason")
      .getRawMany();

    // Family separated count
    const familySeparated = await this.exileRepository.count({
      where: { familySeparated: true },
    });

    // Darién Gap crossings
    const darienCrossings = await this.exileRepository.count({
      where: { journeyRoute: "darien_gap" as any },
    });

    return {
      totalStories,
      byDestination,
      byYear,
      byReason,
      familySeparated,
      darienCrossings,
      // Official estimate: 7+ million Venezuelans fled
      officialEstimate: 7000000,
    };
  }

  // ==================== COMBINED STATISTICS ====================

  /**
   * Get overall memorial statistics
   */
  async getOverallStatistics() {
    const [victimStats, prisonerStats, exileStats] = await Promise.all([
      this.getVictimStatistics(),
      this.getPrisonerStatistics(),
      this.getExileStatistics(),
    ]);

    return {
      victims: victimStats,
      politicalPrisoners: prisonerStats,
      exiles: exileStats,
      message:
        "We will remember you. We will tell your story. You will not be forgotten.",
      messageEs: "Te recordaremos. Contaremos tu historia. No serás olvidado.",
    };
  }
}
