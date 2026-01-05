import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Official, StgEntity, StgNode, StgEdge } from "../../../entities";
import { MatchService } from "./match.service";

@Module({
  imports: [TypeOrmModule.forFeature([Official, StgEntity, StgNode, StgEdge])],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
