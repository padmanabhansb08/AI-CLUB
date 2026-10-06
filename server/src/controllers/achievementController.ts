import { Request, Response, NextFunction } from 'express';
import { achievementService } from '../services/achievementService';
import { memberRepo } from '../repositories/memberRepository';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

// Helper to resolve member ID
async function resolveMemberId(req: AuthRequest): Promise<string> {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  const userId = req.user.userId || req.user.id;
  const member = await memberRepo.findByUserId(userId);
  if (!member) throw ApiError.notFound('Member profile not found');
  return member.id;
}

export const achievementController = {
  // Public / Student Catalog
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      let memberId: string | undefined;
      if (authReq.user) {
        try {
          memberId = await resolveMemberId(authReq);
        } catch {
          // ignore if unauthenticated or admin without profile
        }
      }

      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
      const category = req.query.category as string;
      const search = req.query.search as string;

      const result = await achievementService.getAllAchievements(
        { page, limit, category, search },
        memberId
      );

      return sendPaginated(
        res,
        result.items,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        'Achievements retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      let memberId: string | undefined;
      if (authReq.user) {
        try {
          memberId = await resolveMemberId(authReq);
        } catch {
          // ignore
        }
      }

      const id = req.params.id as string;
      const ach = await achievementService.getAchievementById(id, memberId);
      return sendSuccess(res, ach, 'Achievement details retrieved');
    } catch (err) {
      next(err);
    }
  },

  getMyAchievements: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await resolveMemberId(req);
      const items = await achievementService.getMemberAchievements(memberId);
      return sendSuccess(res, items, 'My earned achievements retrieved');
    } catch (err) {
      next(err);
    }
  },

  getMyProgress: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await resolveMemberId(req);
      const items = await achievementService.getMemberProgress(memberId);
      return sendSuccess(res, items, 'Achievement progress retrieved');
    } catch (err) {
      next(err);
    }
  },

  getMyStats: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await resolveMemberId(req);
      const stats = await achievementService.getMemberStats(memberId);
      return sendSuccess(res, stats, 'Achievement statistics retrieved');
    } catch (err) {
      next(err);
    }
  },

  getMemberAchievements: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memberId = req.params.memberId as string;
      const items = await achievementService.getMemberAchievements(memberId);
      return sendSuccess(res, items, 'Member achievements retrieved');
    } catch (err) {
      next(err);
    }
  },

  evaluate: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await resolveMemberId(req);
      const awarded = await achievementService.evaluateMemberAchievements(memberId);
      return sendSuccess(res, awarded, 'Achievement evaluation complete');
    } catch (err) {
      next(err);
    }
  },

  // Admin Management
  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw ApiError.forbidden('Admin authorization required');
      }
      const created = await achievementService.createAchievement(req.body);
      return sendSuccess(res, created, 'Achievement created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw ApiError.forbidden('Admin authorization required');
      }
      const id = req.params.id as string;
      const updated = await achievementService.updateAchievement(id, req.body);
      return sendSuccess(res, updated, 'Achievement updated successfully');
    } catch (err) {
      next(err);
    }
  },

  activate: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw ApiError.forbidden('Admin authorization required');
      }
      const id = req.params.id as string;
      const updated = await achievementService.activateAchievement(id);
      return sendSuccess(res, updated, 'Achievement activated');
    } catch (err) {
      next(err);
    }
  },

  deactivate: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw ApiError.forbidden('Admin authorization required');
      }
      const id = req.params.id as string;
      const updated = await achievementService.deactivateAchievement(id);
      return sendSuccess(res, updated, 'Achievement deactivated');
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw ApiError.forbidden('Admin authorization required');
      }
      const id = req.params.id as string;
      await achievementService.deleteAchievement(id);
      return sendSuccess(res, { id }, 'Achievement deleted');
    } catch (err) {
      next(err);
    }
  },

  getStats: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw ApiError.forbidden('Admin authorization required');
      }
      const id = req.params.id as string;
      const stats = await achievementService.getAchievementStats(id);
      return sendSuccess(res, stats, 'Achievement statistics retrieved');
    } catch (err) {
      next(err);
    }
  },

  getGlobalStats: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw ApiError.forbidden('Admin authorization required');
      }
      const stats = await achievementService.getAdminGlobalStats();
      return sendSuccess(res, stats, 'Global achievement statistics retrieved');
    } catch (err) {
      next(err);
    }
  },
};
