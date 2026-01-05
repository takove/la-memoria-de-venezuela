import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

/**
 * Tier 1 Officials - Verified regime officials from sanctions lists
 *
 * Tier Framework:
 * - Tier 1: Government officials (Ministers, military, judiciary)
 * - Tier 2: Testaferros (200+ straw men holding stolen assets)
 * - Tier 3: Business enablers (500+ corrupt companies)
 * - Tier 4: Cultural figures (500+ regime propagandists)
 * - Tier 5: International enablers (Foreign collaborators)
 */
@Entity("tier1_officials")
@Index(["fullName"])
@Index(["externalId", "source"])
export class Tier1Official {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "external_id", unique: true })
  externalId: string; // OFAC UID, OpenSanctions ID, etc.

  @Column({ name: "full_name", length: 200 })
  fullName: string;

  @Column({ name: "aliases", type: "jsonb", default: [] })
  aliases: string[]; // Alternative names, nicknames

  @Column({ name: "nationality", nullable: true })
  nationality: string; // ISO country code (VE, CO, etc.)

  @Column({ name: "date_of_birth", type: "date", nullable: true })
  dateOfBirth?: Date;

  @Column({ name: "sanctions_programs", type: "jsonb", default: [] })
  sanctionsPrograms: string[]; // ['VENEZUELA', 'NARCOTICS']

  @Column({ name: "tier", type: "int", default: 1 })
  tier: number; // 1-5 based on framework

  @Column({
    name: "entity_type",
    type: "enum",
    enum: ["PERSON", "ORGANIZATION"],
    default: "PERSON",
  })
  entityType: "PERSON" | "ORGANIZATION";

  @Column({ name: "source", length: 50 })
  source: string; // OFAC, OpenSanctions, AtlanticCouncil

  @Column({ name: "confidence_level", type: "int", default: 5 })
  confidenceLevel: number; // 1-5 (official sources are always 5)

  @Column({ name: "notes", type: "text", nullable: true })
  notes?: string; // Remarks, context, legal details

  @Column({ name: "verified_at", type: "timestamp" })
  verifiedAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
