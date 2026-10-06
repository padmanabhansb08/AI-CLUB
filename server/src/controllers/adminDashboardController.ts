import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analyticsService';

export const adminDashboardController = {
  getDashboard: async (req: AuthRequest, res: Response) => {
    try {
      const { range, from, to } = req.query;
      const kpis = await analyticsService.getDashboardKPIs(
        range as string,
        from as string,
        to as string
      );
      return res.status(200).json({
        success: true,
        data: kpis,
        message: 'Admin dashboard KPIs loaded successfully',
      });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'ANALYTICS_ERROR',
          message: err.message || 'Failed to load dashboard KPIs',
          details: err.details || {},
        },
      });
    }
  },
};
