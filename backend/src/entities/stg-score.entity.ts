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
import { StgNode } from "./stg-node.entity";

@Entity("stg_scores")
@Index(["tier1", "score"], { where: "score IS NOT NULL" })
export class StgScore {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => StgNode, { onDelete: "CASCADE" })
  @JoinColumn({ name: "person_node_id" })
  personNode: StgNode;

  @ManyToOne(() => Official, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "tier1_id" })
  tier1?: Official;

  @Column({ type: "numeric", precision: 10, scale: 4, nullable: true })
  score?: number;

  @Column({ name: "confidence_level", type: "int", nullable: true })
  confidenceLevel?: number;

  @Column({ type: "jsonb", nullable: true })
  components?: Record<string, any>;

  @CreateDateColumn({ name: "computed_at" })
  computedAt: Date;
}
