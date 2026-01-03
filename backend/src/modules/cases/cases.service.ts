import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case, CaseType, CaseStatus, Jurisdiction } from '../../entities/case.entity';
import { CaseInvolvement } from '../../entities/case-involvement.entity';

export interface FindCasesOptions {
  page?: number;
  limit?: number;
  type?: CaseType;
  status?: CaseStatus;
  jurisdiction?: Jurisdiction;
}

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private casesRepository: Repository<Case>,
    @InjectRepository(CaseInvolvement)
    private involvementsRepository: Repository<CaseInvolvement>,
  ) {}

  async findAll(options: FindCasesOptions = {}) {
    const { page = 1, limit = 20, type, status, jurisdiction } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.casesRepository
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.involvements', 'involvements')
      .leftJoinAndSelect('involvements.official', 'official');

    if (type) {
      queryBuilder.andWhere('case.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('case.status = :status', { status });
    }

    if (jurisdiction) {
      queryBuilder.andWhere('case.jurisdiction = :jurisdiction', { jurisdiction });
    }

    const [cases, total] = await queryBuilder
      .orderBy('case.filingDate', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: cases,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const caseEntity = await this.casesRepository.findOne({
      where: { id },
      relations: ['involvements', 'involvements.official'],
    });

    if (!caseEntity) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }

    return caseEntity;
  }

  async findByOfficial(officialId: string) {
    return this.involvementsRepository.find({
      where: { officialId },
      relations: ['case'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<Case>) {
    const caseEntity = this.casesRepository.create(data);
    return this.casesRepository.save(caseEntity);
  }

  async addInvolvement(caseId: string, officialId: string, data: Partial<CaseInvolvement>) {
    const involvement = this.involvementsRepository.create({
      ...data,
      caseId,
      officialId,
    });
    return this.involvementsRepository.save(involvement);
  }

  async getStatistics() {
    const total = await this.casesRepository.count();

    const byType = await this.casesRepository
      .createQueryBuilder('case')
      .select('case.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('case.type')
      .getRawMany();

    const byJurisdiction = await this.casesRepository
      .createQueryBuilder('case')
      .select('case.jurisdiction', 'jurisdiction')
      .addSelect('COUNT(*)', 'count')
      .groupBy('case.jurisdiction')
      .getRawMany();

    const byStatus = await this.casesRepository
      .createQueryBuilder('case')
      .select('case.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('case.status')
      .getRawMany();

    return {
      total,
      byType,
      byJurisdiction,
      byStatus,
    };
  }
}
