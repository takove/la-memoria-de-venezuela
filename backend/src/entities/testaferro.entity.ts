import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Official } from "./official.entity";
import { Business } from "./business.entity";

/**
 * TIER 2: Testaferros
 * Front men and money launderers operating for regime officials
 * ~200+ known testaferros from OFAC/FinCEN/DOJ sources
 *
 * Relationships:
 * - Testaferro works FOR an Official (beneficial owner)
 * - Testaferro holds stakes IN Businesses
 * - Testaferro conducts Financial Transactions
 */

export enum TestaferroCategory {
  MONEY_LAUNDERER = "money_launderer",
  BUSINESS_FRONT = "business_front",
  SHELL_COMPANY_OPERATOR = "shell_company_operator",
  REAL_ESTATE_FLIPPER = "real_estate_flipper",
  IMPORT_EXPORT_TRADER = "import_export_trader",
  BANKING_INTERMEDIARY = "banking_intermediary",
  CONSTRUCTION_CONTRACTOR = "construction_contractor",
  FAMILY_MEMBER = "family_member", // Spouse/children holding assets
  CHILDHOOD_FRIEND = "childhood_friend", // Close associate
  BUSINESS_ASSOCIATE = "business_associate",
  OTHER = "other",
}

export enum TestaferroStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DECEASED = "deceased",
  CAPTURED = "captured",
  FLED_COUNTRY = "fled_country",
  COOPERATING_WITNESS = "cooperating_witness",
}

@Entity("testaferros")
@Index(["fullName"])
@Index(["identificationNumber"])
@Index(["category", "status"])
@Index(["beneficialOwner"])
@Index(["confidenceLevel"])
@Index(["country"])
@Index(["estimatedWealthAmount"])
export class Testaferro {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // IDENTITY
  @Column({ type: "varchar", length: 200, nullable: false })
  fullName: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  aliases?: string; // JSON array serialized

  @Column({ type: "varchar", length: 50, nullable: true })
  identificationNumber?: string; // Cédula, passport, etc.

  @Column({ type: "varchar", length: 100, nullable: true })
  identificationType?: string; // "cedula_identidad", "passport", "business_id"

  @Column({ type: "varchar", length: 100, nullable: true })
  dateOfBirth?: string; // ISO format YYYY-MM-DD

  @Column({ type: "varchar", length: 100, nullable: true })
  nationality?: string;

  // RELATIONSHIP TO OFFICIAL
  @Column({ type: "uuid", nullable: true })
  beneficialOwnerId?: string; // FK to Official

  @ManyToOne(() => Official, (official) => official.testaferros, {
    nullable: true,
    onDelete: "SET NULL",
  })
  beneficialOwner?: Official;

  @Column({ type: "text", nullable: true })
  relationshipToOfficial?: string; // "spouse", "son", "trusted associate", "childhood friend"

  @Column({ type: "text", nullable: true })
  relationshipToOfficialEs?: string;

  // CATEGORIZATION
  @Column({
    type: "enum",
    enum: TestaferroCategory,
    default: TestaferroCategory.BUSINESS_FRONT,
  })
  category: TestaferroCategory;

  @Column({
    type: "enum",
    enum: TestaferroStatus,
    default: TestaferroStatus.ACTIVE,
  })
  status: TestaferroStatus;

  @Column({ type: "text", nullable: true })
  statusNotes?: string; // e.g., "Captured in Miami, 2023"

  // DESCRIPTION
  @Column({ type: "text", nullable: true })
  description?: string; // English description

  @Column({ type: "text", nullable: true })
  descriptionEs?: string; // Spanish description

  // LOCATION & RESIDENCY
  @Column({ type: "varchar", length: 100, nullable: true })
  country?: string; // Primary residence

  @Column({ type: "varchar", length: 100, nullable: true })
  city?: string;

  @Column({ type: "text", nullable: true })
  knownResidencies?: string; // JSON: [{"country": "Panama", "period": "2010-2015", "role": "shell company operator"}]

  // WEALTH & ASSETS
  @Column({ type: "bigint", nullable: true, default: 0 })
  estimatedWealthAmount?: number; // USD

  @Column({ type: "text", nullable: true })
  knownAssets?: string; // JSON array of {type: "real_estate", "vehicle", "business_stake", description, value}

  @Column({ type: "text", nullable: true })
  bankAccounts?: string; // JSON: [{"bank": "BBVA", "country": "Spain", "status": "frozen", "amount": 5000000}]

  // BUSINESS HOLDINGS
  @Column({ type: "text", nullable: true })
  businessStakes?: string; // JSON: [{"business_id": "uuid", "percentage": 51, "role": "owner"}]

  @OneToMany(() => Business, (business) => business.frontMan, {
    nullable: true,
  })
  operatedBusinesses?: Business[];

  // FINANCIAL NETWORKS
  @Column({ type: "text", nullable: true })
  bankingConnections?: string; // JSON: [{"bank": "name", "country": "country", "type": "account_holder", "status": "active"}]

  @Column({ type: "text", nullable: true })
  tradingPartners?: string; // JSON: companies and entities that do business with testaferro

  @Column({ type: "text", nullable: true })
  knownAssociates?: string; // JSON: [{"type": "fellow_testaferro", "name": "John Doe", "relationship": "business partner"}]

  // LEGAL PROCEEDINGS
  @Column({ type: "text", nullable: true })
  indictments?: string; // JSON: [{"jurisdiction": "SDNY", "date": "2020-03-15", "charges": ["money_laundering", "bribery"], "status": "active"}]

  @Column({ type: "text", nullable: true })
  sanctions?: string; // JSON: [{"type": "OFAC_SDN", "date": "2019-07-25", "reason": "materially assisting corruption"}]

  @Column({ type: "text", nullable: true })
  casesInvolvement?: string; // JSON: [{"case_id": "uuid", "role": "defendant", "outcome": "guilty"}]

  // CONFIDENCE & VERIFICATION
  @Column({ type: "int", default: 3, name: "confidence_level" })
  confidenceLevel: number; // 1=rumor, 2=unverified, 3=credible, 4=verified, 5=official

  @Column({ type: "jsonb", nullable: true, name: "sources" })
  sources?: Array<{
    url: string;
    archiveUrl?: string;
    type: "media" | "official" | "court" | "academic";
    publicationDate?: Date;
    title?: string;
    accessedDate?: Date;
  }>;

  @Column({ type: "text", nullable: true })
  evidenceSources?: string; // JSON: sources documenting the testaferro relationship (legacy field)

  // DISPUTE & CORRECTIONS
  @Column({ type: "boolean", default: false })
  isDisputed?: boolean;

  @Column({ type: "text", nullable: true })
  disputeNotes?: string; // If person claims information is wrong

  @Column({ type: "date", nullable: true })
  dissolutionDate?: Date; // If testaferro "dissolved" (died, fled, captured)

  @Column({ type: "text", nullable: true })
  notes?: string; // Internal notes / additional context

  // TIMESTAMPS
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
