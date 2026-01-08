import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
} from "@nestjs/common";
import { BusinessesService } from "./businesses.service";
import { BusinessCategory } from "../../entities";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";

@Controller("api/v1/businesses")
export class BusinessesController {
  constructor(private businessesService: BusinessesService) {}

  @Get()
  async getBusinesses(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("category") category?: BusinessCategory,
    @Query("country") country?: string,
    @Query("minConfidence") minConfidence?: number,
  ) {
    return this.businessesService.findAll(
      page,
      limit,
      category,
      country,
      minConfidence,
    );
  }

  @Get("search")
  async search(@Query("q") q: string, @Query("limit") limit: number = 10) {
    return this.businessesService.search(q, limit);
  }

  @Get("statistics")
  async getStatistics() {
    return this.businessesService.getStatistics();
  }

  @Get(":id")
  async getBusiness(@Param("id") id: string) {
    return this.businessesService.findOne(id);
  }

  @Get("official/:officialId")
  async getBusinessesByOfficial(
    @Param("officialId") officialId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    return this.businessesService.findByOfficialId(officialId, page, limit);
  }

  @Post()
  @HttpCode(201)
  async createBusiness(@Body() data: CreateBusinessDto) {
    return this.businessesService.create(data);
  }

  @Patch(":id")
  async updateBusiness(
    @Param("id") id: string,
    @Body() data: UpdateBusinessDto,
  ) {
    return this.businessesService.update(id, data);
  }

  @Delete(":id")
  @HttpCode(204)
  async deleteBusiness(@Param("id") id: string) {
    return this.businessesService.delete(id);
  }
}
