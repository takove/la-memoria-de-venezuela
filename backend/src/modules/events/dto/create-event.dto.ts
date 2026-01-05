import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDate,
  IsUUID,
  Length,
  IsUrl,
} from "class-validator";
import { Type } from "class-transformer";
import { EventType } from "../../../entities/event.entity";

export class CreateEventDto {
  @IsString()
  @Length(2, 200)
  title: string;

  @IsOptional()
  @IsString()
  @Length(10, 5000)
  description?: string;

  @IsDate()
  @Type(() => Date)
  eventDate: Date;

  @IsEnum(EventType)
  eventType: EventType;

  @IsUUID()
  relatedOfficialId: string;

  @IsOptional()
  @IsUUID()
  relatedBusinessId?: string;

  @IsUrl()
  @Length(1, 1000)
  sourceUrl: string;

  @IsInt()
  @Min(1)
  @Max(10)
  importance: number;
}
