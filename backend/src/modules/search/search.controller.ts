import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { SearchService } from "./search.service";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Full-text search across all data" })
  @ApiQuery({ name: "q", required: true, description: "Search query" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({
    name: "types",
    required: false,
    description: "Comma-separated list: officials,sanctions,cases",
  })
  @ApiResponse({ status: 200, description: "Search results" })
  search(
    @Query("q") query: string,
    @Query("limit") limit?: number,
    @Query("types") types?: string,
  ) {
    const typeArray = types
      ? (types.split(",") as ("officials" | "sanctions" | "cases")[])
      : undefined;

    return this.searchService.search({
      query,
      limit: limit ? Number(limit) : 10,
      types: typeArray,
    });
  }

  @Get("autocomplete")
  @ApiOperation({ summary: "Autocomplete suggestions for search" })
  @ApiQuery({ name: "q", required: true, description: "Search query" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Autocomplete suggestions" })
  autocomplete(@Query("q") query: string, @Query("limit") limit?: number) {
    return this.searchService.autocomplete(query, limit ? Number(limit) : 5);
  }

  @Get("highlighted")
  @ApiOperation({ summary: "Get highlighted/featured officials" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Featured officials" })
  getHighlighted(@Query("limit") limit?: number) {
    return this.searchService.getHighlightedOfficials(
      limit ? Number(limit) : 6,
    );
  }
}
