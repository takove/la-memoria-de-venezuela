import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Testaferro } from "../../entities";
import { TestaferrosService } from "./testaferros.service";
import { TestaferrosController } from "./testaferros.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Testaferro])],
  providers: [TestaferrosService],
  controllers: [TestaferrosController],
  exports: [TestaferrosService],
})
export class TestaferrosModule {}
