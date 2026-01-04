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
  ExileReason,
  JourneyRoute,
} from "../../../entities/exile-story.entity";

class EvidenceSourceDto {
  @IsString()
  type: "interview" | "document" | "photo" | "video" | "organization";

  @IsString()
  @Length(1, 500)
  description: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  date?: string;
}

export class CreateExileStoryDto {
  @IsOptional()
  @IsString()
  @Length(2, 200)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  ageAtDeparture?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  profession?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  previousProfession?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  originCity?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  originState?: string;

  @IsInt()
  @Min(1999)
  @Max(2100)
  yearLeft: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  monthLeft?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  exactDateLeft?: Date;

  @IsEnum(ExileReason)
  reason: ExileReason;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  reasonDetail?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  reasonDetailEs?: string;

  @IsOptional()
  @IsEnum(JourneyRoute)
  journeyRoute?: JourneyRoute;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  journeyDescription?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  journeyDescriptionEs?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countriesCrossed?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  journeyDays?: number;

  @IsString()
  @Length(1, 100)
  destination: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  destinationCity?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  currentStatus?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  whatTheyLeft?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  whatTheyLeftEs?: string;

  @IsOptional()
  @IsBoolean()
  familySeparated?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  familySituation?: string;

  @IsOptional()
  @IsBoolean()
  careerLost?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  careerDescription?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  story?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  storyEs?: string;

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
  @Length(1, 2000)
  messageToVenezuela?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  messageToVenezuelaEs?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  currentSituation?: string;

  @IsOptional()
  @IsBoolean()
  wantsToReturn?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  hopesForFuture?: string;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

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
}

export class UpdateExileStoryDto {
  @IsOptional()
  @IsString()
  @Length(2, 200)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  ageAtDeparture?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  profession?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  previousProfession?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  originCity?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  originState?: string;

  @IsOptional()
  @IsInt()
  @Min(1999)
  @Max(2100)
  yearLeft?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  monthLeft?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  exactDateLeft?: Date;

  @IsOptional()
  @IsEnum(ExileReason)
  reason?: ExileReason;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  reasonDetail?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  reasonDetailEs?: string;

  @IsOptional()
  @IsEnum(JourneyRoute)
  journeyRoute?: JourneyRoute;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  journeyDescription?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  journeyDescriptionEs?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countriesCrossed?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  journeyDays?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  destination?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  destinationCity?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  currentStatus?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  whatTheyLeft?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  whatTheyLeftEs?: string;

  @IsOptional()
  @IsBoolean()
  familySeparated?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  familySituation?: string;

  @IsOptional()
  @IsBoolean()
  careerLost?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  careerDescription?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  story?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  storyEs?: string;

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
  @Length(1, 2000)
  messageToVenezuela?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  messageToVenezuelaEs?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  currentSituation?: string;

  @IsOptional()
  @IsBoolean()
  wantsToReturn?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  hopesForFuture?: string;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

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
}

export class ExileStoryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ExileReason)
  reason?: ExileReason;

  @IsOptional()
  @IsEnum(JourneyRoute)
  journeyRoute?: JourneyRoute;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsInt()
  @Min(1999)
  @Max(2100)
  yearFrom?: number;

  @IsOptional()
  @IsInt()
  @Min(1999)
  @Max(2100)
  yearTo?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  familySeparated?: boolean;

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
  sortBy?: "yearLeft" | "destination" | "createdAt";

  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC";
}
