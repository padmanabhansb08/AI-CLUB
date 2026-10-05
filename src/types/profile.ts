export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface SkillItem {
  id?: string;
  name: string;
  category?: string;
  proficiency?: SkillProficiency;
}

export interface InterestItem {
  id?: string;
  name: string;
  category?: string;
}

export interface ProfileCompletion {
  percentage: number;
  completed: number;
  total: number;
  missing: string[];
}

export interface MemberProfile {
  id: string;
  userId: string;
  fullName: string;
  registerNumber: string;
  department: string;
  classSection: string;
  year: number;
  collegeEmail: string;
  phone?: string;
  bio?: string;
  profilePhotoUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  normalizedSkills?: SkillItem[];
  technicalInterests: string[];
  normalizedInterests?: InterestItem[];
  status: 'Active' | 'Inactive' | string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  profileCompletion: ProfileCompletion;
}

export interface ProfileUpdatePayload {
  fullName?: string;
  department?: string;
  classSection?: string;
  year?: number;
  phone?: string;
  bio?: string;
  profilePhotoUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills?: Array<SkillItem | string>;
  technicalInterests?: string[];
  interests?: string[];
}
