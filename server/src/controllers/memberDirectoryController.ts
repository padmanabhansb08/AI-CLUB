import { Request, Response, NextFunction } from 'express';
import { memberRepo } from '../repositories/memberRepository';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError } from '../errors/AppError';

export const memberDirectoryController = {
  getMembers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const search = (req.query.search as string) || undefined;
      const department = (req.query.department as string) || undefined;
      const skill = (req.query.skill as string) || undefined;

      const data = await memberRepo.findPublicMembers(search, department, skill, page, limit);

      return sendPaginated(
        res,
        data.items,
        {
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: Math.ceil(data.total / data.limit) || 1,
        },
        'Member directory retrieved'
      );
    } catch (err) {
      next(err);
    }
  },

  getMemberById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const member = await memberRepo.findPublicById(id);
      if (!member) {
        throw new NotFoundError(`Member with ID '${id}' not found`);
      }
      return sendSuccess(res, member, 'Public member profile retrieved');
    } catch (err) {
      next(err);
    }
  },
};
