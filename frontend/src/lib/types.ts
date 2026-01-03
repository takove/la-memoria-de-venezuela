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
