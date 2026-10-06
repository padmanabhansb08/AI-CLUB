import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analyticsService';

export const analyticsController = {
  getMembers: async (req: AuthRequest, res: Response) => {
    try {
      const { range, from, to } = req.query;
      const data = await analyticsService.getMemberAnalytics(range as string, from as string, to as string);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: { code: err.code || 'ANALYTICS_ERROR', message: err.message },
      });
    }
  },

  getEvents: async (req: AuthRequest, res: Response) => {
    try {
      const { range, from, to } = req.query;
      const data = await analyticsService.getEventAnalytics(range as string, from as string, to as string);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: { code: err.code || 'ANALYTICS_ERROR', message: err.message },
      });
    }
  },

  getProjects: async (req: AuthRequest, res: Response) => {
    try {
      const { range, from, to } = req.query;
      const data = await analyticsService.getProjectAnalytics(range as string, from as string, to as string);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: { code: err.code || 'ANALYTICS_ERROR', message: err.message },
      });
    }
  },

  getCourses: async (req: AuthRequest, res: Response) => {
    try {
      const { range, from, to } = req.query;
      const data = await analyticsService.getCourseAnalytics(range as string, from as string, to as string);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: { code: err.code || 'ANALYTICS_ERROR', message: err.message },
      });
    }
  },

  getAchievements: async (req: AuthRequest, res: Response) => {
    try {
      const { range, from, to } = req.query;
      const data = await analyticsService.getAchievementAnalytics(range as string, from as string, to as string);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: { code: err.code || 'ANALYTICS_ERROR', message: err.message },
      });
    }
  },

  getEngagement: async (req: AuthRequest, res: Response) => {
    try {
      const { range, from, to } = req.query;
      const data = await analyticsService.getEngagementAnalytics(range as string, from as string, to as string);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: { code: err.code || 'ANALYTICS_ERROR', message: err.message },
      });
    }
  },
};
