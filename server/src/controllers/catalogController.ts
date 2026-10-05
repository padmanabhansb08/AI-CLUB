import { Request, Response, NextFunction } from 'express';
import { skillRepository } from '../repositories/skillRepository';
import { interestRepository } from '../repositories/interestRepository';
import { sendSuccess } from '../utils/response';

export const catalogController = {
  getSkills: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skills = await skillRepository.getAll();
      return sendSuccess(res, skills, 'Skills catalog retrieved');
    } catch (err) {
      next(err);
    }
  },

  getInterests: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const interests = await interestRepository.getAll();
      return sendSuccess(res, interests, 'Technical interests catalog retrieved');
    } catch (err) {
      next(err);
    }
  },
};
