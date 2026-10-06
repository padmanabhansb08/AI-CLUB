export type AchievementCategory =
  | 'EVENT'
  | 'LEARNING'
  | 'PROJECT'
  | 'TEAM'
  | 'COMMUNITY'
  | 'MILESTONE'
  | 'SPECIAL';

export type AchievementCriteriaType =
  | 'EVENT_COUNT'
  | 'EVENT_ATTENDANCE_COUNT'
  | 'COURSE_ENROLLMENT_COUNT'
  | 'COURSE_COMPLETION_COUNT'
  | 'LESSON_COMPLETION_COUNT'
  | 'PROJECT_COUNT'
  | 'PROJECT_COMPLETION_COUNT'
  | 'TEAM_PARTICIPATION_COUNT'
  | 'MILESTONE_COMPLETION_COUNT'
  | 'HACKATHON_PARTICIPATION'
  | 'MANUAL'
  | 'SPECIAL';

export interface AchievementItem {
  id: string;
  name: string;
  title?: string;
  slug: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  criteria_type: AchievementCriteriaType;
  criteria_config: {
    target?: number;
    description?: string;
    [key: string]: any;
  };
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Included when queried with student context
  earned?: boolean;
  earned_at?: string | null;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

export interface MemberAchievementItem {
  id: string;
  member_id: string;
  achievement_id: string;
  earned_at: string;
  metadata?: any;
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
  earned_at: string | null;
}

export interface MemberAchievementStats {
  totalEarned: number;
  totalPoints: number;
  totalActiveAchievements: number;
  inProgressCount: number;
}

export interface AdminAchievementStats {
  achievement: AchievementItem;
  totalEarned: number;
  uniqueMembers: number;
  recentAwards: Array<{
    earned_at: string;
    member_id: string;
    full_name: string;
    profile_photo_url?: string;
    department?: string;
  }>;
}

export interface AdminGlobalAchievementStats {
  totalAwards: number;
  uniqueStudents: number;
  totalPointsAwarded: number;
  mostEarned: Array<AchievementItem & { count: number }>;
}
