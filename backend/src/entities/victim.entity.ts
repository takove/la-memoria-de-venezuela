import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Official } from "./official.entity";

/**
 * Categories of victims in the Venezuelan crisis
 */
export enum VictimCategory {
  PROTEST = "protest", // Killed during protests
  POLITICAL_EXECUTION = "political_execution", // Extrajudicial killing
  TORTURE = "torture", // Died from torture
  DETENTION = "detention", // Died in detention
  HEALTHCARE = "healthcare", // Preventable medical deaths
  HUNGER = "hunger", // Malnutrition/starvation
  VIOLENCE = "violence", // State violence
  BLACKOUT = "blackout", // Deaths during power outages
  EXODUS = "exodus", // Died fleeing (Darién Gap, etc.)
  OTHER = "other",
}

/**
 * Confidence level for victim documentation
 * 5 = Official record (death certificate, autopsy)
 * 4 = Multiple independent reports (NGOs, journalists)
 * 3 = Single verified source + corroboration
 * 2 = Witness testimony only
 * 1 = Unverified (DO NOT INCLUDE publicly)
 */
export enum ConfidenceLevel {
  OFFICIAL_RECORD = 5,
  MULTIPLE_REPORTS = 4,
  VERIFIED_SOURCE = 3,
  WITNESS_ONLY = 2,
  UNVERIFIED = 1,
}

/**
 * Entity: Victim
 *
 * Documents individuals who lost their lives during the Venezuelan crisis.
 * This is the moral foundation of the entire project.
 *
 * "We will remember you. We will tell your story.
 *  We will honor your sacrifice. You will not be forgotten."
 */
@Entity("victims")
@Index(["fullName"])
@Index(["category"])
@Index(["dateOfDeath"])
@Index(["confidenceLevel"])
export class Victim {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ==================== Personal Information ====================

  @Column({ name: "full_name", length: 200 })
  fullName: string;

  @Column({ name: "first_name", length: 100, nullable: true })
  firstName: string;

  @Column({ name: "last_name", length: 100, nullable: true })
  lastName: string;

  @Column({ nullable: true })
  age: number;

  @Column({ name: "date_of_birth", type: "date", nullable: true })
  dateOfBirth: Date;

  @Column({ name: "place_of_birth", length: 200, nullable: true })
  placeOfBirth: string;

  @Column({ length: 100, nullable: true })
  nationality: string;

  @Column({ length: 100, nullable: true })
  occupation: string;

  @Column({ name: "photo_url", length: 500, nullable: true })
  photoUrl: string;

  // ==================== Death Information ====================

  @Column({ name: "date_of_death", type: "date", nullable: true })
  dateOfDeath: Date;

  @Column({ name: "place_of_death", length: 200, nullable: true })
  placeOfDeath: string;

  @Column({
    type: "enum",
    enum: VictimCategory,
    default: VictimCategory.OTHER,
  })
  category: VictimCategory;

  @Column("text", { nullable: true })
  circumstance: string;

  @Column("text", { name: "circumstance_es", nullable: true })
  circumstanceEs: string;

  // ==================== Their Story ====================

  @Column("text", { nullable: true })
  biography: string;

  @Column("text", { name: "biography_es", nullable: true })
  biographyEs: string;

  @Column("text", { nullable: true })
  dreams: string; // What they wanted to become

  @Column("text", { name: "dreams_es", nullable: true })
  dreamsEs: string;

  @Column("text", { name: "family_testimony", nullable: true })
  familyTestimony: string;

  @Column("text", { name: "family_testimony_es", nullable: true })
  familyTestimonyEs: string;

  // ==================== Evidence & Sources ====================

  @Column({
    name: "confidence_level",
    type: "int",
    default: ConfidenceLevel.VERIFIED_SOURCE,
  })
  confidenceLevel: number;

  @Column("jsonb", { name: "evidence_sources", nullable: true })
  evidenceSources: {
    type:
      | "official_record"
      | "ngo_report"
      | "news_article"
      | "witness"
      | "video"
      | "photo";
    title: string;
    url?: string;
    organization?: string;
    date?: string;
    archived?: boolean;
    archiveUrl?: string;
  }[];

  @Column("text", {
    array: true,
    name: "international_reports",
    nullable: true,
  })
  internationalReports: string[]; // UN, HRW, Amnesty, etc.

  // ==================== Memorials ====================

  @Column("jsonb", { nullable: true })
  memorials: {
    type: "physical" | "virtual" | "mural" | "monument" | "ceremony";
    name: string;
    location?: string;
    url?: string;
    date?: string;
  }[];

  @Column("text", { name: "tribute_message", nullable: true })
  tributeMessage: string;

  @Column("text", { name: "tribute_message_es", nullable: true })
  tributeMessageEs: string;

  // ==================== Accountability ====================

  @ManyToOne(() => Official, { nullable: true })
  @JoinColumn({ name: "responsible_official_id" })
  responsibleOfficial: Official; // If known, link to perpetrator

  @Column("text", { name: "chain_of_command", nullable: true })
  chainOfCommand: string; // Who ordered/enabled the death

  @Column({ name: "justice_status", length: 100, nullable: true })
  justiceStatus: string; // 'pending', 'investigation', 'trial', 'conviction', 'impunity'

  // ==================== Privacy & Consent ====================

  @Column({ default: false })
  anonymous: boolean;

  @Column({ name: "family_consent", default: false })
  familyConsent: boolean;

  @Column({ name: "family_contact", length: 200, nullable: true })
  familyContact: string; // For updates/corrections (encrypted/private)

  // ==================== Metadata ====================

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
