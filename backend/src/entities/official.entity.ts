import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Sanction } from './sanction.entity';
import { CaseInvolvement } from './case-involvement.entity';

export enum OfficialStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECEASED = 'deceased',
  EXILED = 'exiled',
  IMPRISONED = 'imprisoned',
}

@Entity('officials')
@Index(['lastName', 'firstName'])
@Index(['status'])
export class Official {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'full_name', length: 250 })
  fullName: string;

  @Column('text', { array: true, nullable: true })
  aliases: string[];

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  @Column({ name: 'birth_place', length: 200, nullable: true })
  birthPlace: string;

  @Column({ length: 100, nullable: true })
  nationality: string;

  @Column({ name: 'cedula', length: 20, nullable: true, unique: true })
  cedula: string;

  @Column({ name: 'passport_number', length: 50, nullable: true })
  passportNumber: string;

  @Column({
    type: 'enum',
    enum: OfficialStatus,
    default: OfficialStatus.ACTIVE,
  })
  status: OfficialStatus;

  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl: string;

  @Column('text', { nullable: true })
  biography: string;

  @Column('text', { name: 'biography_es', nullable: true })
  biographyEs: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Sanction, (sanction) => sanction.official)
  sanctions: Sanction[];

  @OneToMany(() => CaseInvolvement, (involvement) => involvement.official)
  caseInvolvements: CaseInvolvement[];
}
