import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Official, Sanction, Case } from "../../entities";
import { SearchService } from "./search.service";
import { SearchController } from "./search.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Official, Sanction, Case])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
