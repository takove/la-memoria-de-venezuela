import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Victim } from '../../entities/victim.entity';
import { PoliticalPrisoner } from '../../entities/political-prisoner.entity';
import { ExileStory } from '../../entities/exile-story.entity';
import { MemorialService } from './memorial.service';
import { MemorialController } from './memorial.controller';

/**
 * Memorial Module
 * 
 * "This is why we exist."
 * 
 * Documents the victims of the Venezuelan crisis:
 * - Victims (those who died)
 * - Political prisoners (those who suffered in dungeons)
 * - Exile stories (the 7+ million who fled)
 * 
 * Every name here represents a Venezuelan who suffered.
 * We will remember them. We will tell their stories.
 * They will not be forgotten.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Victim, PoliticalPrisoner, ExileStory]),
  ],
  controllers: [MemorialController],
  providers: [MemorialService],
  exports: [MemorialService],
})
export class MemorialModule {}
