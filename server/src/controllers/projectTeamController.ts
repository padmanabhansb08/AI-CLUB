import { Request, Response, NextFunction } from 'express';
import { projectTeamService } from '../services/projectTeamService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler';
import { pool } from '../db';

const createTeamSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  maxMembers: z.number().min(2).max(50).optional()
});

export const projectTeamController = {
  async getProjectTeams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: projectId } = req.params;

      let memberId;
      if (req.user && req.user.role === 'student') {
        const memberRes = await pool.query('SELECT id FROM members WHERE user_id = $1', [req.user.id]);
        if ((memberRes.rowCount ?? 0) > 0) {
          memberId = memberRes.rows[0].id;
        }
      }

      const teams = await projectTeamService.getProjectTeams(projectId as string, memberId);
      res.json({ data: teams });
    } catch (e) {
      next(e);
    }
  },

  async createTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: projectId } = req.params;
      const data = createTeamSchema.parse(req.body);

      console.log('req.user =', req.user);
      const memberRes = await pool.query('SELECT id FROM members WHERE user_id = $1', [req.user?.id]);
      if ((memberRes.rowCount ?? 0) === 0) {
        throw new ApiError('NOT_FOUND', 'Member profile not found');
      }
      const memberId = memberRes.rows[0].id;

      const team = await projectTeamService.createTeam({ projectId: projectId as string, ...data }, memberId);
      res.status(201).json({ data: team });
    } catch (e) {
      next(e);
    }
  },

  async joinTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: teamId } = req.params;

      const memberRes = await pool.query('SELECT id FROM members WHERE user_id = $1', [req.user!.id]);
      if ((memberRes.rowCount ?? 0) === 0) {
        throw new ApiError('NOT_FOUND', 'Member profile not found');
      }
      const memberId = memberRes.rows[0].id;

      const result = await projectTeamService.joinTeam(teamId as string, memberId);
      res.json({ data: result });
    } catch (e) {
      next(e);
    }
  },

  async leaveTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: teamId } = req.params;

      const memberRes = await pool.query('SELECT id FROM members WHERE user_id = $1', [req.user!.id]);
      if ((memberRes.rowCount ?? 0) === 0) {
        throw new ApiError('NOT_FOUND', 'Member profile not found');
      }
      const memberId = memberRes.rows[0].id;

      const result = await projectTeamService.leaveTeam(teamId as string, memberId);
      res.json({ data: result });
    } catch (e) {
      next(e);
    }
  },

  async getMyTeams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const memberRes = await pool.query('SELECT id FROM members WHERE user_id = $1', [req.user!.id]);
      if ((memberRes.rowCount ?? 0) === 0) {
        throw new ApiError('NOT_FOUND', 'Member profile not found');
      }
      const memberId = memberRes.rows[0].id;

      const teams = await projectTeamService.getMyTeams(memberId);
      res.json({ data: teams });
    } catch (e) {
      next(e);
    }
  },

  async getAdminProjectTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: projectId } = req.params;
      const teams = await projectTeamService.getProjectTeams(projectId as string);
      res.json({ data: teams });
    } catch (e) {
      next(e);
    }
  }
};
