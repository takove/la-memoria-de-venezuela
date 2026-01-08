import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
  Length,
} from "class-validator";
import { Type } from "class-transformer";
import { OfficialStatus } from "../../../entities/official.entity";
import { SourceDto } from "./source.dto";

export class CreateOfficialDto {
  @IsString()
  @Length(2, 100)
  firstName: string;

  @IsString()
  @Length(2, 100)
  lastName: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  birthPlace?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  nationality?: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  cedula?: string;

  @IsOptional()
  @IsString()
  @Length(5, 50)
  passportNumber?: string;

  @IsOptional()
  @IsEnum(OfficialStatus)
  status?: OfficialStatus;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10000)
  biography?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10000)
  biographyEs?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourceDto)
  sources?: SourceDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  confidenceLevel?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}
