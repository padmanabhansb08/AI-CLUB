import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/eventService';
import { eventSchema } from '../validators/schemas';

export const publicEventController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        event_type: req.query.eventType as string,
        search: req.query.search as string,
        upcoming: req.query.upcoming === 'true',
        past: req.query.past === 'true'
      };
      const result = await eventService.getPublicEvents(page, limit, filters);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: any, res: Response, next: NextFunction) {
    try {
      // req.user might be populated if authenticate middleware is used loosely or not at all.
      // We need a way to pass userId if authenticated. If public, userId is undefined.
      const userId = req.user?.id;
      const event = await eventService.getEventDetail(req.params.id, userId);
      // Verify published for public
      if (event.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
      }
      res.json({ data: event });
    } catch (err) {
      next(err);
    }
  }
};

export const studentEventController = {
  async register(req: any, res: Response, next: NextFunction) {
    try {
      const result = await eventService.register(req.params.id, req.user.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async unregister(req: any, res: Response, next: NextFunction) {
    try {
      const result = await eventService.unregister(req.params.id, req.user.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getMyRegistrations(req: any, res: Response, next: NextFunction) {
    try {
      const result = await eventService.getMyRegistrations(req.user.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
};

export const adminEventController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        status: req.query.status as string,
        event_type: req.query.eventType as string,
        search: req.query.search as string,
        upcoming: req.query.upcoming === 'true',
        past: req.query.past === 'true'
      };
      const result = await eventService.getAdminEvents(page, limit, filters);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: any, res: Response, next: NextFunction) {
    try {
      const event = await eventService.getEventDetail(req.params.id);
      res.json({ data: event });
    } catch (err) {
      next(err);
    }
  },

  async create(req: any, res: Response, next: NextFunction) {
    try {
      const data = eventSchema.parse(req.body);
      const event = await eventService.createEvent(data, req.user.id);
      res.status(201).json({ data: event });
    } catch (err) {
      next(err);
    }
  },

  async update(req: any, res: Response, next: NextFunction) {
    try {
      // Partial validation for PATCH
      const data = eventSchema.partial().parse(req.body);
      const event = await eventService.updateEvent(req.params.id, data);
      res.json({ data: event });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await eventService.deleteEvent(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eventService.getRegistrations(req.params.id as string);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
};
