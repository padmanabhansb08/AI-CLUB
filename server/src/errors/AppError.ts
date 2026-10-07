export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: any;
  public readonly isOperational: boolean;

  constructor(statusCode: number, code: string, message: string, details: any = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details: any = {}) {
    super(400, 'BAD_REQUEST', message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details: any = {}) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', details: any = {}) {
    super(401, 'UNAUTHORIZED', message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details: any = {}) {
    super(403, 'FORBIDDEN', message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details: any = {}) {
    super(404, 'NOT_FOUND', message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details: any = {}) {
    super(409, 'CONFLICT', message, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded, please try again later', details: any = {}) {
    super(429, 'RATE_LIMIT_EXCEEDED', message, details);
  }
}
