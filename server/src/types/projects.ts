export const PROJECT_DOMAINS = [
  'AI_ML',
  'GENERATIVE_AI',
  'DATA_SCIENCE',
  'COMPUTER_VISION',
  'NLP',
  'WEB_DEVELOPMENT',
  'APP_DEVELOPMENT',
  'DEVOPS',
  'CLOUD',
  'CYBERSECURITY',
  'ROBOTICS',
  'IOT',
  'BLOCKCHAIN',
  'OPEN_SOURCE',
  'OTHER',
] as const;

export type ProjectDomain = (typeof PROJECT_DOMAINS)[number];

export const PROJECT_DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;
export type ProjectDifficulty = (typeof PROJECT_DIFFICULTIES)[number];

export const PROJECT_STATUSES = [
  'DRAFT',
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'ARCHIVED',
  'CANCELLED',
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_MEMBERSHIP_ROLES = [
  'OWNER',
  'LEAD',
  'MENTOR',
  'CONTRIBUTOR',
  'MEMBER',
] as const;
export type ProjectMembershipRole = (typeof PROJECT_MEMBERSHIP_ROLES)[number];

export const PROJECT_MEMBERSHIP_STATUSES = [
  'PENDING',
  'ACTIVE',
  'REJECTED',
  'LEFT',
  'REMOVED',
] as const;
export type ProjectMembershipStatus = (typeof PROJECT_MEMBERSHIP_STATUSES)[number];

export const TEAM_STATUSES = ['ACTIVE', 'FULL', 'COMPLETED', 'ARCHIVED'] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];

export const TEAM_ROLES = [
  'TEAM_LEAD',
  'TECH_LEAD',
  'DEVELOPER',
  'ML_ENGINEER',
  'DESIGNER',
  'RESEARCHER',
  'DOCUMENTATION',
  'CONTRIBUTOR',
  'MEMBER',
] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const TEAM_INVITATION_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
  'CANCELLED',
] as const;
export type TeamInvitationStatus = (typeof TEAM_INVITATION_STATUSES)[number];

export const MILESTONE_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export interface ProjectItem {
  id: string;
  title: string;
  slug?: string;
  short_description: string;
  description: string;
  domain: ProjectDomain | string;
  difficulty: ProjectDifficulty | string;
  status: ProjectStatus | string;
  owner_id?: string | null;
  owner_name?: string | null;
  max_team_size: number;
  start_date?: string | null;
  target_end_date?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  documentation_url?: string | null;
  cover_image?: string | null;
  technologies: string[];
  requirements: string[];
  objectives: string[];
  learning_outcomes: string[];
  progress_percentage: number;
  featured?: boolean;
  created_at: string;
  updated_at: string;
  // Computed aggregations
  members_count?: number;
  active_members_count?: number;
  teams_count?: number;
  milestones_count?: number;
  completed_milestones_count?: number;
  // Contextual for current requesting user
  current_member_status?: ProjectMembershipStatus | null;
  current_member_role?: ProjectMembershipRole | null;
}

export interface ProjectMembershipItem {
  id: string;
  project_id: string;
  member_id: string;
  role: ProjectMembershipRole | string;
  status: ProjectMembershipStatus | string;
  joined_at?: string | null;
  created_at: string;
  updated_at: string;
  // Enriched member profile info
  full_name?: string;
  register_number?: string;
  department?: string;
  year?: number;
  profile_photo_url?: string | null;
}

export interface TeamItem {
  id: string;
  project_id: string;
  project_title?: string;
  name: string;
  description?: string | null;
  team_lead_id?: string | null;
  team_lead_name?: string | null;
  max_members?: number | null;
  status: TeamStatus | string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  members?: TeamMemberItem[];
  current_student_role?: string | null;
}

export interface TeamMemberItem {
  team_id: string;
  member_id: string;
  role: TeamRole | string;
  status?: string;
  joined_at?: string | null;
  full_name: string;
  register_number: string;
  department: string;
  class_section?: string;
  year?: number;
  profile_photo_url?: string | null;
}

export interface TeamInvitationItem {
  id: string;
  team_id: string;
  team_name?: string;
  project_id?: string;
  project_title?: string;
  invited_member_id: string;
  invited_by: string;
  inviter_name?: string;
  status: TeamInvitationStatus | string;
  created_at: string;
  expires_at?: string | null;
  responded_at?: string | null;
}

export interface ProjectMilestoneItem {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  status: MilestoneStatus | string;
  created_at: string;
  updated_at: string;
}
