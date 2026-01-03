import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SanctionsService, FindSanctionsOptions } from './sanctions.service';
import { SanctionType, SanctionStatus } from '../../entities/sanction.entity';

@ApiTags('sanctions')
@Controller('sanctions')
export class SanctionsController {
  constructor(private readonly sanctionsService: SanctionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sanctions with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: SanctionType })
  @ApiQuery({ name: 'status', required: false, enum: SanctionStatus })
  @ApiResponse({ status: 200, description: 'List of sanctions' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: SanctionType,
    @Query('status') status?: SanctionStatus,
  ) {
    const options: FindSanctionsOptions = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      type,
      status,
    };
    return this.sanctionsService.findAll(options);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get sanctions statistics' })
  @ApiResponse({ status: 200, description: 'Statistics about sanctions' })
  getStatistics() {
    return this.sanctionsService.getStatistics();
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get sanctions timeline' })
  @ApiResponse({ status: 200, description: 'Timeline of sanctions' })
  getTimeline() {
    return this.sanctionsService.getTimeline();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific sanction by ID' })
  @ApiResponse({ status: 200, description: 'Sanction details' })
  @ApiResponse({ status: 404, description: 'Sanction not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sanctionsService.findOne(id);
  }

  @Get('official/:officialId')
  @ApiOperation({ summary: 'Get all sanctions for an official' })
  @ApiResponse({ status: 200, description: 'List of sanctions for official' })
  findByOfficial(@Param('officialId', ParseUUIDPipe) officialId: string) {
    return this.sanctionsService.findByOfficial(officialId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new sanction record' })
  @ApiResponse({ status: 201, description: 'Sanction created successfully' })
  create(@Body() data: any) {
    return this.sanctionsService.create(data);
  }
}
