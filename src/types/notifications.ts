export type NotificationType =
  | 'EVENT_REGISTRATION_CONFIRMED'
  | 'EVENT_REGISTRATION_CANCELLED'
  | 'EVENT_REMINDER'
  | 'EVENT_CANCELLED'
  | 'EVENT_COMPLETED'
  | 'PROJECT_JOIN_REQUEST'
  | 'PROJECT_JOIN_APPROVED'
  | 'PROJECT_JOIN_REJECTED'
  | 'PROJECT_INVITATION'
  | 'TEAM_INVITATION'
  | 'TEAM_INVITATION_ACCEPTED'
  | 'TEAM_MEMBER_ADDED'
  | 'TEAM_MEMBER_REMOVED'
  | 'COURSE_ENROLLED'
  | 'COURSE_COMPLETED'
  | 'COURSE_MILESTONE'
  | 'ACHIEVEMENT_EARNED'
  | 'SYSTEM_ANNOUNCEMENT';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface NotificationItem {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  priority: NotificationPriority;
  read_at: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface NotificationPreferences {
  id?: string;
  member_id?: string;
  event_notifications: boolean;
  project_notifications: boolean;
  team_notifications: boolean;
  course_notifications: boolean;
  achievement_notifications: boolean;
  system_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MemberActivityItem {
  id: string;
  member_id: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export type AnnouncementAudience =
  | 'ALL_MEMBERS'
  | 'STUDENTS'
  | 'ADMINS'
  | 'COURSE_MEMBERS'
  | 'PROJECT_MEMBERS'
  | 'EVENT_REGISTRANTS';

export interface AdminAnnouncementPayload {
  title: string;
  message: string;
  audience: AnnouncementAudience;
  audience_target_id?: string;
  priority?: NotificationPriority;
  expires_in_days?: number;
}

export interface AnnouncementHistoryItem {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  created_at: string;
  recipient_count: number;
  read_count: number;
}
