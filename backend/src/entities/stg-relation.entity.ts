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
import { StgEntity } from "./stg-entity.entity";

@Entity("stg_relations")
@Index(["article"])
@Index(["pattern"])
export class StgRelation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => StgArticle, (article) => article.relations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "article_id" })
  article: StgArticle;

  @Column({ length: 64 })
  pattern: string;

  @Column({ type: "text" })
  sentence: string;

  @ManyToOne(() => StgEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "subject_entity_id" })
  subjectEntity?: StgEntity;

  @ManyToOne(() => StgEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "object_entity_id" })
  objectEntity?: StgEntity;

  @Column({ type: "numeric", precision: 5, scale: 3, nullable: true })
  confidence?: number;

  @Column({ name: "model_version", length: 40 })
  modelVersion: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
