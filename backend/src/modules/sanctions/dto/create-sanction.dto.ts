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
  IsDateString,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";
import {
  SanctionType,
  SanctionStatus,
} from "../../../entities/sanction.entity";
import { SourceDto } from "../../officials/dto/source.dto";

export class CreateSanctionDto {
  @IsUUID()
  officialId: string;

  @IsEnum(SanctionType)
  type: SanctionType;

  @IsString()
  @Length(2, 50)
  programCode: string;

  @IsString()
  @Length(2, 200)
  programName: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  ofacId?: string;

  @IsOptional()
  @IsString()
  @Length(10, 5000)
  reason?: string;

  @IsOptional()
  @IsString()
  @Length(10, 5000)
  reasonEs?: string;

  @IsDateString()
  imposedDate: string;

  @IsOptional()
  @IsDateString()
  liftedDate?: string;

  @IsOptional()
  @IsEnum(SanctionStatus)
  status?: SanctionStatus;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  treasuryPressRelease?: string;

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
