import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { registerSchema, loginSchema } from '../validators/schemas';

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.register(data);
      res.status(201).json({ data: user });
    } catch (err: any) {
      next(err);
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data.email, data.password);
      res.json({ data: result });
    } catch (err: any) {
      next(err);
    }
  },
  me: async (req: any, res: Response) => {
    res.json({ data: req.user });
  },
  logout: async (req: Request, res: Response) => {
    res.json({ data: { success: true } });
  }
};