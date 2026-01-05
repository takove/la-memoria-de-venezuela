import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { StgArticle } from "./stg-article.entity";

export enum StgEntityType {
  PERSON = "PERSON",
  ORG = "ORG",
  LOCATION = "LOCATION",
}

@Entity("stg_entities")
@Index(["article", "type", "normText"])
export class StgEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => StgArticle, (article) => article.entities, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "article_id" })
  @Index()
  article: StgArticle;

  @Column({ type: "enum", enum: StgEntityType })
  type: StgEntityType;

  @Column({ name: "raw_text", type: "text" })
  rawText: string;

  @Column({ name: "norm_text", length: 320 })
  normText: string;

  @Column({ type: "jsonb", nullable: true })
  offsets?: Record<string, any>;

  @Column({ length: 2 })
  lang: string;

  @Column({ name: "model_version", length: 40 })
  modelVersion: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
