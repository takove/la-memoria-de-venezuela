import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Official } from "./official.entity";
import { StgNode } from "./stg-node.entity";

@Entity("candidate_testaferros")
@Index(["tier1"])
export class CandidateTestaferro {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => StgNode, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "person_node_id" })
  personNode?: StgNode;

  @ManyToOne(() => Official, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "tier1_id" })
  tier1?: Official;

  @Column({ name: "normalized_name", length: 320 })
  normalizedName: string;

  @Column({ name: "linked_org_ids", type: "jsonb", nullable: true })
  linkedOrgIds?: string[];

  @Column({ type: "jsonb", nullable: true })
  outlets?: Array<{ name: string; url: string; published_at?: string }>;

  @Column({ name: "pattern_snippet", type: "text", nullable: true })
  patternSnippet?: string;

  @Column({ name: "source_urls", type: "jsonb", nullable: true })
  sourceUrls?: string[];

  @Column({ name: "published_at", type: "timestamptz", nullable: true })
  publishedAt?: Date;

  @Column({
    name: "recency_score",
    type: "numeric",
    precision: 10,
    scale: 4,
    nullable: true,
  })
  recencyScore?: number;

  @Column({
    name: "composite_score",
    type: "numeric",
    precision: 10,
    scale: 4,
    nullable: true,
  })
  compositeScore?: number;

  @Column({ name: "confidence_level", type: "int", nullable: true })
  confidenceLevel?: number;

  @Column({ name: "evidence_edges", type: "jsonb", nullable: true })
  evidenceEdges?: string[];

  @Column({ name: "ingested_at", type: "timestamptz" })
  ingestedAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
