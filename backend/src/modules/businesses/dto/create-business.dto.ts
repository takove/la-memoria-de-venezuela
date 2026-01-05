import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
  Length,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";
import {
  BusinessCategory,
  BusinessStatus,
} from "../../../entities/business.entity";
import { SourceDto } from "../../officials/dto/source.dto";

export class CreateBusinessDto {
  @IsString()
  @Length(2, 500)
  name: string;

  @IsOptional()
  @IsString()
  @Length(5, 100)
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  country?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  industry?: string;

  @IsOptional()
  @IsEnum(BusinessCategory)
  category?: BusinessCategory;

  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @IsOptional()
  @IsNumber()
  estimatedContractValue?: number;

  @IsOptional()
  @IsNumber()
  estimatedTheftAmount?: number;

  @IsOptional()
  @IsString()
  @Length(10, 5000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(10, 5000)
  descriptionEs?: string;

  @IsOptional()
  @IsUUID()
  beneficialOwnerId?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  frontMan?: string;

  @IsOptional()
  @IsArray()
  contracts?: Array<{
    title: string;
    titleEs?: string;
    value: number;
    date: string;
    awardedBy: string;
    status: "completed" | "incomplete" | "fraudulent";
    description?: string;
  }>;

  @IsOptional()
  @IsArray()
  sanctions?: Array<{
    type: string;
    imposedDate: string;
    imposedBy: string;
    reason: string;
  }>;

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
  @IsBoolean()
  isDisputed?: boolean;

  @IsOptional()
  @IsString()
  disputeDetails?: string;

  @IsOptional()
  @IsDateString()
  dissolutionDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
