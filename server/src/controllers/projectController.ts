import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/projectService';
import { AuthRequest } from '../middleware/auth';
import {
  projectSchema,
  projectUpdateSchema,
  projectMembershipRequestSchema,
  projectMembershipUpdateSchema,
  milestoneCreateSchema,
  milestoneUpdateSchema,
} from '../validators/schemas';
import { sendSuccess, sendPaginated } from '../utils/response';
import { pool } from '../db';

async function getMemberIdFromUser(userId?: string): Promise<string | undefined> {
  if (!userId) return undefined;
  const res = await pool.query('SELECT id FROM members WHERE user_id = $1', [userId]);
  return res.rows[0]?.id;
}

export const projectController = {
  getAll: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const search = req.query.search as string;
      const domain = req.query.domain as string;
      const difficulty = req.query.difficulty as string;
      const status = req.query.status as string;
      const sort = (req.query.sort as 'latest' | 'popular' | 'progress') || 'latest';

      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      const data = await projectService.getProjects({
        search,
        domain,
        difficulty,
        status,
        page,
        limit,
        sort,
        currentMemberId,
        isAdmin,
      });

      return sendPaginated(
        res,
        data.items,
        {
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages,
        },
        'Projects list retrieved'
      );
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const project = await projectService.getProjectById(id as string, currentMemberId);
      return sendSuccess(res, project, 'Project retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validated = projectSchema.parse(req.body);
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const project = await projectService.createProject(validated, currentMemberId);
      return sendSuccess(res, project, 'Project created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validated = projectUpdateSchema.parse(req.body);
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      const project = await projectService.updateProject(id as string, validated, currentMemberId, isAdmin);
      return sendSuccess(res, project, 'Project updated successfully');
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      await projectService.deleteProject(id as string, currentMemberId, isAdmin);
      return sendSuccess(res, {}, 'Project deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  publish: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const project = await projectService.publishProject(id as string);
      return sendSuccess(res, project, 'Project published successfully');
    } catch (err) {
      next(err);
    }
  },

  // Project Memberships
  requestJoin: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id: projectId } = req.params;
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      if (!currentMemberId) {
        return res.status(404).json({ success: false, error: { message: 'Member profile not found' } });
      }

      const body = projectMembershipRequestSchema.parse(req.body || {});
      const membership = await projectService.requestJoinProject(
        projectId as string,
        currentMemberId,
        body.role,
        body.message
      );
      return sendSuccess(res, membership, 'Join request submitted successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  leave: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id: projectId } = req.params;
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      if (!currentMemberId) {
        return res.status(404).json({ success: false, error: { message: 'Member profile not found' } });
      }

      const result = await projectService.leaveProject(projectId as string, currentMemberId);
      return sendSuccess(res, result, 'Successfully left the project');
    } catch (err) {
      next(err);
    }
  },

  getMembers: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id: projectId } = req.params;
      const status = req.query.status as string;
      const members = await projectService.getProjectMembers(projectId as string, status);
      return sendSuccess(res, members, 'Project members retrieved');
    } catch (err) {
      next(err);
    }
  },

  updateMembership: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id: projectId, memberId } = req.params;
      const body = projectMembershipUpdateSchema.parse(req.body);
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      const updated = await projectService.updateProjectMembership(
        projectId as string,
        memberId as string,
        body,
        currentMemberId,
        isAdmin
      );
      return sendSuccess(res, updated, 'Member updated successfully');
    } catch (err) {
      next(err);
    }
  },

  removeMember: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id: projectId, memberId } = req.params;
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      await projectService.removeProjectMember(
        projectId as string,
        memberId as string,
        currentMemberId,
        isAdmin
      );
      return sendSuccess(res, {}, 'Member removed successfully');
    } catch (err) {
      next(err);
    }
  },

  getMyProjects: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      if (!currentMemberId) {
        return sendSuccess(res, [], 'My projects retrieved');
      }

      const myProjects = await projectService.getMyProjects(currentMemberId);
      return sendSuccess(res, myProjects, 'My projects retrieved');
    } catch (err) {
      next(err);
    }
  },

  // Milestones
  getMilestones: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: projectId } = req.params;
      const milestones = await projectService.getMilestones(projectId as string);
      return sendSuccess(res, milestones, 'Project milestones retrieved');
    } catch (err) {
      next(err);
    }
  },

  createMilestone: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id: projectId } = req.params;
      const body = milestoneCreateSchema.parse(req.body);
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      const milestone = await projectService.createMilestone(
        projectId as string,
        body,
        currentMemberId,
        isAdmin
      );
      return sendSuccess(res, milestone, 'Milestone created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  updateMilestone: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { milestoneId } = req.params;
      const body = milestoneUpdateSchema.parse(req.body);
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      const milestone = await projectService.updateMilestone(
        milestoneId as string,
        body,
        currentMemberId,
        isAdmin
      );
      return sendSuccess(res, milestone, 'Milestone updated successfully');
    } catch (err) {
      next(err);
    }
  },

  deleteMilestone: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { milestoneId } = req.params;
      const currentMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      await projectService.deleteMilestone(milestoneId as string, currentMemberId, isAdmin);
      return sendSuccess(res, {}, 'Milestone deleted successfully');
    } catch (err) {
      next(err);
    }
  },
};
