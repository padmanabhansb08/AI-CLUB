import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { pool } from '../db';

export interface AuthenticatedUser {
  userId: string;
  id: string; // compatibility alias
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'No authorization token provided',
        details: {},
      },
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    const userId = decoded.userId || decoded.id;
    if (!userId || !decoded.role) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token payload',
          details: {},
        },
      });
    }

    const current = await pool.query('SELECT role, session_version FROM users WHERE id = $1', [userId]);
    if (!current.rows[0] || (decoded.sessionVersion || 0) !== current.rows[0].session_version) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Your session has ended. Please sign in again.' } });
    }
    req.user = {
      userId,
      id: userId,
      role: current.rows[0].role,
    };
    next();
  } catch (err: any) {
    if (!['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(err.name)) return next(err);
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid authorization token',
        details: {},
      },
    });
  }
};

export const authenticateOptional = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    const userId = decoded.userId || decoded.id;
    if (userId && decoded.role) {
      const current = await pool.query('SELECT role, session_version FROM users WHERE id = $1', [userId]);
      if (current.rows[0] && (decoded.sessionVersion || 0) === current.rows[0].session_version) {
        req.user = { userId, id: userId, role: current.rows[0].role };
      }
    }
  } catch (err: any) {
    if (!['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(err.name)) return next(err);
  }
  next();
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          details: {},
        },
      });
    }

    const userRole = req.user.role.toUpperCase();
    const hasRole = allowedRoles.some((r) => r.toUpperCase() === userRole);

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access forbidden: requires ${allowedRoles.join(' or ')} privileges`,
          details: {},
        },
      });
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN', 'admin', 'SUPER_ADMIN', 'super_admin');
export const requireSuperAdmin = requireRole('SUPER_ADMIN', 'super_admin');
