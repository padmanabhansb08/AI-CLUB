import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService';
import { memberRepo } from '../repositories/memberRepository';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { auditService } from '../services/auditService';

// Helper to resolve member ID
async function resolveMemberId(req: AuthRequest): Promise<string> {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  const userId = req.user.userId || req.user.id;
  const member = await memberRepo.findByUserId(userId);
  if (!member) throw ApiError.notFound('Member profile not found');
  return member.id;
}

export const notificationController = {
  // Student notifications
  getMyNotifications: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await resolveMemberId(req);
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const unreadOnly = req.query.unreadOnly === 'true' || req.query.unreadOnly === '1';

      const result = await notificationService.getUserNotifications(memberId, {
        page,
        limit,
        unreadOnly,
      });

      return sendPaginated(
        res,
        result.items,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          unreadCount: result.unreadCount,
        } as any,
        'Notifications retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  },

  getUnreadCount: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await resolveMemberId(req);
      const count = await notificationService.getUnreadCount(memberId);
      return sendSuccess(res, { count }, 'Unread count retrieved');
    } catch (err) {
      next(err);
    }
  },

  markAsRead: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await resolveMemberId(req);
      const id = req.params.id as string;
      const updated = await notificationService.markAsRead(id, memberId);
      return sendSuccess(res, updated, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  },

  markAllAsRead: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await resolveMemberId(req);
      const result = await notificationService.markAllAsRead(memberId);
      return sendSuccess(res, result, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  },

  getPreferences: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await resolveMemberId(req);
      const prefs = await notificationService.getPreferences(memberId);
      return sendSuccess(res, prefs, 'Notification preferences retrieved');
    } catch (err) {
      next(err);
    }
  },

  updatePreferences: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await resolveMemberId(req);
      const updated = await notificationService.updatePreferences(memberId, req.body);
      return sendSuccess(res, updated, 'Notification preferences updated');
    } catch (err) {
      next(err);
    }
  },

  getActivity: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await resolveMemberId(req);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 15));
      const items = await notificationService.getMemberActivity(memberId, limit);
      return sendSuccess(res, items, 'Activity feed retrieved');
    } catch (err) {
      next(err);
    }
  },

  // Admin Announcements & History
  sendAnnouncement: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw ApiError.forbidden('Admin authorization required');
      }
      const adminUserId = req.user.userId || req.user.id;
      const result = await notificationService.sendAnnouncement({
        title: req.body.title,
        message: req.body.message,
        audience: req.body.audience || 'ALL_MEMBERS',
        targetEntityId: req.body.targetEntityId,
        priority: req.body.priority || 'HIGH',
        adminUserId,
      });

      // Audit log announcement
      auditService.logAction({
        actorId: adminUserId,
        action: 'ANNOUNCEMENT_CREATED',
        entityType: 'ANNOUNCEMENT',
        entityId: (result as any)?.announcement?.id || 'GLOBAL',
        afterData: {
          title: req.body.title,
          audience: req.body.audience || 'ALL_MEMBERS',
          recipientCount: (result as any)?.recipientCount || 0,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(() => {});

      return sendSuccess(res, result, 'Announcement sent successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  getAdminHistory: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw ApiError.forbidden('Admin authorization required');
      }
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

      const result = await notificationService.getAdminHistory({ page, limit });
      return sendPaginated(
        res,
        result.items,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          stats: result.stats,
        } as any,
        'Notification delivery history retrieved'
      );
    } catch (err) {
      next(err);
    }
  },
};
