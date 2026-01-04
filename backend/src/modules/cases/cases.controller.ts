import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { CasesService, FindCasesOptions } from "./cases.service";
import { CaseType, CaseStatus, Jurisdiction } from "../../entities/case.entity";

@ApiTags("cases")
@Controller("cases")
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @ApiOperation({ summary: "Get all cases with pagination and filtering" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "type", required: false, enum: CaseType })
  @ApiQuery({ name: "status", required: false, enum: CaseStatus })
  @ApiQuery({ name: "jurisdiction", required: false, enum: Jurisdiction })
  @ApiResponse({ status: 200, description: "List of cases" })
  findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("type") type?: CaseType,
    @Query("status") status?: CaseStatus,
    @Query("jurisdiction") jurisdiction?: Jurisdiction,
  ) {
    const options: FindCasesOptions = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      type,
      status,
      jurisdiction,
    };
    return this.casesService.findAll(options);
  }

  @Get("statistics")
  @ApiOperation({ summary: "Get cases statistics" })
  @ApiResponse({ status: 200, description: "Statistics about cases" })
  getStatistics() {
    return this.casesService.getStatistics();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific case by ID" })
  @ApiResponse({ status: 200, description: "Case details" })
  @ApiResponse({ status: 404, description: "Case not found" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.casesService.findOne(id);
  }

  @Get("official/:officialId")
  @ApiOperation({ summary: "Get all cases for an official" })
  @ApiResponse({ status: 200, description: "List of cases for official" })
  findByOfficial(@Param("officialId", ParseUUIDPipe) officialId: string) {
    return this.casesService.findByOfficial(officialId);
  }

  @Post()
  @ApiOperation({ summary: "Create a new case" })
  @ApiResponse({ status: 201, description: "Case created successfully" })
  create(@Body() data: any) {
    return this.casesService.create(data);
  }

  @Post(":caseId/involvements/:officialId")
  @ApiOperation({ summary: "Add an official to a case" })
  @ApiResponse({ status: 201, description: "Involvement created successfully" })
  addInvolvement(
    @Param("caseId", ParseUUIDPipe) caseId: string,
    @Param("officialId", ParseUUIDPipe) officialId: string,
    @Body() data: any,
  ) {
    return this.casesService.addInvolvement(caseId, officialId, data);
  }
}
