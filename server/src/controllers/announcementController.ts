import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { announcementService } from '../services/announcementService';
import { createAnnouncementSchema, updateAnnouncementSchema } from '../schemas/announcementSchema';
import { pool } from '../db';
import { ApiError } from '../middleware/errorHandler';

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      let memberId: string | null = null;
      if (req.user && req.user.role === 'student') {
        memberId = await getMemberId(req.user.id);
      }
      
      const result = await announcementService.getVisibleAnnouncements(memberId, page, limit);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
  
  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const memberId = await getMemberId(req.user!.id);
      const result = await announcementService.getUnreadCount(memberId);
      res.json({ data: result });
    } catch (e) {
      next(e);
    }
  },
  
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const memberId = await getMemberId(req.user!.id);
      const result = await announcementService.markAsRead(id as string, memberId);
      res.json({ data: result });
    } catch (e) {
      next(e);
    }
  },
  
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let memberId: string | null = null;
      if (req.user && req.user.role === 'student') {
        memberId = await getMemberId(req.user.id);
      }
      const data = await announcementService.getById(id as string, memberId);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  },
  
  async getAllAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await announcementService.getAllAdmin();
      res.json({ data });
    } catch (e) {
      next(e);
    }
  },
  
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createAnnouncementSchema.parse(req.body);
      const result = await announcementService.create(data, req.user!.id);
      res.status(201).json({ data: result });
    } catch (e) {
      next(e);
    }
  },
  
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateAnnouncementSchema.parse(req.body);
      const result = await announcementService.update(id as string, data);
      res.json({ data: result });
    } catch (e) {
      next(e);
    }
  },
  
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await announcementService.delete(id as string);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
};
