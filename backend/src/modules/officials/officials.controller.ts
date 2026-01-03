import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { OfficialsService, FindOfficialsOptions } from './officials.service';
import { OfficialStatus } from '../../entities/official.entity';

@ApiTags('officials')
@Controller('officials')
export class OfficialsController {
  constructor(private readonly officialsService: OfficialsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all officials with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: OfficialStatus })
  @ApiResponse({ status: 200, description: 'List of officials' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: OfficialStatus,
  ) {
    const options: FindOfficialsOptions = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      status,
    };
    return this.officialsService.findAll(options);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get officials statistics' })
  @ApiResponse({ status: 200, description: 'Statistics about officials' })
  getStatistics() {
    return this.officialsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific official by ID' })
  @ApiResponse({ status: 200, description: 'Official details' })
  @ApiResponse({ status: 404, description: 'Official not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.officialsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new official' })
  @ApiResponse({ status: 201, description: 'Official created successfully' })
  create(@Body() data: any) {
    return this.officialsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an official' })
  @ApiResponse({ status: 200, description: 'Official updated successfully' })
  @ApiResponse({ status: 404, description: 'Official not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
    return this.officialsService.update(id, data);
  }
}
