import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

@ApiTags("events")
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: "Get all events with pagination" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "List of events" })
  findAll(@Query("page") page?: number, @Query("limit") limit?: number) {
    return this.eventsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get("official/:officialId")
  @ApiOperation({ summary: "Get all events for a specific official" })
  @ApiResponse({ status: 200, description: "List of events for the official" })
  @ApiResponse({ status: 404, description: "Official not found" })
  findByOfficial(@Param("officialId", ParseUUIDPipe) officialId: string) {
    return this.eventsService.findByOfficial(officialId);
  }

  @Get("business/:businessId")
  @ApiOperation({ summary: "Get all events for a specific business" })
  @ApiResponse({ status: 200, description: "List of events for the business" })
  @ApiResponse({ status: 404, description: "Business not found" })
  findByBusiness(@Param("businessId", ParseUUIDPipe) businessId: string) {
    return this.eventsService.findByBusiness(businessId);
  }

  @Get("timeline")
  @ApiOperation({ summary: "Get global timeline with optional date range" })
  @ApiQuery({ name: "from", required: false, type: String })
  @ApiQuery({ name: "to", required: false, type: String })
  @ApiResponse({ status: 200, description: "Timeline of events" })
  findGlobal(@Query("from") from?: string, @Query("to") to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.eventsService.findGlobal(fromDate, toDate);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific event by ID" })
  @ApiResponse({ status: 200, description: "Event details" })
  @ApiResponse({ status: 404, description: "Event not found" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new event" })
  @ApiResponse({ status: 201, description: "Event created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an event" })
  @ApiResponse({ status: 200, description: "Event updated successfully" })
  @ApiResponse({ status: 404, description: "Event not found" })
  @ApiResponse({ status: 400, description: "Bad request" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an event" })
  @ApiResponse({ status: 204, description: "Event deleted successfully" })
  @ApiResponse({ status: 404, description: "Event not found" })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventsService.remove(id);
  }
}
