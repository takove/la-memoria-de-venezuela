import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export enum SourceType {
  MEDIA = "media",
  OFFICIAL = "official",
  COURT = "court",
  ACADEMIC = "academic",
}

export class SourceReferenceDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsUrl()
  archiveUrl?: string;

  @IsEnum(SourceType)
  type: SourceType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publicationDate?: Date;
}

export class CreateBusinessDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourceReferenceDto)
  sources?: SourceReferenceDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  confidenceLevel?: number;
}
