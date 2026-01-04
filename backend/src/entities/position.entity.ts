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

export enum PositionBranch {
  EXECUTIVE = "executive",
  LEGISLATIVE = "legislative",
  JUDICIAL = "judicial",
  MILITARY = "military",
  INTELLIGENCE = "intelligence",
  STATE_ENTERPRISE = "state_enterprise",
  OTHER = "other",
}

@Entity("positions")
@Index(["officialId"])
@Index(["branch"])
@Index(["startDate", "endDate"])
export class Position {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "official_id" })
  officialId: string;

  @ManyToOne(() => Official, { onDelete: "CASCADE" })
  @JoinColumn({ name: "official_id" })
  official: Official;

  @Column({ length: 200 })
  title: string;

  @Column({ name: "title_es", length: 200, nullable: true })
  titleEs: string;

  @Column({ length: 200, nullable: true })
  organization: string;

  @Column({ name: "organization_es", length: 200, nullable: true })
  organizationEs: string;

  @Column({
    type: "enum",
    enum: PositionBranch,
    default: PositionBranch.EXECUTIVE,
  })
  branch: PositionBranch;

  @Column({ name: "start_date", type: "date", nullable: true })
  startDate: Date;

  @Column({ name: "end_date", type: "date", nullable: true })
  endDate: Date;

  @Column({ name: "is_current", default: false })
  isCurrent: boolean;

  @Column("text", { nullable: true })
  description: string;

  @Column({ name: "source_url", length: 500, nullable: true })
  sourceUrl: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
