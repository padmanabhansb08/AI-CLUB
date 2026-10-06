import type { MemberProfile, ProfileCompletion } from './profile';

export interface DashboardStats {
  projects: number;
  courses: number;
  achievements: number;
  events: number;
  totalProjects?: number;
  totalCourses?: number;
  totalEvents?: number;
}

export interface ActivityItem {
  id: string;
  type: 'achievement' | 'course' | 'project' | 'event';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  link?: string;
}

export interface DashboardData {
  profile: MemberProfile;
  profileCompletion: ProfileCompletion;
  stats: DashboardStats;
  announcements: any[];
  recentProjects: any[];
  recentAchievements: any[];
  recentActivity: ActivityItem[];
  upcomingEvents?: any[];
}
