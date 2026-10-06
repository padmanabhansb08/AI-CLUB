import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Augment Express Request interface with correlation ID
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Production Request Correlation Middleware.
 * Generates or propagates an X-Request-Id header for distributed tracing and observability.
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const incomingId = req.headers['x-request-id'];
  const id = typeof incomingId === 'string' && incomingId.trim().length > 0
    ? incomingId.trim()
    : randomUUID();

  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};
