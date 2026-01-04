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
import {
  PrisonerStatus,
  FacilityType,
} from "../../../entities/political-prisoner.entity";

class EvidenceSourceDto {
  @IsString()
  type: "foro_penal" | "un_report" | "amnesty" | "hrw" | "news" | "testimony";

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
}

export class CreatePoliticalPrisonerDto {
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
  @Length(1, 100)
  profession?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsEnum(PrisonerStatus)
  status: PrisonerStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateArrested?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateReleased?: Date;

  @IsOptional()
  @IsInt()
  @Min(0)
  daysDetained?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];

  @IsOptional()
  @IsEnum(FacilityType)
  primaryFacilityType?: FacilityType;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  arrestLocation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  charges?: string[];

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  chargesDescription?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  chargesDescriptionEs?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  legalStatus?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sentenceYears?: number;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  legalDefense?: string;

  @IsOptional()
  @IsBoolean()
  torture?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  tortureDescription?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  tortureDescriptionEs?: string;

  @IsOptional()
  @IsBoolean()
  solitaryConfinement?: boolean;

  @IsOptional()
  @IsBoolean()
  medicalAttentionDenied?: boolean;

  @IsOptional()
  @IsBoolean()
  familyVisitsDenied?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  conditionsDescription?: string;

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
  @Length(1, 10000)
  testimony?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  testimonyEs?: string;

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
  @IsString()
  @Length(1, 50)
  foroPenalCaseId?: string;

  @IsOptional()
  @IsString()
  arrestingOfficialId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  responsibleEntities?: string;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  familyConsent?: boolean;
}

export class UpdatePoliticalPrisonerDto {
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
  @Length(1, 100)
  profession?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsEnum(PrisonerStatus)
  status?: PrisonerStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateArrested?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateReleased?: Date;

  @IsOptional()
  @IsInt()
  @Min(0)
  daysDetained?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];

  @IsOptional()
  @IsEnum(FacilityType)
  primaryFacilityType?: FacilityType;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  arrestLocation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  charges?: string[];

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  chargesDescription?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  chargesDescriptionEs?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  legalStatus?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sentenceYears?: number;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  legalDefense?: string;

  @IsOptional()
  @IsBoolean()
  torture?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  tortureDescription?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  tortureDescriptionEs?: string;

  @IsOptional()
  @IsBoolean()
  solitaryConfinement?: boolean;

  @IsOptional()
  @IsBoolean()
  medicalAttentionDenied?: boolean;

  @IsOptional()
  @IsBoolean()
  familyVisitsDenied?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  conditionsDescription?: string;

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
  @Length(1, 10000)
  testimony?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  testimonyEs?: string;

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
  @IsString()
  @Length(1, 50)
  foroPenalCaseId?: string;

  @IsOptional()
  @IsString()
  arrestingOfficialId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  responsibleEntities?: string;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  familyConsent?: boolean;
}

export class PoliticalPrisonerQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PrisonerStatus)
  status?: PrisonerStatus;

  @IsOptional()
  @IsEnum(FacilityType)
  facilityType?: FacilityType;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  torture?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  currentlyDetained?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  minConfidence?: number;

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
  sortBy?:
    | "fullName"
    | "dateArrested"
    | "dateReleased"
    | "createdAt"
    | "status";

  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC";
}
