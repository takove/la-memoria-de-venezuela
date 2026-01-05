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
  TestaferroCategory,
  TestaferroStatus,
} from "../../../entities/testaferro.entity";
import { SourceDto } from "../../officials/dto/source.dto";

export class CreateTestaferroDto {
  @IsString()
  @Length(2, 200)
  fullName: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  aliases?: string;

  @IsOptional()
  @IsString()
  @Length(5, 50)
  identificationNumber?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  identificationType?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  nationality?: string;

  @IsOptional()
  @IsUUID()
  beneficialOwnerId?: string;

  @IsOptional()
  @IsString()
  relationshipToOfficial?: string;

  @IsOptional()
  @IsString()
  relationshipToOfficialEs?: string;

  @IsOptional()
  @IsEnum(TestaferroCategory)
  category?: TestaferroCategory;

  @IsOptional()
  @IsEnum(TestaferroStatus)
  status?: TestaferroStatus;

  @IsOptional()
  @IsString()
  statusNotes?: string;

  @IsOptional()
  @IsString()
  @Length(10, 5000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(10, 5000)
  descriptionEs?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  country?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @IsOptional()
  @IsString()
  knownResidencies?: string;

  @IsOptional()
  @IsNumber()
  estimatedWealthAmount?: number;

  @IsOptional()
  @IsString()
  knownAssets?: string;

  @IsOptional()
  @IsString()
  bankAccounts?: string;

  @IsOptional()
  @IsString()
  businessStakes?: string;

  @IsOptional()
  @IsString()
  bankingConnections?: string;

  @IsOptional()
  @IsString()
  tradingPartners?: string;

  @IsOptional()
  @IsString()
  knownAssociates?: string;

  @IsOptional()
  @IsString()
  indictments?: string;

  @IsOptional()
  @IsString()
  sanctions?: string;

  @IsOptional()
  @IsString()
  casesInvolvement?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  confidenceLevel?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourceDto)
  sources?: SourceDto[];

  @IsOptional()
  @IsString()
  evidenceSources?: string;

  @IsOptional()
  @IsBoolean()
  isDisputed?: boolean;

  @IsOptional()
  @IsString()
  disputeNotes?: string;

  @IsOptional()
  @IsDateString()
  dissolutionDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
