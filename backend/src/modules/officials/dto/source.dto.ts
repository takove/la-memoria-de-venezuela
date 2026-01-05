import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  IsDateString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export enum SourceType {
  MEDIA = "media",
  OFFICIAL = "official",
  COURT = "court",
  ACADEMIC = "academic",
}

export class SourceDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsUrl()
  archiveUrl?: string;

  @IsEnum(SourceType)
  type: SourceType;

  @IsOptional()
  @IsDateString()
  publicationDate?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  accessedDate?: string;
}
