import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: any[];
  constructor(code: string, message: string, status = 400, details?: any[]) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.issues
      }
    });
  }

  // Handle expected application errors
  if (err.status) {
    return res.status(err.status).json({
      error: {
        code: err.code || 'API_ERROR',
        message: err.message || 'An error occurred',
        details: err.details || []
      }
    });
  }

  // Handle postgresql unique constraint error
  if (err.code === '23505') {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Resource already exists'
      }
    });
  }

  // Handle postgresql foreign key constraint error
  if (err.code === '23503') {
    return res.status(400).json({
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Referenced record does not exist'
      }
    });
  }
  
  if (err.message === 'Invalid credentials') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials'
      }
    });
  }

  // Unknown error
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: []
    }
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
};
