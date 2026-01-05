import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StgArticle, StgEntity } from "../../../entities";
import { ArticlesService } from "./articles.service";

@Module({
  imports: [TypeOrmModule.forFeature([StgArticle, StgEntity])],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class FetcherModule {}
