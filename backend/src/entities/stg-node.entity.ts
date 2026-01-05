import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Official } from "./official.entity";

export enum StgNodeType {
  PERSON = "person",
  ORG = "org",
  ARTICLE = "article",
}

@Entity("stg_nodes")
@Index(["type", "canonicalName"])
export class StgNode {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: StgNodeType })
  type: StgNodeType;

  @Column({ name: "canonical_name", length: 320 })
  canonicalName: string;

  @Column("text", { name: "alt_names", array: true, nullable: true })
  altNames?: string[];

  @Column({ name: "source_ids", type: "jsonb", nullable: true })
  sourceIds?: Record<string, any>;

  @ManyToOne(() => Official, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "tier1_id" })
  tier1?: Official;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
