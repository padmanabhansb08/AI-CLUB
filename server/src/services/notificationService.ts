import { notificationRepo } from '../repositories/notificationRepository';
import { query } from '../db';
import { AppError } from '../errors/AppError';
import type { NotificationItem, NotificationPreferences } from '../types/notifications';

export const notificationService = {
  // Create single notification respecting preferences
  createNotification: async (data: {
    recipient_id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    priority?: string;
    expires_at?: any;
  }): Promise<NotificationItem | null> => {
    // Check recipient preferences
    const prefs = await notificationRepo.getPreferences(data.recipient_id);

    // Determine category based on type
    if (data.type.startsWith('EVENT_') && !prefs.event_notifications) {
      return null;
    }
    if (data.type.startsWith('PROJECT_') && !prefs.project_notifications) {
      return null;
    }
    if (data.type.startsWith('TEAM_') && !prefs.team_notifications) {
      return null;
    }
    if (data.type.startsWith('COURSE_') && !prefs.course_notifications) {
      return null;
    }
    if (data.type === 'ACHIEVEMENT_EARNED' && !prefs.achievement_notifications) {
      return null;
    }
    if (data.type === 'SYSTEM_ANNOUNCEMENT' && !prefs.system_notifications) {
      return null;
    }

    return await notificationRepo.create(data);
  },

  // Bulk Announcements by audience
  sendAnnouncement: async (params: {
    title: string;
    message: string;
    audience: 'ALL_MEMBERS' | 'STUDENTS' | 'ADMINS' | 'COURSE_MEMBERS' | 'PROJECT_MEMBERS' | 'EVENT_REGISTRANTS';
    targetEntityId?: string;
    priority?: string;
    adminUserId: string;
  }) => {
    if (!params.title || !params.message) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Title and message are required for announcements');
    }

    let recipientMemberIds: string[] = [];

    switch (params.audience) {
      case 'ALL_MEMBERS': {
        const res = await query('SELECT id FROM members');
        recipientMemberIds = res.rows.map((r: any) => r.id);
        break;
      }
      case 'STUDENTS': {
        const res = await query(
          `SELECT m.id FROM members m
           JOIN users u ON u.id = m.user_id
           WHERE u.role = 'student'`
        );
        recipientMemberIds = res.rows.map((r: any) => r.id);
        break;
      }
      case 'ADMINS': {
        const res = await query(
          `SELECT m.id FROM members m
           JOIN users u ON u.id = m.user_id
           WHERE u.role = 'admin'`
        );
        recipientMemberIds = res.rows.map((r: any) => r.id);
        break;
      }
      case 'COURSE_MEMBERS': {
        if (!params.targetEntityId) {
          throw new AppError(400, 'INVALID_AUDIENCE', 'targetEntityId (courseId) is required for COURSE_MEMBERS');
        }
        const res = await query(
          `SELECT member_id as id FROM course_enrollments WHERE course_id = $1`,
          [params.targetEntityId]
        );
        recipientMemberIds = res.rows.map((r: any) => r.id);
        break;
      }
      case 'PROJECT_MEMBERS': {
        if (!params.targetEntityId) {
          throw new AppError(400, 'INVALID_AUDIENCE', 'targetEntityId (projectId) is required for PROJECT_MEMBERS');
        }
        const res = await query(
          `SELECT member_id as id FROM project_memberships WHERE project_id = $1 AND status = 'ACTIVE'`,
          [params.targetEntityId]
        );
        recipientMemberIds = res.rows.map((r: any) => r.id);
        break;
      }
      case 'EVENT_REGISTRANTS': {
        if (!params.targetEntityId) {
          throw new AppError(400, 'INVALID_AUDIENCE', 'targetEntityId (eventId) is required for EVENT_REGISTRANTS');
        }
        const res = await query(
          `SELECT member_id as id FROM event_registrations WHERE event_id = $1 AND status = 'CONFIRMED'`,
          [params.targetEntityId]
        );
        recipientMemberIds = res.rows.map((r: any) => r.id);
        break;
      }
      default:
        throw new AppError(400, 'INVALID_ANNOUNCEMENT_AUDIENCE', `Unsupported audience: ${params.audience}`);
    }

    if (recipientMemberIds.length === 0) {
      return { recipientCount: 0, message: 'No recipients matched the targeted audience.' };
    }

    const notificationsToCreate = recipientMemberIds.map((recipient_id) => ({
      recipient_id,
      type: 'SYSTEM_ANNOUNCEMENT',
      title: params.title,
      message: params.message,
      data: {
        audience: params.audience,
        targetEntityId: params.targetEntityId,
        sentByAdminId: params.adminUserId,
      },
      priority: params.priority || 'HIGH',
    }));

    const created = await notificationRepo.createBulk(notificationsToCreate);
    return {
      recipientCount: created.length,
      audience: params.audience,
      title: params.title,
    };
  },

  getUserNotifications: async (
    memberId: string,
    params: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ) => {
    return await notificationRepo.findUserNotifications(memberId, params);
  },

  getUnreadCount: async (memberId: string): Promise<number> => {
    return await notificationRepo.countUnread(memberId);
  },

  markAsRead: async (id: string, memberId: string): Promise<NotificationItem> => {
    const existing = await notificationRepo.findById(id);
    if (!existing) {
      throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
    }
    if (existing.recipient_id !== memberId) {
      throw new AppError(403, 'NOTIFICATION_ACCESS_DENIED', 'Cannot modify another student notification');
    }

    const updated = await notificationRepo.markAsRead(id, memberId);
    if (!updated) {
      throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
    }
    return updated;
  },

  markAllAsRead: async (memberId: string) => {
    const count = await notificationRepo.markAllAsRead(memberId);
    return { updatedCount: count };
  },

  getPreferences: async (memberId: string): Promise<NotificationPreferences> => {
    return await notificationRepo.getPreferences(memberId);
  },

  updatePreferences: async (
    memberId: string,
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    return await notificationRepo.updatePreferences(memberId, prefs);
  },

  recordActivity: async (data: {
    member_id: string;
    activity_type: string;
    entity_type: string;
    entity_id?: string;
    metadata?: any;
  }) => {
    return await notificationRepo.recordActivity(data);
  },

  getMemberActivity: async (memberId: string, limit = 15) => {
    return await notificationRepo.getMemberActivity(memberId, limit);
  },

  getAdminHistory: async (params: { page?: number; limit?: number } = {}) => {
    return await notificationRepo.getAdminHistory(params);
  },
};
