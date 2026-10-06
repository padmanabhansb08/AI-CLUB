import { client } from './client';

export interface MembershipApplication {
  id: string;
  user_id: string;
  member_id: string | null;
  application_number: string;
  status:
    | 'DRAFT'
    | 'TEST_REQUIRED'
    | 'TEST_IN_PROGRESS'
    | 'TEST_COMPLETED'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'WAITLISTED'
    | 'REJECTED'
    | 'WITHDRAWN';
  test_attempt_id: string | null;
  final_score: number | null;
  score_percentage: number | null;
  passed: boolean | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  fullName?: string;
  email?: string;
  registerNumber?: string;
  department?: string;
  year?: number;
  classSection?: string;
  phone?: string;
  skills?: string[];
  technicalInterests?: string[];
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  memberNumber?: string;
  membershipStatus?: string;
}

export interface ApplicationCounts {
  total: number;
  pending: number;
  passed: number;
  failed: number;
  approved: number;
  waitlisted: number;
  rejected: number;
}

export interface ApplicationAnalytics {
  summary: {
    totalApplications: number;
    avgScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
    approvalRate: number;
  };
  byDepartment: Array<{ department: string; count: number; approved: number }>;
  byYear: Array<{ year: number; count: number; approved: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
}

export const applicationApi = {
  // Student: Get current application status
  getMyApplication: async () => {
    return await client.get<{
      application: MembershipApplication;
      latestAttempt: any | null;
    }>('/applications/me');
  },

  // Student: Update profile
  updateProfile: async (data: {
    fullName: string;
    registerNumber: string;
    department: string;
    classSection: string;
    year: number;
    collegeEmail: string;
    phone?: string;
    bio?: string;
    skills?: string[];
    technicalInterests?: string[];
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  }) => {
    return await client.put<{
      profile: any;
      application: MembershipApplication;
    }>('/applications/profile', data);
  },

  // Admin: List applications
  listApplications: async (params: {
    search?: string;
    status?: string;
    passed?: string;
    department?: string;
    year?: number;
    minScore?: number;
    maxScore?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  } = {}) => {
    return await client.get<{
      applications: MembershipApplication[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>('/applications', { params: params as any });
  },

  // Admin: Get single application
  getById: async (id: string) => {
    return await client.get<{
      application: MembershipApplication;
      attempt: any | null;
    }>(`/applications/${id}`);
  },

  // Admin: Review application
  reviewApplication: async (
    id: string,
    data: {
      decision: 'APPROVED' | 'WAITLISTED' | 'REJECTED';
      notes?: string;
      rejectionReason?: string;
    }
  ) => {
    return await client.post<{
      success: boolean;
      decision: string;
      application: MembershipApplication;
      membership?: any;
      message: string;
    }>(`/applications/${id}/review`, data);
  },

  // Admin: Get application counts
  getCounts: async () => {
    return await client.get<ApplicationCounts>('/applications/counts');
  },

  // Admin: Get selection analytics
  getAnalytics: async () => {
    return await client.get<ApplicationAnalytics>('/applications/analytics');
  },
};
