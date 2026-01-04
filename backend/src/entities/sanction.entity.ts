import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Official } from "./official.entity";

export enum SanctionType {
  OFAC_SDN = "ofac_sdn", // Specially Designated Nationals
  OFAC_NS_PLC = "ofac_ns_plc", // Non-SDN Palestinian Legislative Council
  EU = "eu", // European Union sanctions
  CANADA = "canada", // Canadian sanctions
  UK = "uk", // UK sanctions
  OTHER = "other",
}

export enum SanctionStatus {
  ACTIVE = "active",
  LIFTED = "lifted",
  MODIFIED = "modified",
}

@Entity("sanctions")
@Index(["type", "status"])
@Index(["imposedDate"])
export class Sanction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "official_id" })
  officialId: string;

  @ManyToOne(() => Official, (official) => official.sanctions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "official_id" })
  official: Official;

  @Column({
    type: "enum",
    enum: SanctionType,
    default: SanctionType.OFAC_SDN,
  })
  type: SanctionType;

  @Column({ name: "program_code", length: 50 })
  programCode: string;

  @Column({ name: "program_name", length: 200 })
  programName: string;

  @Column({ name: "ofac_id", length: 50, nullable: true })
  ofacId: string;

  @Column("text", { nullable: true })
  reason: string;

  @Column("text", { name: "reason_es", nullable: true })
  reasonEs: string;

  @Column({ name: "imposed_date", type: "date" })
  imposedDate: Date;

  @Column({ name: "lifted_date", type: "date", nullable: true })
  liftedDate: Date;

  @Column({
    type: "enum",
    enum: SanctionStatus,
    default: SanctionStatus.ACTIVE,
  })
  status: SanctionStatus;

  @Column({ name: "source_url", length: 500, nullable: true })
  sourceUrl: string;

  @Column({ name: "treasury_press_release", length: 500, nullable: true })
  treasuryPressRelease: string;

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
