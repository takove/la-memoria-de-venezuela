import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Official, Position } from '../../entities';
import { OfficialsService } from './officials.service';
import { OfficialsController } from './officials.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Official, Position])],
  controllers: [OfficialsController],
  providers: [OfficialsService],
  exports: [OfficialsService],
})
export class OfficialsModule {}
