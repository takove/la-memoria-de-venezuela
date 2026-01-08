import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testaferro } from '../../entities/testaferro.entity';
import { Official } from '../../entities/official.entity';
import { ImportTestaferroDto } from './dto/import-testaferro.dto';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { Readable } from 'stream';

@Injectable()
export class TestaferroIngestionService {
  private readonly logger = new Logger(TestaferroIngestionService.name);

  constructor(
    @InjectRepository(Testaferro)
    private testaferroRepository: Repository<Testaferro>,
    @InjectRepository(Official)
    private officialRepository: Repository<Official>,
  ) {}

  /**
   * Import testaferros from JSON array
   */
  async importFromJson(data: ImportTestaferroDto[]): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const results: { imported: number; failed: number; errors: string[] } = { imported: 0, failed: 0, errors: [] };

    for (const dto of data) {
      try {
        await this.createTestaferro(dto);
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${dto.fullName}: ${error.message}`);
        this.logger.error(`Failed to import ${dto.fullName}`, error.stack);
      }
    }

    this.logger.log(
      `Import complete: ${results.imported} imported, ${results.failed} failed`,
    );
    return results;
  }

  /**
   * Import testaferros from CSV file
   */
  async importFromCsv(filePath: string): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const results = { imported: 0, failed: 0, errors: [] };
    const rows: ImportTestaferroDto[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Parse CSV row to DTO
          const dto: ImportTestaferroDto = {
            fullName: row.full_name || row.fullName,
            aliases: row.aliases,
            biography: row.biography,
            knownFor: row.known_for || row.knownFor,
            relatedOfficialId: row.related_official_id || row.relatedOfficialId,
            relatedOfficialName:
              row.related_official_name || row.relatedOfficialName,
            confidenceLevel: parseInt(
              row.confidence_level || row.confidenceLevel || '3',
            ),
            nationality: row.nationality,
            dateOfBirth: row.date_of_birth
              ? new Date(row.date_of_birth)
              : undefined,
            placeOfBirth: row.place_of_birth || row.placeOfBirth,
            notes: row.notes,
            sources: row.sources ? JSON.parse(row.sources) : undefined,
          };
          rows.push(dto);
        })
        .on('end', async () => {
          this.logger.log(`Parsed ${rows.length} rows from CSV`);
          const importResults = await this.importFromJson(rows);
          resolve(importResults);
        })
        .on('error', (error) => {
          this.logger.error('CSV parsing error', error.stack);
          reject(error);
        });
    });
  }

  /**
   * Import from CSV buffer (for file uploads)
   */
  async importFromCsvBuffer(buffer: Buffer): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const results = { imported: 0, failed: 0, errors: [] };
    const rows: ImportTestaferroDto[] = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from(buffer.toString());
      stream
        .pipe(csv())
        .on('data', (row) => {
          const dto: ImportTestaferroDto = {
            fullName: row.full_name || row.fullName,
            aliases: row.aliases,
            biography: row.biography,
            knownFor: row.known_for || row.knownFor,
            relatedOfficialId: row.related_official_id || row.relatedOfficialId,
            relatedOfficialName:
              row.related_official_name || row.relatedOfficialName,
            confidenceLevel: parseInt(
              row.confidence_level || row.confidenceLevel || '3',
            ),
            nationality: row.nationality,
            dateOfBirth: row.date_of_birth
              ? new Date(row.date_of_birth)
              : undefined,
            placeOfBirth: row.place_of_birth || row.placeOfBirth,
            notes: row.notes,
            sources: row.sources ? JSON.parse(row.sources) : undefined,
          };
          rows.push(dto);
        })
        .on('end', async () => {
          const importResults = await this.importFromJson(rows);
          resolve(importResults);
        })
        .on('error', reject);
    });
  }

  /**
   * Create a single testaferro with validation
   */
  private async createTestaferro(
    dto: ImportTestaferroDto,
  ): Promise<Testaferro> {
    // Check for duplicates
    const existing = await this.testaferroRepository.findOne({
      where: { fullName: dto.fullName },
    });

    if (existing) {
      throw new BadRequestException(
        `Testaferro "${dto.fullName}" already exists`,
      );
    }

    // Resolve related official if provided
    let beneficialOwner: Official | null = null;
    if (dto.relatedOfficialId) {
      beneficialOwner = await this.officialRepository.findOne({
        where: { id: dto.relatedOfficialId },
      });
      if (!beneficialOwner) {
        this.logger.warn(
          `Related official ${dto.relatedOfficialId} not found for ${dto.fullName}`,
        );
      }
    } else if (dto.relatedOfficialName) {
      // Try to find by name
      beneficialOwner = await this.officialRepository
        .createQueryBuilder('official')
        .where('LOWER(official.fullName) LIKE LOWER(:name)', {
          name: `%${dto.relatedOfficialName}%`,
        })
        .getOne();
    }

    // Create testaferro
    const testaferro = this.testaferroRepository.create({
      fullName: dto.fullName,
      aliases: dto.aliases,
      description: dto.biography,
      beneficialOwner: beneficialOwner || undefined,
      confidenceLevel: dto.confidenceLevel,
      sources: dto.sources || [],
      nationality: dto.nationality,
      dateOfBirth: dto.dateOfBirth ? dto.dateOfBirth.toISOString().split('T')[0] : undefined,
    });

    await this.testaferroRepository.save(testaferro);
    this.logger.log(`Created testaferro: ${dto.fullName}`);
    return testaferro;
  }

  /**
   * Validate import data before processing
   */
  validateImportData(data: ImportTestaferroDto[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const dto = data[i];

      if (!dto.fullName || dto.fullName.trim().length === 0) {
        errors.push(`Row ${i + 1}: fullName is required`);
      }

      if (
        dto.confidenceLevel &&
        (dto.confidenceLevel < 1 || dto.confidenceLevel > 5)
      ) {
        errors.push(
          `Row ${i + 1}: confidenceLevel must be between 1 and 5 (got ${dto.confidenceLevel})`,
        );
      }

      if (dto.sources && !Array.isArray(dto.sources)) {
        errors.push(`Row ${i + 1}: sources must be an array`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get import statistics
   */
  async getImportStats(): Promise<{
    totalTestaferros: number;
    byConfidenceLevel: Record<number, number>;
    withOfficialLinks: number;
    withoutOfficialLinks: number;
  }> {
    const total = await this.testaferroRepository.count();

    const byConfidence = await this.testaferroRepository
      .createQueryBuilder('testaferro')
      .select('testaferro.confidenceLevel', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('testaferro.confidenceLevel')
      .getRawMany();

    const withLinks = await this.testaferroRepository
      .createQueryBuilder('testaferro')
      .where('testaferro.beneficialOwnerId IS NOT NULL')
      .getCount();

    const byConfidenceLevel: Record<number, number> = {};
    byConfidence.forEach((item) => {
      byConfidenceLevel[item.level] = parseInt(item.count);
    });

    return {
      totalTestaferros: total,
      byConfidenceLevel,
      withOfficialLinks: withLinks,
      withoutOfficialLinks: total - withLinks,
    };
  }
}
