export interface PublicMember {
  id: string;
  fullName: string;
  registerNumber: string;
  department: string;
  classSection: string;
  year: number;
  bio?: string;
  profilePhotoUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  technicalInterests?: string[];
  joinedAt: string;
  status: string;
}

export interface MembersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MembersResponse {
  data: PublicMember[];
  pagination: MembersPagination;
}
