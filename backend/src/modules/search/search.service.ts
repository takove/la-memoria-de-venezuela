import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Official } from '../../entities/official.entity';
import { Sanction } from '../../entities/sanction.entity';
import { Case } from '../../entities/case.entity';

export interface SearchResult {
  officials: Official[];
  sanctions: Sanction[];
  cases: Case[];
  totalResults: number;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  types?: ('officials' | 'sanctions' | 'cases')[];
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Official)
    private officialsRepository: Repository<Official>,
    @InjectRepository(Sanction)
    private sanctionsRepository: Repository<Sanction>,
    @InjectRepository(Case)
    private casesRepository: Repository<Case>,
  ) {}

  async search(options: SearchOptions): Promise<SearchResult> {
    const { query, limit = 10, types = ['officials', 'sanctions', 'cases'] } = options;
    const searchPattern = `%${query}%`;

    const result: SearchResult = {
      officials: [],
      sanctions: [],
      cases: [],
      totalResults: 0,
    };

    // Search officials
    if (types.includes('officials')) {
      result.officials = await this.officialsRepository
        .createQueryBuilder('official')
        .leftJoinAndSelect('official.sanctions', 'sanctions')
        .where('official.fullName ILIKE :pattern', { pattern: searchPattern })
        .orWhere('official.aliases::text ILIKE :pattern', { pattern: searchPattern })
        .orWhere('official.cedula ILIKE :pattern', { pattern: searchPattern })
        .orWhere('official.biography ILIKE :pattern', { pattern: searchPattern })
        .orWhere('official.biographyEs ILIKE :pattern', { pattern: searchPattern })
        .take(limit)
        .getMany();
    }

    // Search sanctions
    if (types.includes('sanctions')) {
      result.sanctions = await this.sanctionsRepository
        .createQueryBuilder('sanction')
        .leftJoinAndSelect('sanction.official', 'official')
        .where('sanction.reason ILIKE :pattern', { pattern: searchPattern })
        .orWhere('sanction.reasonEs ILIKE :pattern', { pattern: searchPattern })
        .orWhere('sanction.programName ILIKE :pattern', { pattern: searchPattern })
        .orWhere('official.fullName ILIKE :pattern', { pattern: searchPattern })
        .take(limit)
        .getMany();
    }

    // Search cases
    if (types.includes('cases')) {
      result.cases = await this.casesRepository
        .createQueryBuilder('case')
        .leftJoinAndSelect('case.involvements', 'involvements')
        .leftJoinAndSelect('involvements.official', 'official')
        .where('case.title ILIKE :pattern', { pattern: searchPattern })
        .orWhere('case.titleEs ILIKE :pattern', { pattern: searchPattern })
        .orWhere('case.description ILIKE :pattern', { pattern: searchPattern })
        .orWhere('case.descriptionEs ILIKE :pattern', { pattern: searchPattern })
        .orWhere('case.caseNumber ILIKE :pattern', { pattern: searchPattern })
        .orWhere('case.charges::text ILIKE :pattern', { pattern: searchPattern })
        .take(limit)
        .getMany();
    }

    result.totalResults =
      result.officials.length + result.sanctions.length + result.cases.length;

    return result;
  }

  async autocomplete(query: string, limit = 5) {
    const searchPattern = `${query}%`;

    const officials = await this.officialsRepository
      .createQueryBuilder('official')
      .select(['official.id', 'official.fullName', 'official.photoUrl'])
      .where('official.fullName ILIKE :pattern', { pattern: searchPattern })
      .orWhere('official.lastName ILIKE :pattern', { pattern: searchPattern })
      .take(limit)
      .getMany();

    return officials.map((o) => ({
      id: o.id,
      name: o.fullName,
      type: 'official',
      photoUrl: o.photoUrl,
    }));
  }

  async getHighlightedOfficials(limit = 6) {
    // Get officials with most sanctions
    return this.officialsRepository
      .createQueryBuilder('official')
      .leftJoinAndSelect('official.sanctions', 'sanctions')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(s.id)', 'sanctionCount')
          .from(Sanction, 's')
          .where('s.officialId = official.id');
      }, 'sanctionCount')
      .orderBy('sanctionCount', 'DESC')
      .take(limit)
      .getMany();
  }
}
