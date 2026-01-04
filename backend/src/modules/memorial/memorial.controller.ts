import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { MemorialService } from "./memorial.service";
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
 * Memorial Controller
 *
 * "This is why we exist."
 *
 * API endpoints for the victims memorial.
 * Every name here represents a Venezuelan who suffered.
 */
@Controller("memorial")
export class MemorialController {
  constructor(private readonly memorialService: MemorialService) {}

  // ==================== OVERALL STATISTICS ====================

  /**
   * GET /api/v1/memorial/statistics
   * Get overall memorial statistics
   */
  @Get("statistics")
  async getOverallStatistics() {
    return this.memorialService.getOverallStatistics();
  }

  // ==================== VICTIMS ====================

  /**
   * GET /api/v1/memorial/victims
   * Get all victims with filtering and pagination
   */
  @Get("victims")
  async findAllVictims(@Query() query: VictimQueryDto) {
    return this.memorialService.findAllVictims(query);
  }

  /**
   * GET /api/v1/memorial/victims/statistics
   * Get victim statistics
   */
  @Get("victims/statistics")
  async getVictimStatistics() {
    return this.memorialService.getVictimStatistics();
  }

  /**
   * GET /api/v1/memorial/victims/:id
   * Get a single victim by ID
   */
  @Get("victims/:id")
  async findOneVictim(@Param("id", ParseUUIDPipe) id: string) {
    return this.memorialService.findOneVictim(id);
  }

  /**
   * POST /api/v1/memorial/victims
   * Create a new victim record
   */
  @Post("victims")
  async createVictim(@Body() dto: CreateVictimDto) {
    return this.memorialService.createVictim(dto);
  }

  /**
   * PATCH /api/v1/memorial/victims/:id
   * Update an existing victim record
   */
  @Patch("victims/:id")
  async updateVictim(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateVictimDto,
  ) {
    return this.memorialService.updateVictim(id, dto);
  }

  /**
   * DELETE /api/v1/memorial/victims/:id
   * Delete a victim record
   */
  @Delete("victims/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVictim(@Param("id", ParseUUIDPipe) id: string) {
    await this.memorialService.deleteVictim(id);
  }

  // ==================== POLITICAL PRISONERS ====================

  /**
   * GET /api/v1/memorial/prisoners
   * Get all political prisoners with filtering and pagination
   */
  @Get("prisoners")
  async findAllPrisoners(@Query() query: PoliticalPrisonerQueryDto) {
    return this.memorialService.findAllPrisoners(query);
  }

  /**
   * GET /api/v1/memorial/prisoners/statistics
   * Get political prisoner statistics
   */
  @Get("prisoners/statistics")
  async getPrisonerStatistics() {
    return this.memorialService.getPrisonerStatistics();
  }

  /**
   * GET /api/v1/memorial/prisoners/:id
   * Get a single political prisoner by ID
   */
  @Get("prisoners/:id")
  async findOnePrisoner(@Param("id", ParseUUIDPipe) id: string) {
    return this.memorialService.findOnePrisoner(id);
  }

  /**
   * POST /api/v1/memorial/prisoners
   * Create a new political prisoner record
   */
  @Post("prisoners")
  async createPrisoner(@Body() dto: CreatePoliticalPrisonerDto) {
    return this.memorialService.createPrisoner(dto);
  }

  /**
   * PATCH /api/v1/memorial/prisoners/:id
   * Update an existing political prisoner record
   */
  @Patch("prisoners/:id")
  async updatePrisoner(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePoliticalPrisonerDto,
  ) {
    return this.memorialService.updatePrisoner(id, dto);
  }

  /**
   * DELETE /api/v1/memorial/prisoners/:id
   * Delete a political prisoner record
   */
  @Delete("prisoners/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePrisoner(@Param("id", ParseUUIDPipe) id: string) {
    await this.memorialService.deletePrisoner(id);
  }

  // ==================== EXILE STORIES ====================

  /**
   * GET /api/v1/memorial/exiles
   * Get all exile stories with filtering and pagination
   */
  @Get("exiles")
  async findAllExileStories(@Query() query: ExileStoryQueryDto) {
    return this.memorialService.findAllExileStories(query);
  }

  /**
   * GET /api/v1/memorial/exiles/statistics
   * Get exile statistics
   */
  @Get("exiles/statistics")
  async getExileStatistics() {
    return this.memorialService.getExileStatistics();
  }

  /**
   * GET /api/v1/memorial/exiles/:id
   * Get a single exile story by ID
   */
  @Get("exiles/:id")
  async findOneExileStory(@Param("id", ParseUUIDPipe) id: string) {
    return this.memorialService.findOneExileStory(id);
  }

  /**
   * POST /api/v1/memorial/exiles
   * Create a new exile story
   */
  @Post("exiles")
  async createExileStory(@Body() dto: CreateExileStoryDto) {
    return this.memorialService.createExileStory(dto);
  }

  /**
   * PATCH /api/v1/memorial/exiles/:id
   * Update an existing exile story
   */
  @Patch("exiles/:id")
  async updateExileStory(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateExileStoryDto,
  ) {
    return this.memorialService.updateExileStory(id, dto);
  }

  /**
   * DELETE /api/v1/memorial/exiles/:id
   * Delete an exile story
   */
  @Delete("exiles/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExileStory(@Param("id", ParseUUIDPipe) id: string) {
    await this.memorialService.deleteExileStory(id);
  }
}
