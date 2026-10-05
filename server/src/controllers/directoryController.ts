import { Request, Response, NextFunction } from 'express';
import { memberRepo } from '../repositories/memberRepository';

export const directoryController = {
  getMembers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const department = req.query.department as string;
      const year = req.query.year as string;
      const skill = req.query.skill as string;
      const interest = req.query.interest as string;

      const result = await memberRepo.findDirectoryMembers(search, department, year, skill, interest, page, limit);
      res.json({
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (err) {
      next(err);
    }
  },

  getMemberById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const member = await memberRepo.getDirectoryMemberById(id);
      if (!member) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Member not found' } });
      }
      res.json({ data: member });
    } catch (err) {
      next(err);
    }
  }
};
