import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { announcementService } from '../services/announcementService';
import { createAnnouncementSchema, updateAnnouncementSchema } from '../schemas/announcementSchema';
import { pool } from '../db';
import { ApiError } from '../middleware/errorHandler';
import { sendSuccess, sendPaginated } from '../utils/response';

async function getMemberId(userId: string): Promise<string> {
  const res = await pool.query('SELECT id FROM members WHERE user_id = $1', [userId]);
  if ((res.rowCount ?? 0) === 0) {
    throw new ApiError('NOT_FOUND', 'Member profile not found');
  }
  return res.rows[0].id;
}

export const announcementController = {
  async getVisibleAnnouncements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      let memberId: string | null = null;
      const userId = req.user?.userId || req.user?.id;
      if (req.user && req.user.role === 'student' && userId) {
        memberId = await getMemberId(userId);
      }

      const result = await announcementService.getVisibleAnnouncements(memberId, page, limit);
      return sendPaginated(res, result.data, result.pagination, 'Announcements retrieved');
    } catch (e) {
      next(e);
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const memberId = await getMemberId(userId!);
      const result = await announcementService.getUnreadCount(memberId);
      return sendSuccess(res, result, 'Unread announcement count retrieved');
    } catch (e) {
      next(e);
    }
  },

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || req.user?.id;
      const memberId = await getMemberId(userId!);
      const result = await announcementService.markAsRead(id as string, memberId);
      return sendSuccess(res, result, 'Announcement marked as read');
    } catch (e) {
      next(e);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let memberId: string | null = null;
      const userId = req.user?.userId || req.user?.id;
      if (req.user && req.user.role === 'student' && userId) {
        memberId = await getMemberId(userId);
      }
      const data = await announcementService.getById(id as string, memberId);
      return sendSuccess(res, data, 'Announcement retrieved');
    } catch (e) {
      next(e);
    }
  },

  async getAllAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await announcementService.getAllAdmin();
      return sendSuccess(res, data, 'Admin announcements retrieved');
    } catch (e) {
      next(e);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createAnnouncementSchema.parse(req.body);
      const userId = req.user?.userId || req.user?.id;
      const data = await announcementService.create(validated, userId!);
      return sendSuccess(res, data, 'Announcement created successfully', 201);
    } catch (e) {
      next(e);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateAnnouncementSchema.parse(req.body);
      const data = await announcementService.update(id as string, validated);
      return sendSuccess(res, data, 'Announcement updated successfully');
    } catch (e) {
      next(e);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await announcementService.delete(id as string);
      return sendSuccess(res, {}, 'Announcement deleted successfully');
    } catch (e) {
      next(e);
    }
  },
};
