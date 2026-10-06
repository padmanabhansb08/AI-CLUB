import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { exportService } from '../services/exportService';

export const exportController = {
  exportMembers: async (req: AuthRequest, res: Response) => {
    try {
      const actor = {
        userId: req.user!.userId,
        role: req.user!.role,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };
      const csv = await exportService.exportMembers(actor);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="members-${Date.now()}.csv"`);
      return res.status(200).send(csv);
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: { code: 'EXPORT_FAILED', message: err.message },
      });
    }
  },

  exportEvents: async (req: AuthRequest, res: Response) => {
    try {
      const actor = {
        userId: req.user!.userId,
        role: req.user!.role,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };
      const csv = await exportService.exportEvents(actor);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="events-${Date.now()}.csv"`);
      return res.status(200).send(csv);
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: { code: 'EXPORT_FAILED', message: err.message },
      });
    }
  },

  exportAttendance: async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.query;
      const actor = {
        userId: req.user!.userId,
        role: req.user!.role,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };
      const csv = await exportService.exportAttendance(actor, eventId as string);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendance-${Date.now()}.csv"`);
      return res.status(200).send(csv);
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: { code: 'EXPORT_FAILED', message: err.message },
      });
    }
  },

  exportCourseEnrollments: async (req: AuthRequest, res: Response) => {
    try {
      const actor = {
        userId: req.user!.userId,
        role: req.user!.role,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };
      const csv = await exportService.exportCourseEnrollments(actor);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="course-enrollments-${Date.now()}.csv"`);
      return res.status(200).send(csv);
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: { code: 'EXPORT_FAILED', message: err.message },
      });
    }
  },

  exportAchievements: async (req: AuthRequest, res: Response) => {
    try {
      const actor = {
        userId: req.user!.userId,
        role: req.user!.role,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };
      const csv = await exportService.exportAchievements(actor);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="achievements-${Date.now()}.csv"`);
      return res.status(200).send(csv);
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: { code: 'EXPORT_FAILED', message: err.message },
      });
    }
  },
};
