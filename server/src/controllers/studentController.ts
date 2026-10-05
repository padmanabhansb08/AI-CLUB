import { Response, NextFunction } from 'express';
import { studentService } from '../services/studentService';
import {
  profileUpdateSchema,
  memberSkillsUpdateSchema,
  memberInterestsUpdateSchema,
} from '../validators/schemas';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const studentController = {
  getProfile: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const profile = await studentService.getProfile(userId!);
      return sendSuccess(res, profile, 'Member profile retrieved');
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const data = profileUpdateSchema.parse(req.body);
      const profile = await studentService.updateProfile(userId!, data);
      return sendSuccess(res, profile, 'Member profile updated successfully');
    } catch (err) {
      next(err);
    }
  },

  getSkills: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const skills = await studentService.getSkills(userId!);
      return sendSuccess(res, skills, 'Member skills retrieved');
    } catch (err) {
      next(err);
    }
  },

  updateSkills: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const data = memberSkillsUpdateSchema.parse(req.body);
      const skills = await studentService.updateSkills(userId!, data.skills);
      return sendSuccess(res, skills, 'Member skills updated successfully');
    } catch (err) {
      next(err);
    }
  },

  getInterests: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const interests = await studentService.getInterests(userId!);
      return sendSuccess(res, interests, 'Member interests retrieved');
    } catch (err) {
      next(err);
    }
  },

  updateInterests: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const data = memberInterestsUpdateSchema.parse(req.body);
      const interests = await studentService.updateInterests(userId!, data.interests);
      return sendSuccess(res, interests, 'Member interests updated successfully');
    } catch (err) {
      next(err);
    }
  },
};
