import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const dashboardController = {
  getDashboard: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const data = await dashboardService.getStudentDashboard(userId!);
      return sendSuccess(res, data, 'Personalized student dashboard data retrieved');
    } catch (err) {
      next(err);
    }
  },
};
