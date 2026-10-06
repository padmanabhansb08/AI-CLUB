export const NOTIFICATION_TYPES = [
  'EVENT_REGISTRATION_CONFIRMED',
  'EVENT_REGISTRATION_CANCELLED',
  'EVENT_REMINDER',
  'EVENT_CANCELLED',
  'EVENT_COMPLETED',
  'PROJECT_JOIN_REQUEST',
  'PROJECT_JOIN_APPROVED',
  'PROJECT_JOIN_REJECTED',
  'PROJECT_INVITATION',
  'TEAM_INVITATION',
  'TEAM_INVITATION_ACCEPTED',
  'TEAM_MEMBER_ADDED',
  'TEAM_MEMBER_REMOVED',
  'COURSE_ENROLLED',
  'COURSE_COMPLETED',
  'COURSE_MILESTONE',
  'ACHIEVEMENT_EARNED',
  'SYSTEM_ANNOUNCEMENT',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export interface NotificationItem {
  id: string;
  recipient_id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  data: Record<string, any>;
  priority: NotificationPriority | string;
  read_at: string | null;
  expires_at?: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  member_id: string;
  event_notifications: boolean;
  project_notifications: boolean;
  team_notifications: boolean;
  course_notifications: boolean;
  achievement_notifications: boolean;
  system_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberActivityItem {
  id: string;
  member_id: string;
  activity_type: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}
