import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { registerSchema, loginSchema } from '../validators/schemas';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      return sendSuccess(res, result, 'User registered successfully', 201);
    } catch (err: any) {
      next(err);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data.email, data.password);
      return sendSuccess(res, result, 'Login successful');
    } catch (err: any) {
      next(err);
    }
  },

  me: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const user = await authService.getMe(userId!);
      return sendSuccess(res, user, 'Authenticated user context retrieved');
    } catch (err: any) {
      next(err);
    }
  },

  logout: async (req: Request, res: Response) => {
    return sendSuccess(res, {}, 'Logged out successfully');
  },
};