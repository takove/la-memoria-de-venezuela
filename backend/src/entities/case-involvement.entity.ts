import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Official } from "./official.entity";
import { Case } from "./case.entity";

export enum InvolvementRole {
  DEFENDANT = "defendant",
  WITNESS = "witness",
  ACCUSED = "accused",
  CONVICTED = "convicted",
  MENTIONED = "mentioned",
}

@Entity("case_involvements")
@Index(["officialId", "caseId"], { unique: true })
export class CaseInvolvement {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "official_id" })
  officialId: string;

  @ManyToOne(() => Official, (official) => official.caseInvolvements, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "official_id" })
  official: Official;

  @Column({ name: "case_id" })
  caseId: string;

  @ManyToOne(() => Case, (caseEntity) => caseEntity.involvements, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "case_id" })
  case: Case;

  @Column({
    type: "enum",
    enum: InvolvementRole,
    default: InvolvementRole.DEFENDANT,
  })
  role: InvolvementRole;

  @Column("text", { nullable: true })
  details: string;

  @Column("text", { name: "details_es", nullable: true })
  detailsEs: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
