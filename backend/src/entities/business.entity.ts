import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { IsInt, Max, Min } from "class-validator";
import { Official } from "./official.entity";

export enum BusinessCategory {
  PDVSA_CONTRACTOR = "pdvsa_contractor",
  CLAP_FRAUD = "clap_fraud",
  INFRASTRUCTURE = "infrastructure",
  FINANCIAL = "financial",
  ENERGY = "energy",
  FOOD_DISTRIBUTION = "food_distribution",
  IMPORT_EXPORT = "import_export",
  REAL_ESTATE = "real_estate",
  MINING = "mining",
  OTHER = "other",
}

export enum BusinessStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISSOLVED = "dissolved",
  SANCTIONED = "sanctioned",
  UNKNOWN = "unknown",
}

@Entity("businesses")
@Index(["name"])
@Index(["registrationNumber"])
@Index(["country"])
@Index(["category"])
@Index(["confidenceLevel"])
export class Business {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 500 })
  name: string;

  @Column({ name: "registration_number", length: 100, nullable: true })
  registrationNumber: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 100, nullable: true })
  industry: string;

  @Column({
    type: "enum",
    enum: BusinessCategory,
    default: BusinessCategory.OTHER,
  })
  category: BusinessCategory;

  @Column({
    type: "enum",
    enum: BusinessStatus,
    default: BusinessStatus.UNKNOWN,
  })
  status: BusinessStatus;

  @Column("text", { array: true, nullable: true })
  aliases: string[];

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  @Index()
  estimatedContractValue: number;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  @Index()
  estimatedTheftAmount: number;

  @Column("text", { nullable: true })
  description: string;

  @Column("text", { nullable: true })
  descriptionEs: string;

  // Beneficial owner (the official who secretly owns it)
  @ManyToOne(() => Official, { nullable: true, eager: false })
  beneficialOwner: Official;

  // Front man/testaferro operating it
  @Column({ name: "front_man", length: 255, nullable: true })
  frontMan: string;

  // Contracts and deals
  @Column({ type: "jsonb", nullable: true })
  contracts: Array<{
    title: string;
    titleEs?: string;
    value: number;
    date: string;
    awardedBy: string;
    status: "completed" | "incomplete" | "fraudulent";
    description?: string;
  }>;

  // Sanctions status
  @Column({ type: "jsonb", nullable: true })
  sanctions: Array<{
    type: string;
    imposedDate: string;
    imposedBy: string;
    reason: string;
  }>;

  // Evidence and sources
  @Column({ type: "jsonb", nullable: true })
  evidenceSources: Array<{
    type: string;
    title: string;
    url: string;
    archiveUrl?: string;
    publisher?: string;
    publicationDate?: string;
    description?: string;
  }>;

  @Column({
    type: "jsonb",
    nullable: true,
    name: "sources",
    default: () => "'[]'",
  })
  sources?: Array<{
    url: string;
    archiveUrl?: string;
    type: "media" | "official" | "court" | "academic";
    publicationDate?: Date;
  }>;

  @Column({
    type: "enum",
    enum: [1, 2, 3, 4, 5],
    default: 3,
    name: "confidence_level",
  })
  @IsInt()
  @Min(1)
  @Max(5)
  confidenceLevel: number; // 1-5, where 5 is highest confidence

  @Column({ default: false })
  isDisputed: boolean;

  @Column({ type: "text", nullable: true })
  disputeDetails: string;

  @Column({ name: "dissolution_date", type: "date", nullable: true })
  dissolutionDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
