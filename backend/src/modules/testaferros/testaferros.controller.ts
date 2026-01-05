import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from "@nestjs/common";
import { TestaferrosService } from "./testaferros.service";
import {
  Testaferro,
  TestaferroCategory,
  TestaferroStatus,
} from "../../entities";

@Controller("api/v1/testaferros")
export class TestaferrosController {
  constructor(private testaferrosService: TestaferrosService) {}

  /**
   * GET /api/v1/testaferros
   * List all testaferros with pagination and filters
   */
  @Get()
  async findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
    @Query("category") category?: TestaferroCategory,
    @Query("status") status?: TestaferroStatus,
    @Query("country") country?: string,
    @Query("minConfidence", new ParseIntPipe({ optional: true }))
    minConfidence?: number,
  ) {
    return this.testaferrosService.findAll(page || 1, limit || 20, {
      category,
      status,
      country,
      minConfidence,
    });
  }

  /**
   * GET /api/v1/testaferros/search
   * Search by name or identification number
   */
  @Get("search")
  async search(@Query("q") query: string) {
    if (!query || query.length < 2) {
      return { data: [], message: "Query must be at least 2 characters" };
    }
    const data = await this.testaferrosService.search(query);
    return { data };
  }

  /**
   * GET /api/v1/testaferros/statistics
   * Get statistics on testaferros
   */
  @Get("statistics")
  async getStatistics() {
    return this.testaferrosService.getStatistics();
  }

  /**
   * GET /api/v1/testaferros/official/:officialId
   * Get testaferros working for a specific official
   */
  @Get("official/:officialId")
  async findByOfficial(
    @Param("officialId") officialId: string,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.testaferrosService.findByOfficialId(
      officialId,
      page || 1,
      limit || 20,
    );
  }

  /**
   * GET /api/v1/testaferros/:id
   * Get a single testaferro by ID
   */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.testaferrosService.findOne(id);
  }

  /**
   * POST /api/v1/testaferros
   * Create a new testaferro
   */
  @Post()
  async create(@Body() data: Partial<Testaferro>) {
    return this.testaferrosService.create(data);
  }

  /**
   * PATCH /api/v1/testaferros/:id
   * Update a testaferro
   */
  @Patch(":id")
  async update(@Param("id") id: string, @Body() data: Partial<Testaferro>) {
    return this.testaferrosService.update(id, data);
  }

  /**
   * DELETE /api/v1/testaferros/:id
   * Delete a testaferro
   */
  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.testaferrosService.remove(id);
    return { message: "Testaferro deleted successfully" };
  }
}
