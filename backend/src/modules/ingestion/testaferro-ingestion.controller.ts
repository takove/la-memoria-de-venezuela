import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { TestaferroIngestionService } from "./testaferro-ingestion.service";
import { ImportTestaferroDto } from "./dto/import-testaferro.dto";

@Controller("api/v1/ingestion/testaferros")
export class TestaferroIngestionController {
  constructor(private readonly ingestionService: TestaferroIngestionService) {}

  /**
   * Import testaferros from JSON payload
   * POST /api/v1/ingestion/testaferros/json
   */
  @Post("json")
  async importJson(@Body() data: ImportTestaferroDto[]) {
    // Validate data
    const validation = this.ingestionService.validateImportData(data);
    if (!validation.valid) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const result = await this.ingestionService.importFromJson(data);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Import testaferros from CSV file upload
   * POST /api/v1/ingestion/testaferros/csv
   */
  @Post("csv")
  @UseInterceptors(FileInterceptor("file"))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    if (file.mimetype !== "text/csv" && !file.originalname.endsWith(".csv")) {
      throw new BadRequestException("File must be a CSV");
    }

    const result = await this.ingestionService.importFromCsvBuffer(file.buffer);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get import statistics
   * GET /api/v1/ingestion/testaferros/stats
   */
  @Get("stats")
  async getStats() {
    return this.ingestionService.getImportStats();
  }
}
