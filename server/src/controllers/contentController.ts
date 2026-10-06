import { Request, Response, NextFunction } from 'express';
import { contentService } from '../services/contentService';
import { achievementSchema, updateSchema, projectSchema, courseSchema } from '../validators/schemas';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError } from '../errors/AppError';
import { AuthRequest } from '../middleware/auth';

const handleCrud = (repo: any, schema: any, resourceName = 'Resource') => ({
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const data = await repo.getAll(page, limit);
      return sendPaginated(
        res,
        data.items,
        {
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: Math.ceil(data.total / data.limit) || 1,
        },
        `${resourceName} list retrieved`
      );
    } catch (err: any) {
      next(err);
    }
  },
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await repo.getById(req.params.id);
      if (!data) {
        throw new NotFoundError(`${resourceName} with ID '${req.params.id}' not found`);
      }
      return sendSuccess(res, data, `${resourceName} retrieved`);
    } catch (err: any) {
      next(err);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      const data = await repo.create(validated);
      return sendSuccess(res, data, `${resourceName} created successfully`, 201);
    } catch (err: any) {
      next(err);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.partial().parse(req.body);
      const data = await repo.update(req.params.id, validated);
      if (!data) {
        throw new NotFoundError(`${resourceName} with ID '${req.params.id}' not found`);
      }
      return sendSuccess(res, data, `${resourceName} updated successfully`);
    } catch (err: any) {
      next(err);
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await repo.delete(req.params.id);
      return sendSuccess(res, {}, `${resourceName} deleted successfully`);
    } catch (err: any) {
      next(err);
    }
  },
});

export const achievementController = handleCrud(
  {
    getAll: contentService.getAchievements,
    getById: contentService.getAchievementById,
    create: contentService.createAchievement,
    update: contentService.updateAchievement,
    delete: contentService.deleteAchievement,
  },
  achievementSchema,
  'Achievement'
);

export const updateController = handleCrud(
  {
    getAll: contentService.getUpdates,
    getById: contentService.getUpdateById,
    create: contentService.createUpdate,
    update: contentService.updateUpdate,
    delete: contentService.deleteUpdate,
  },
  updateSchema,
  'Update'
);

export const projectController = {
  ...handleCrud(
    {
      getAll: contentService.getProjects,
      getById: contentService.getProjectById,
      create: contentService.createProject,
      update: contentService.updateProject,
      delete: contentService.deleteProject,
    },
    projectSchema,
    'Project'
  ),
  addInterest: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const projectId = req.params.id as string;
      await contentService.addProjectInterest(userId!, projectId);
      return sendSuccess(res, {}, 'Project interest registered', 201);
    } catch (err: any) {
      next(err);
    }
  },
  removeInterest: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const projectId = req.params.id as string;
      await contentService.removeProjectInterest(userId!, projectId);
      return sendSuccess(res, {}, 'Project interest removed');
    } catch (err: any) {
      next(err);
    }
  },
};

export const courseController = {
  ...handleCrud(
    {
      getAll: contentService.getCourses,
      getById: contentService.getCourseById,
      create: contentService.createCourse,
      update: contentService.updateCourse,
      delete: contentService.deleteCourse,
    },
    courseSchema,
    'Course'
  ),
  getProgress: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const data = await contentService.getCourseProgressByUserId(userId!);
      return sendSuccess(res, data, 'Course progress retrieved');
    } catch (err: any) {
      next(err);
    }
  },
};

export const memberController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const data = await contentService.getMembers(
        (req.query.search as string) || undefined,
        (req.query.department as string) || undefined,
        page,
        limit
      );
      return sendPaginated(
        res,
        data.items,
        {
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: Math.ceil(data.total / data.limit) || 1,
        },
        'Members list retrieved'
      );
    } catch (err: any) {
      next(err);
    }
  },
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await contentService.getMemberById(req.params.id as string);
      if (!data) {
        throw new NotFoundError(`Member with ID '${req.params.id}' not found`);
      }
      return sendSuccess(res, data, 'Member profile retrieved');
    } catch (err: any) {
      next(err);
    }
  },
};