import { Response, NextFunction } from 'express';
import { studentService } from '../services/studentService';
import { profileUpdateSchema } from '../validators/schemas';
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
};
