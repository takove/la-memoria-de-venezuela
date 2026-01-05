import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tier1Official } from "../../../entities/tier1-official.entity";
import { OfacImporterService } from "./ofac-importer.service";
import { Tier1MatchService } from "./tier1-match.service";
import { Tier1Controller } from "./tier1.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Tier1Official])],
  controllers: [Tier1Controller],
  providers: [OfacImporterService, Tier1MatchService],
  exports: [OfacImporterService, Tier1MatchService],
})
export class Tier1Module {}
