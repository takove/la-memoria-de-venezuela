import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDate,
  IsBoolean,
  IsArray,
  ValidateNested,
  Length,
  IsUrl,
} from "class-validator";
import { Type } from "class-transformer";
import { VictimCategory } from "../../../entities/victim.entity";

class EvidenceSourceDto {
  @IsString()
  type:
    | "official_record"
    | "ngo_report"
    | "news_article"
    | "witness"
    | "video"
    | "photo";

  @IsString()
  @Length(1, 500)
  title: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsBoolean()
  archived?: boolean;

  @IsOptional()
  @IsUrl()
  archiveUrl?: string;
}

class MemorialDto {
  @IsString()
  type: "physical" | "virtual" | "mural" | "monument" | "ceremony";

  @IsString()
  @Length(1, 200)
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  date?: string;
}

export class CreateVictimDto {
  @IsString()
  @Length(2, 200)
  fullName: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  placeOfBirth?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  nationality?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  occupation?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfDeath?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  placeOfDeath?: string;

  @IsEnum(VictimCategory)
  category: VictimCategory;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  circumstance?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  circumstanceEs?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  biography?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  biographyEs?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  dreams?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  dreamsEs?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  familyTestimony?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  familyTestimonyEs?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  confidenceLevel?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceSourceDto)
  evidenceSources?: EvidenceSourceDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  internationalReports?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemorialDto)
  memorials?: MemorialDto[];

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  tributeMessage?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  tributeMessageEs?: string;

  @IsOptional()
  @IsString()
  responsibleOfficialId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  chainOfCommand?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  justiceStatus?: string;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  familyConsent?: boolean;
}

export class UpdateVictimDto {
  @IsOptional()
  @IsString()
  @Length(2, 200)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  placeOfBirth?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  nationality?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  occupation?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfDeath?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  placeOfDeath?: string;

  @IsOptional()
  @IsEnum(VictimCategory)
  category?: VictimCategory;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  circumstance?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  circumstanceEs?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  biography?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  biographyEs?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  dreams?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  dreamsEs?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  familyTestimony?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  familyTestimonyEs?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  confidenceLevel?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceSourceDto)
  evidenceSources?: EvidenceSourceDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  internationalReports?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemorialDto)
  memorials?: MemorialDto[];

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  tributeMessage?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  tributeMessageEs?: string;

  @IsOptional()
  @IsString()
  responsibleOfficialId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  chainOfCommand?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  justiceStatus?: string;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  familyConsent?: boolean;
}

export class VictimQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(VictimCategory)
  category?: VictimCategory;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  minConfidence?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearFrom?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearTo?: number;

  @IsOptional()
  @IsString()
  placeOfDeath?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: "fullName" | "dateOfDeath" | "createdAt" | "category";

  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC";
}
