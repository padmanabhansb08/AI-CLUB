import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T = any>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendPaginated<T = any>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message = 'Operation successful',
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination,
    message,
  });
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details: any = {}
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}
