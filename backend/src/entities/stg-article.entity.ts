import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { StgEntity } from "./stg-entity.entity";
import { StgRelation } from "./stg-relation.entity";

@Entity("stg_articles")
@Index(["url"], { unique: true })
@Index(["contentHash"], { unique: true })
@Index(["normalizedUrl"])
@Index(["canonicalUrl"])
@Index(["publishedAt"])
export class StgArticle {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 80 })
  outlet: string;

  @Column({ type: "text" })
  title: string;

  @Column({ length: 512 })
  url: string;

  @Column({ name: "normalized_url", length: 512, nullable: true })
  normalizedUrl?: string;

  @Column({ name: "canonical_url", length: 512, nullable: true })
  canonicalUrl?: string;

  @Column({ length: 2 })
  lang: string;

  @Column({ name: "published_at", type: "timestamptz", nullable: true })
  publishedAt?: Date;

  @Column({ name: "retrieved_at", type: "timestamptz" })
  retrievedAt: Date;

  @Column({ name: "raw_html", type: "text", nullable: true })
  rawHtml?: string;

  @Column({ name: "clean_text", type: "text", nullable: true })
  cleanText?: string;

  @Column({ name: "content_hash", length: 64 })
  contentHash: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => StgEntity, (entity) => entity.article)
  entities: StgEntity[];

  @OneToMany(() => StgRelation, (relation) => relation.article)
  relations: StgRelation[];
}
