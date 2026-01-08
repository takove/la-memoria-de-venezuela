import { PartialType } from "@nestjs/swagger";
import { CreateTestaferroDto } from "./create-testaferro.dto";

export class UpdateTestaferroDto extends PartialType(CreateTestaferroDto) {}
