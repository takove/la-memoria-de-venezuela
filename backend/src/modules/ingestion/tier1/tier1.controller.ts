import { Controller, Get, Post, HttpCode, Logger } from '@nestjs/common';
import { OfacImporterService } from './ofac-importer.service';
import { Tier1MatchService } from './tier1-match.service';

@Controller('tier1')
export class Tier1Controller {
  private readonly logger = new Logger(Tier1Controller.name);

  constructor(
    private ofacImporter: OfacImporterService,
    private tier1Matcher: Tier1MatchService,
  ) {}

  /**
   * Import OFAC SDN list (hardcoded Venezuelan regime officials for now)
   * POST /api/v1/tier1/import/ofac
   */
  @Post('import/ofac')
  @HttpCode(200)
  async importOfac() {
    this.logger.log('Starting OFAC import...');
    const result = await this.ofacImporter.importOfacSdnList();
    return {
      message: 'OFAC import complete',
      ...result,
    };
  }

  /**
   * Get all Tier 1 officials
   * GET /api/v1/tier1/officials
   */
  @Get('officials')
  async getOfficials() {
    const officials = await this.ofacImporter.getAllTier1Officials();
    return {
      total: officials.length,
      data: officials,
    };
  }

  /**
   * Get Tier 1 statistics
   * GET /api/v1/tier1/stats
   */
  @Get('stats')
  async getStats() {
    return this.ofacImporter.getTier1Stats();
  }
}
