export const ACHIEVEMENT_CATEGORIES = [
  'EVENT',
  'LEARNING',
  'PROJECT',
  'TEAM',
  'COMMUNITY',
  'MILESTONE',
  'SPECIAL',
] as const;
export type AchievementCategory = (typeof ACHIEVEMENT_CATEGORIES)[number];

export const ACHIEVEMENT_CRITERIA_TYPES = [
  'EVENT_COUNT',
  'EVENT_ATTENDANCE_COUNT',
  'COURSE_ENROLLMENT_COUNT',
  'COURSE_COMPLETION_COUNT',
  'LESSON_COMPLETION_COUNT',
  'PROJECT_COUNT',
  'PROJECT_COMPLETION_COUNT',
  'TEAM_PARTICIPATION_COUNT',
  'MILESTONE_COMPLETION_COUNT',
  'HACKATHON_PARTICIPATION',
] as const;
export type AchievementCriteriaType = (typeof ACHIEVEMENT_CRITERIA_TYPES)[number];

export interface AchievementCriteriaConfig {
  target: number;
  [key: string]: any;
}

export interface AchievementItem {
  id: string;
  name: string;
  title?: string;
  slug: string;
  description: string;
  icon: string;
  category: AchievementCategory | string;
  criteria_type: AchievementCriteriaType | string;
  criteria_config: AchievementCriteriaConfig;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed per member
  earned?: boolean;
  earned_at?: string | null;
  current_progress?: number;
  target_progress?: number;
  progress_percentage?: number;
}

export interface MemberAchievementItem {
  id: string;
  member_id: string;
  achievement_id: string;
  earned_at: string;
  metadata?: Record<string, any>;
  achievement?: AchievementItem;
}

export interface AchievementProgressItem {
  achievement: AchievementItem;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  earned: boolean;
  earned_at?: string | null;
}
