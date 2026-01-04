import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Reason for leaving Venezuela
 */
export enum ExileReason {
  POLITICAL_PERSECUTION = 'political_persecution',
  ECONOMIC = 'economic',                     // Hunger, poverty
  HEALTHCARE = 'healthcare',                 // No medicine, treatment
  VIOLENCE = 'violence',                     // Crime, insecurity
  FAMILY_REUNIFICATION = 'family_reunification',
  PROFESSIONAL = 'professional',             // No opportunities
  MIXED = 'mixed',                           // Multiple reasons
  OTHER = 'other',
}

/**
 * Journey route type
 */
export enum JourneyRoute {
  LEGAL = 'legal',                           // Visa, plane
  DARIEN_GAP = 'darien_gap',                // Dangerous jungle crossing
  BORDER_CROSSING = 'border_crossing',       // Land border (Colombia, Brazil)
  MARITIME = 'maritime',                     // Sea crossing
  MIXED = 'mixed',
  OTHER = 'other',
}

/**
 * Entity: ExileStory
 * 
 * Documents the stories of the 7+ million Venezuelans who fled.
 * Not just numbers - their stories, their journeys, their loss.
 * 
 * "They left everything behind. Their homes, careers, families.
 *  They walked through jungles, crossed deserts, risked everything.
 *  For a chance at survival."
 */
@Entity('exile_stories')
@Index(['yearLeft'])
@Index(['destination'])
@Index(['reason'])
export class ExileStory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ==================== Personal Information ====================
  // Note: Many may choose to remain anonymous

  @Column({ name: 'full_name', length: 200, nullable: true })
  fullName: string;

  @Column({ name: 'display_name', length: 100, nullable: true })
  displayName: string; // Can be pseudonym for privacy

  @Column({ nullable: true })
  age: number;

  @Column({ name: 'age_at_departure', nullable: true })
  ageAtDeparture: number;

  @Column({ length: 100, nullable: true })
  profession: string;

  @Column({ name: 'previous_profession', length: 100, nullable: true })
  previousProfession: string; // What they did in Venezuela

  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl: string;

  // ==================== Origin ====================

  @Column({ name: 'origin_city', length: 100, nullable: true })
  originCity: string;

  @Column({ name: 'origin_state', length: 100, nullable: true })
  originState: string;

  // ==================== Journey ====================

  @Column({ name: 'year_left' })
  yearLeft: number;

  @Column({ name: 'month_left', nullable: true })
  monthLeft: number;

  @Column({ name: 'exact_date_left', type: 'date', nullable: true })
  exactDateLeft: Date;

  @Column({
    type: 'enum',
    enum: ExileReason,
    default: ExileReason.MIXED,
  })
  reason: ExileReason;

  @Column('text', { name: 'reason_detail', nullable: true })
  reasonDetail: string;

  @Column('text', { name: 'reason_detail_es', nullable: true })
  reasonDetailEs: string;

  @Column({
    name: 'journey_route',
    type: 'enum',
    enum: JourneyRoute,
    nullable: true,
  })
  journeyRoute: JourneyRoute;

  @Column('text', { name: 'journey_description', nullable: true })
  journeyDescription: string;

  @Column('text', { name: 'journey_description_es', nullable: true })
  journeyDescriptionEs: string;

  @Column('text', { array: true, name: 'countries_crossed', nullable: true })
  countriesCrossed: string[]; // Countries passed through

  @Column({ name: 'journey_days', nullable: true })
  journeyDays: number; // How long the journey took

  // ==================== Destination ====================

  @Column({ length: 100 })
  destination: string; // Current country

  @Column({ name: 'destination_city', length: 100, nullable: true })
  destinationCity: string;

  @Column({ name: 'current_status', length: 100, nullable: true })
  currentStatus: string; // 'refugee', 'asylum_seeker', 'temporary', 'permanent', 'citizen'

  // ==================== What They Lost ====================

  @Column('text', { name: 'what_they_left', nullable: true })
  whatTheyLeft: string;

  @Column('text', { name: 'what_they_left_es', nullable: true })
  whatTheyLeftEs: string;

  @Column({ name: 'family_separated', default: false })
  familySeparated: boolean;

  @Column('text', { name: 'family_situation', nullable: true })
  familySituation: string; // Who they left behind

  @Column({ name: 'career_lost', default: false })
  careerLost: boolean;

  @Column('text', { name: 'career_description', nullable: true })
  careerDescription: string; // Professional loss

  // ==================== Their Story ====================

  @Column('text', { nullable: true })
  story: string;

  @Column('text', { name: 'story_es', nullable: true })
  storyEs: string;

  @Column('text', { nullable: true })
  testimony: string; // In their own words

  @Column('text', { name: 'testimony_es', nullable: true })
  testimonyEs: string;

  @Column('text', { name: 'message_to_venezuela', nullable: true })
  messageToVenezuela: string; // What they want to say

  @Column('text', { name: 'message_to_venezuela_es', nullable: true })
  messageToVenezuelaEs: string;

  // ==================== Current Life ====================

  @Column('text', { name: 'current_situation', nullable: true })
  currentSituation: string;

  @Column({ name: 'wants_to_return', nullable: true })
  wantsToReturn: boolean;

  @Column('text', { name: 'hopes_for_future', nullable: true })
  hopesForFuture: string;

  // ==================== Privacy & Verification ====================

  @Column({ default: true })
  anonymous: boolean;

  @Column({ default: false })
  verified: boolean;

  @Column({
    name: 'confidence_level',
    type: 'int',
    default: 3,
  })
  confidenceLevel: number;

  @Column('jsonb', { name: 'evidence_sources', nullable: true })
  evidenceSources: {
    type: 'interview' | 'document' | 'photo' | 'video' | 'organization';
    description: string;
    url?: string;
    date?: string;
  }[];

  // ==================== Metadata ====================

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
