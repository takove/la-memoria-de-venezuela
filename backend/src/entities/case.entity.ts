import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { CaseInvolvement } from './case-involvement.entity';

export enum CaseType {
  INDICTMENT = 'indictment',
  CRIMINAL = 'criminal',
  CIVIL = 'civil',
  IACHR = 'iachr',
  ICC = 'icc', // International Criminal Court
  OTHER = 'other',
}

export enum CaseStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PENDING = 'pending',
  DISMISSED = 'dismissed',
  CONVICTION = 'conviction',
  ACQUITTAL = 'acquittal',
}

export enum Jurisdiction {
  USA = 'usa',
  VENEZUELA = 'venezuela',
  SPAIN = 'spain',
  COLOMBIA = 'colombia',
  IACHR = 'iachr',
  ICC = 'icc',
  OTHER = 'other',
}

@Entity('cases')
@Index(['type', 'status'])
@Index(['filingDate'])
export class Case {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'case_number', length: 100, unique: true })
  caseNumber: string;

  @Column({ length: 300 })
  title: string;

  @Column({ name: 'title_es', length: 300, nullable: true })
  titleEs: string;

  @Column({
    type: 'enum',
    enum: CaseType,
    default: CaseType.CRIMINAL,
  })
  type: CaseType;

  @Column({
    type: 'enum',
    enum: Jurisdiction,
    default: Jurisdiction.USA,
  })
  jurisdiction: Jurisdiction;

  @Column({ length: 200, nullable: true })
  court: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { name: 'description_es', nullable: true })
  descriptionEs: string;

  @Column('text', { array: true, nullable: true })
  charges: string[];

  @Column('text', { name: 'charges_es', array: true, nullable: true })
  chargesEs: string[];

  @Column({ name: 'filing_date', type: 'date', nullable: true })
  filingDate: Date;

  @Column({ name: 'resolution_date', type: 'date', nullable: true })
  resolutionDate: Date;

  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.OPEN,
  })
  status: CaseStatus;

  @Column({ name: 'document_url', length: 500, nullable: true })
  documentUrl: string;

  @Column({ name: 'source_url', length: 500, nullable: true })
  sourceUrl: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => CaseInvolvement, (involvement) => involvement.case)
  involvements: CaseInvolvement[];
}
