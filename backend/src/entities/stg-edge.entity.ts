import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { StgNode } from "./stg-node.entity";

export enum StgEdgeType {
  MENTIONED_IN = "mentioned_in",
  CO_MENTIONED = "co_mentioned",
  RELATION_PATTERN = "relation_pattern",
  OFFICER_OF = "officer_of",
  BENEFICIAL_OWNER = "beneficial_owner",
  LEAKED_OFFICER_OF = "leaked_officer_of",
  CORP_TIE = "corp_tie",
}

@Entity("stg_edges")
@Index(["type", "srcNode", "dstNode"])
export class StgEdge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => StgNode, { onDelete: "CASCADE" })
  @JoinColumn({ name: "src_node_id" })
  srcNode: StgNode;

  @ManyToOne(() => StgNode, { onDelete: "CASCADE" })
  @JoinColumn({ name: "dst_node_id" })
  dstNode: StgNode;

  @Column({ type: "enum", enum: StgEdgeType })
  type: StgEdgeType;

  @Column({ type: "numeric", precision: 10, scale: 4, nullable: true })
  weight?: number;

  @Column({ name: "evidence_ref", type: "jsonb", nullable: true })
  evidenceRef?: Record<string, any>;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
