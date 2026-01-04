// Type definitions for the API

export interface Official {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  aliases: string[];
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  cedula?: string;
  passportNumber?: string;
  status: 'active' | 'inactive' | 'deceased' | 'exiled' | 'imprisoned';
  photoUrl?: string;
  biography?: string;
  biographyEs?: string;
  sanctions?: Sanction[];
  positions?: Position[];
  caseInvolvements?: CaseInvolvement[];
  createdAt: string;
  updatedAt: string;
}

export interface Sanction {
  id: string;
  officialId: string;
  type: 'ofac_sdn' | 'ofac_ns_plc' | 'eu' | 'canada' | 'uk' | 'other';
  programCode: string;
  programName: string;
  ofacId?: string;
  reason?: string;
  reasonEs?: string;
  imposedDate: string;
  liftedDate?: string;
  status: 'active' | 'lifted' | 'modified';
  sourceUrl?: string;
  treasuryPressRelease?: string;
  official?: Official;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  titleEs?: string;
  type: 'indictment' | 'criminal' | 'civil' | 'iachr' | 'icc' | 'other';
  jurisdiction: 'usa' | 'venezuela' | 'spain' | 'colombia' | 'iachr' | 'icc' | 'other';
  court?: string;
  description?: string;
  descriptionEs?: string;
  charges: string[];
  chargesEs?: string[];
  filingDate?: string;
  resolutionDate?: string;
  status: 'open' | 'closed' | 'pending' | 'dismissed' | 'conviction' | 'acquittal';
  documentUrl?: string;
  sourceUrl?: string;
  involvements?: CaseInvolvement[];
}

export interface CaseInvolvement {
  id: string;
  officialId: string;
  caseId: string;
  role: 'defendant' | 'witness' | 'accused' | 'convicted' | 'mentioned';
  details?: string;
  detailsEs?: string;
  official?: Official;
  case?: Case;
}

export interface Position {
  id: string;
  officialId: string;
  title: string;
  titleEs?: string;
  organization?: string;
  organizationEs?: string;
  branch: 'executive' | 'legislative' | 'judicial' | 'military' | 'intelligence' | 'state_enterprise' | 'other';
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
}

// ==================== MEMORIAL TYPES ====================

export type VictimCategory = 
  | 'protest'
  | 'political_execution'
  | 'torture'
  | 'detention'
  | 'healthcare'
  | 'hunger'
  | 'violence'
  | 'blackout'
  | 'exodus'
  | 'other';

export type PrisonerStatus = 
  | 'imprisoned'
  | 'released'
  | 'exiled'
  | 'house_arrest'
  | 'disappeared'
  | 'deceased'
  | 'unknown';

export type FacilityType = 
  | 'sebin_helicoide'
  | 'sebin_plaza'
  | 'dgcim'
  | 'cicpc'
  | 'gnb'
  | 'prison'
  | 'military_base'
  | 'unknown';

export type ExileReason = 
  | 'political_persecution'
  | 'economic'
  | 'healthcare'
  | 'violence'
  | 'family_reunification'
  | 'professional'
  | 'mixed';

export type JourneyRoute = 
  | 'legal'
  | 'darien_gap'
  | 'border_crossing'
  | 'maritime'
  | 'mixed';

export interface EvidenceSource {
  type: 'document' | 'testimony' | 'news' | 'report' | 'video' | 'photo' | 'social_media';
  title: string;
  url?: string;
  date?: string;
  description?: string;
  confidenceLevel: number;
}

export interface Memorial {
  type: 'physical' | 'virtual' | 'art' | 'documentary' | 'book';
  name: string;
  location?: string;
  url?: string;
  description?: string;
}

export interface Victim {
  id: string;
  fullName: string;
  age?: number;
  dateOfBirth?: string;
  dateOfDeath?: string;
  placeOfDeath?: string;
  placeOfDeathEs?: string;
  category: VictimCategory;
  photoUrl?: string;
  biography?: string;
  biographyEs?: string;
  dreams?: string;
  dreamsEs?: string;
  familyTestimony?: string;
  familyTestimonyEs?: string;
  circumstances?: string;
  circumstancesEs?: string;
  eventName?: string;
  eventNameEs?: string;
  responsibleOfficial?: Official;
  chainOfCommand?: string[];
  evidenceSources?: EvidenceSource[];
  internationalReports?: string[];
  memorials?: Memorial[];
  confidenceLevel: number;
  anonymous: boolean;
  familyConsent: boolean;
  justiceStatus?: 'none' | 'investigation' | 'prosecution' | 'conviction' | 'international';
  createdAt: string;
  updatedAt: string;
}

export interface PoliticalPrisoner {
  id: string;
  fullName: string;
  dateOfBirth?: string;
  occupation?: string;
  occupationEs?: string;
  photoUrl?: string;
  status: PrisonerStatus;
  dateArrested?: string;
  dateReleased?: string;
  daysDetained?: number;
  primaryFacilityType?: FacilityType;
  facilities?: string[];
  charges?: string[];
  chargesEs?: string[];
  torture: boolean;
  tortureDescription?: string;
  solitaryConfinement: boolean;
  medicalAttentionDenied: boolean;
  familyVisitsDenied: boolean;
  biography?: string;
  biographyEs?: string;
  testimony?: string;
  testimonyEs?: string;
  foroPenalCaseId?: string;
  arrestingOfficial?: Official;
  evidenceSources?: EvidenceSource[];
  confidenceLevel: number;
  anonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExileStory {
  id: string;
  fullName?: string;
  displayName?: string;
  cityOfOrigin?: string;
  stateOfOrigin?: string;
  occupation?: string;
  occupationEs?: string;
  photoUrl?: string;
  yearLeft?: number;
  destination?: string;
  reason: ExileReason;
  journeyRoute?: JourneyRoute;
  countriesCrossed?: string[];
  journeyDays?: number;
  journeyDescription?: string;
  journeyDescriptionEs?: string;
  whatTheyLeft?: string;
  whatTheyLeftEs?: string;
  familySeparated: boolean;
  familySituation?: string;
  familySituationEs?: string;
  careerLost: boolean;
  careerDescription?: string;
  story?: string;
  storyEs?: string;
  messageToVenezuela?: string;
  messageToVenezuelaEs?: string;
  hopesForFuture?: string;
  hopesForFutureEs?: string;
  anonymous: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemorialStatistics {
  victims: {
    total: number;
    byCategory: Array<{ category: VictimCategory; count: number }>;
    byYear: Array<{ year: number; count: number }>;
  };
  politicalPrisoners: {
    total: number;
    currentlyDetained: number;
    tortured: number;
    byStatus: Array<{ status: PrisonerStatus; count: number }>;
    byFacility: Array<{ facility: FacilityType; count: number }>;
  };
  exiles: {
    totalStories: number;
    byDestination: Array<{ destination: string; count: number }>;
    byYear: Array<{ year: number; count: number }>;
    byReason: Array<{ reason: ExileReason; count: number }>;
    familySeparated: number;
    darienCrossings: number;
    officialEstimate: number;
  };
  message: string;
  messageEs: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchResult {
  officials: Official[];
  sanctions: Sanction[];
  cases: Case[];
  totalResults: number;
}
