import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StgArticle, StgEntity, StgRelation } from "../../../entities";
import { EntitiesService } from "./entities.service";
import { WinkNerService } from "./wink-ner.service";

@Module({
  imports: [TypeOrmModule.forFeature([StgArticle, StgEntity, StgRelation])],
  providers: [EntitiesService, WinkNerService],
  exports: [EntitiesService, WinkNerService],
})
export class NerModule {}
