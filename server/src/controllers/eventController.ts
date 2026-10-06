import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/eventService';
import { 
  eventSchema, 
  eventCancelSchema, 
  eventCompleteSchema, 
  markAttendanceSchema, 
  bulkAttendanceSchema, 
  checkInSchema 
} from '../validators/schemas';
import { sendSuccess, sendPaginated } from '../utils/response';

export const publicEventController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const filters = {
        event_type: req.query.eventType as string,
        search: req.query.search as string,
        upcoming: req.query.upcoming === 'true',
        past: req.query.past === 'true',
        from: req.query.from as string,
        to: req.query.to as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as string,
      };
      const result = await eventService.getPublicEvents(page, limit, filters);
      return sendPaginated(res, result.data, result.pagination, 'Events retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getById(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const userId = req.user?.id || req.user?.userId;
      const role = req.user?.role;
      const event = await eventService.getEventDetail(eventId, userId, role);
      return sendSuccess(res, event, 'Event retrieved successfully');
    } catch (err) {
      next(err);
    }
  },
};

export const studentEventController = {
  async register(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const userId = req.user.id || req.user.userId;
      const registration = await eventService.register(eventId, userId);
      return res.status(200).json({
        success: true,
        data: { registration },
        message: 'Successfully registered for the event',
      });
    } catch (err) {
      next(err);
    }
  },

  async cancelRegistration(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const userId = req.user.id || req.user.userId;
      const reason = req.body?.reason || req.body?.cancellation_reason;
      const registration = await eventService.cancelRegistration(eventId, userId, reason);
      return res.status(200).json({
        success: true,
        data: { registration },
        message: 'Successfully cancelled registration',
      });
    } catch (err) {
      next(err);
    }
  },

  async unregister(req: any, res: Response, next: NextFunction) {
    // Backward compatibility alias for cancelRegistration
    try {
      const eventId = req.params.id || req.params.eventId;
      const userId = req.user.id || req.user.userId;
      const registration = await eventService.cancelRegistration(eventId, userId);
      return sendSuccess(res, { registration }, 'Successfully cancelled registration');
    } catch (err) {
      next(err);
    }
  },

  async getMyRegistrations(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id || req.user.userId;
      const registrations = await eventService.getMyRegistrations(userId);
      return sendSuccess(res, registrations, 'My event registrations retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getRegistration(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const userId = req.user.id || req.user.userId;
      const event = await eventService.getEventDetail(eventId, userId, req.user?.role);
      return sendSuccess(res, {
        status: event.currentStudentRegistrationStatus,
        registrationId: event.currentStudentRegistrationId,
        registeredAt: event.currentStudentRegisteredAt,
        attendanceStatus: event.currentStudentAttendanceStatus,
      }, 'Event registration status retrieved successfully');
    } catch (err) {
      next(err);
    }
  },
};

export const adminEventController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const filters = {
        status: req.query.status as string,
        event_type: req.query.eventType as string,
        search: req.query.search as string,
        upcoming: req.query.upcoming === 'true',
        past: req.query.past === 'true',
        from: req.query.from as string,
        to: req.query.to as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as string,
      };
      const result = await eventService.getAdminEvents(page, limit, filters);
      return sendPaginated(res, result.data, result.pagination, 'Admin events retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getById(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const event = await eventService.getEventDetail(eventId, undefined, 'admin');
      return sendSuccess(res, event, 'Admin event retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async create(req: any, res: Response, next: NextFunction) {
    try {
      const data = eventSchema.parse(req.body);
      const userId = req.user.id || req.user.userId;
      const event = await eventService.createEvent(data, userId);
      return res.status(201).json({
        success: true,
        data: event,
        message: 'Event created successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const data = eventSchema.partial().parse(req.body);
      const event = await eventService.updateEvent(eventId, data);
      return sendSuccess(res, event, 'Event updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async publish(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const event = await eventService.publishEvent(eventId);
      return sendSuccess(res, event, 'Event published successfully');
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const { reason } = eventCancelSchema.parse(req.body);
      const event = await eventService.cancelEvent(eventId, reason);
      return sendSuccess(res, event, 'Event cancelled successfully');
    } catch (err) {
      next(err);
    }
  },

  async complete(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const { force } = eventCompleteSchema.parse(req.body || {});
      const event = await eventService.completeEvent(eventId, force);
      return sendSuccess(res, event, 'Event marked as completed successfully');
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || (req.params as any).eventId;
      await eventService.deleteEvent(eventId);
      return res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || (req.params as any).eventId;
      const search = req.query.search as string;
      const attendees = await eventService.getRegistrations(eventId, search);
      return sendSuccess(res, attendees, 'Event attendees retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || (req.params as any).eventId;
      const attendance = await eventService.getAttendance(eventId);
      return sendSuccess(res, attendance, 'Event attendance statistics retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async markAttendance(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const { records } = markAttendanceSchema.parse(req.body);
      const userId = req.user.id || req.user.userId;
      const result = await eventService.markAttendance(eventId, records, userId);
      return sendSuccess(res, result, 'Attendance marked successfully');
    } catch (err) {
      next(err);
    }
  },

  async bulkMarkAttendance(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const { memberIds, status } = bulkAttendanceSchema.parse(req.body);
      const userId = req.user.id || req.user.userId;
      const result = await eventService.bulkMarkAttendance(eventId, memberIds, status, userId);
      return sendSuccess(res, result, 'Bulk attendance marked successfully');
    } catch (err) {
      next(err);
    }
  },

  async checkIn(req: any, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id || req.params.eventId;
      const { memberId, status } = checkInSchema.parse(req.body);
      const userId = req.user.id || req.user.userId;
      const result = await eventService.checkIn(eventId, memberId, status, userId);
      return sendSuccess(res, result, 'Student checked in successfully');
    } catch (err) {
      next(err);
    }
  },
};
