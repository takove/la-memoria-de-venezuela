import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { Official } from "./official.entity";
import { Business } from "./business.entity";

export enum EventType {
  SANCTION = "sanction",
  CHARGE = "charge",
  CONVICTION = "conviction",
  POSITION_CHANGE = "position_change",
}

@Entity("events")
@Index(["eventDate"])
@Index(["eventType"])
@Index(["importance"])
@Index(["relatedOfficialId"])
@Index(["relatedBusinessId"])
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column("text", { nullable: true })
  description: string;

  @Column({ name: "event_date", type: "date" })
  eventDate: Date;

  @Column({
    name: "event_type",
    type: "enum",
    enum: EventType,
  })
  eventType: EventType;

  @Column({ name: "related_official_id", type: "uuid" })
  relatedOfficialId: string;

  @Column({ name: "related_business_id", type: "uuid", nullable: true })
  relatedBusinessId: string;

  @Column({ name: "source_url", length: 1000 })
  sourceUrl: string;

  @Column({ type: "int" })
  importance: number; // 1-10

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Official, (official) => official.events, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "related_official_id" })
  official: Official;

  @ManyToOne(() => Business, (business) => business.events, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "related_business_id" })
  business: Business;
}
