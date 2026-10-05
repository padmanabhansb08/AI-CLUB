import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/studentService';
import { profileUpdateSchema } from '../validators/schemas';

export const studentController = {
  getProfile: async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const profile = await studentService.getProfile(userId);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const data = profileUpdateSchema.parse(req.body);
      const profile = await studentService.updateProfile(userId, data);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  }
};
