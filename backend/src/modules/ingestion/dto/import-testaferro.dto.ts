import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  IsDate,
} from "class-validator";
import { Type } from "class-transformer";
import { SourceDto } from "../../officials/dto/source.dto";

export class ImportTestaferroDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  aliases?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsString()
  knownFor?: string;

  @IsOptional()
  @IsString()
  relatedOfficialId?: string;

  @IsOptional()
  @IsString()
  relatedOfficialName?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  confidenceLevel: number;

  @IsOptional()
  @IsArray()
  @Type(() => SourceDto)
  sources?: SourceDto[];

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
