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
 * Status of political prisoner
 */
export enum PrisonerStatus {
  IMPRISONED = "imprisoned", // Currently detained
  RELEASED = "released", // Released from detention
  EXILED = "exiled", // Released on condition of exile
  HOUSE_ARREST = "house_arrest", // Under house arrest
  DISAPPEARED = "disappeared", // Forcibly disappeared
  DECEASED = "deceased", // Died in custody
  UNKNOWN = "unknown", // Status unknown
}

/**
 * Types of detention facilities
 */
export enum FacilityType {
  SEBIN = "sebin", // SEBIN headquarters (El Helicoide)
  DGCIM = "dgcim", // Military intelligence
  CICPC = "cicpc", // Criminal investigation police
  GNB = "gnb", // National Guard facilities
  PRISON = "prison", // Regular prison
  MILITARY_BASE = "military_base", // Military detention
  UNKNOWN = "unknown",
  OTHER = "other",
}

/**
 * Entity: PoliticalPrisoner
 *
 * Documents individuals detained for political reasons.
 * Many were tortured in El Helicoide and DGCIM facilities.
 *
 * Sources: Foro Penal, UN Human Rights, Amnesty International
 */
@Entity("political_prisoners")
@Index(["fullName"])
@Index(["status"])
@Index(["dateArrested"])
export class PoliticalPrisoner {
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

  @Column({ length: 100, nullable: true })
  profession: string;

  @Column({ name: "photo_url", length: 500, nullable: true })
  photoUrl: string;

  // ==================== Detention Information ====================

  @Column({
    type: "enum",
    enum: PrisonerStatus,
    default: PrisonerStatus.UNKNOWN,
  })
  status: PrisonerStatus;

  @Column({ name: "date_arrested", type: "date", nullable: true })
  dateArrested: Date;

  @Column({ name: "date_released", type: "date", nullable: true })
  dateReleased: Date;

  @Column({ name: "days_detained", nullable: true })
  daysDetained: number;

  @Column("text", { array: true, nullable: true })
  facilities: string[]; // Names of facilities where detained

  @Column({
    name: "primary_facility_type",
    type: "enum",
    enum: FacilityType,
    nullable: true,
  })
  primaryFacilityType: FacilityType;

  @Column({ name: "arrest_location", length: 200, nullable: true })
  arrestLocation: string;

  // ==================== Charges & Legal ====================

  @Column("text", { array: true, nullable: true })
  charges: string[]; // Often fabricated charges

  @Column("text", { name: "charges_description", nullable: true })
  chargesDescription: string;

  @Column("text", { name: "charges_description_es", nullable: true })
  chargesDescriptionEs: string;

  @Column({ name: "legal_status", length: 100, nullable: true })
  legalStatus: string; // 'awaiting_trial', 'trial', 'sentenced', 'released'

  @Column({ name: "sentence_years", nullable: true })
  sentenceYears: number;

  @Column("text", { name: "legal_defense", nullable: true })
  legalDefense: string; // Who is defending them

  // ==================== Treatment & Conditions ====================

  @Column({ default: false })
  torture: boolean;

  @Column("text", { name: "torture_description", nullable: true })
  tortureDescription: string;

  @Column("text", { name: "torture_description_es", nullable: true })
  tortureDescriptionEs: string;

  @Column({ name: "solitary_confinement", default: false })
  solitaryConfinement: boolean;

  @Column({ name: "medical_attention_denied", default: false })
  medicalAttentionDenied: boolean;

  @Column({ name: "family_visits_denied", default: false })
  familyVisitsDenied: boolean;

  @Column("text", { name: "conditions_description", nullable: true })
  conditionsDescription: string;

  // ==================== Their Story ====================

  @Column("text", { nullable: true })
  biography: string;

  @Column("text", { name: "biography_es", nullable: true })
  biographyEs: string;

  @Column("text", { nullable: true })
  testimony: string; // Their own words

  @Column("text", { name: "testimony_es", nullable: true })
  testimonyEs: string;

  @Column("text", { name: "family_testimony", nullable: true })
  familyTestimony: string;

  @Column("text", { name: "family_testimony_es", nullable: true })
  familyTestimonyEs: string;

  // ==================== Evidence & Sources ====================

  @Column({
    name: "confidence_level",
    type: "int",
    default: 3,
  })
  confidenceLevel: number;

  @Column("jsonb", { name: "evidence_sources", nullable: true })
  evidenceSources: {
    type: "foro_penal" | "un_report" | "amnesty" | "hrw" | "news" | "testimony";
    title: string;
    url?: string;
    organization?: string;
    date?: string;
  }[];

  @Column("text", {
    array: true,
    name: "international_reports",
    nullable: true,
  })
  internationalReports: string[];

  @Column({ name: "foro_penal_case_id", length: 50, nullable: true })
  foroPenalCaseId: string; // Official Foro Penal case number

  // ==================== Accountability ====================

  @ManyToOne(() => Official, { nullable: true })
  @JoinColumn({ name: "arresting_official_id" })
  arrestingOfficial: Official;

  @Column("text", { name: "responsible_entities", nullable: true })
  responsibleEntities: string; // SEBIN, DGCIM, etc.

  // ==================== Privacy ====================

  @Column({ default: false })
  anonymous: boolean;

  @Column({ name: "family_consent", default: false })
  familyConsent: boolean;

  // ==================== Metadata ====================

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
