import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../errors/AppError';
import { config } from '../config';

// Compatibility alias for existing codebase
export class ApiError extends AppError {
  constructor(code: string, message: string, status = 400, details: any = {}) {
    super(status, code, message, details);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedDetails = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details: formattedDetails,
      },
    });
  }

  // 2. Typed Application Error (AppError and subclasses)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || {},
      },
    });
  }

  // 3. PostgreSQL Unique Constraint Violation
  if (err.code === '23505') {
    let message = 'Resource already exists';
    let code = 'CONFLICT';

    if (
      err.table === 'event_registrations' ||
      err.constraint?.includes('event_registrations') ||
      err.detail?.includes('event_registrations') ||
      (err.detail?.includes('event_id') && err.detail?.includes('member_id'))
    ) {
      code = 'ALREADY_REGISTERED';
      message = 'You are already registered for this event';
    } else if (err.detail?.includes('email')) {
      message = 'An account with this email already exists';
    } else if (err.detail?.includes('register_number')) {
      message = 'An account with this register number already exists';
    } else if (err.detail?.includes('college_email')) {
      message = 'An account with this college email already exists';
    }

    return res.status(409).json({
      success: false,
      error: {
        code,
        message,
        details: {},
      },
    });
  }

  // 4. PostgreSQL Foreign Key Constraint Violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Referenced resource does not exist',
        details: {},
      },
    });
  }

  // 5. Common Auth String Errors
  if (err.message === 'Invalid credentials') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
        details: {},
      },
    });
  }

  // 6. Generic/Legacy errors with status property
  if (typeof err.status === 'number') {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code || 'API_ERROR',
        message: err.message || 'An error occurred',
        details: err.details || {},
      },
    });
  }

  // 7. Unknown Internal Errors
  if (config.NODE_ENV !== 'test') {
    console.error('[Unhandled Error]', {
      name: err.name,
      message: err.message,
      stack: config.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred',
      details: {},
    },
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.path}`,
      details: {},
    },
  });
};
