import { Request, Response, NextFunction } from 'express';
import { contentService } from '../services/contentService';
import { achievementSchema, updateSchema, projectSchema, courseSchema } from '../validators/schemas';

const handleCrud = (repo: any, schema: any) => ({
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await repo.getAll(page, limit);
      res.json({
        data: data.items,
        pagination: {
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: Math.ceil(data.total / data.limit)
        }
      });
    } catch (err: any) {
      next(err);
    }
  },
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await repo.getById(req.params.id);
      if (!data) return res.status(404).json({ error: { message: 'Not found' } });
      res.json({ data });
    } catch (err: any) {
      next(err);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      const data = await repo.create(validated);
      res.status(201).json({ data });
    } catch (err: any) {
      next(err);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.partial().parse(req.body);
      const data = await repo.update(req.params.id, validated);
      res.json({ data });
    } catch (err: any) {
      next(err);
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await repo.delete(req.params.id);
      res.status(204).send();
    } catch (err: any) {
      next(err);
    }
  }
});

export const achievementController = handleCrud({
  getAll: contentService.getAchievements,
  getById: contentService.getAchievementById,
  create: contentService.createAchievement,
  update: contentService.updateAchievement,
  delete: contentService.deleteAchievement
}, achievementSchema);

export const updateController = handleCrud({
  getAll: contentService.getUpdates,
  getById: contentService.getUpdateById,
  create: contentService.createUpdate,
  update: contentService.updateUpdate,
  delete: contentService.deleteUpdate
}, updateSchema);

export const projectController = {
  ...handleCrud({
    getAll: contentService.getProjects,
    getById: contentService.getProjectById,
    create: contentService.createProject,
    update: contentService.updateProject,
    delete: contentService.deleteProject
  }, projectSchema),
  addInterest: async (req: any, res: Response, next: NextFunction) => {
    try {
      await contentService.addProjectInterest(req.user.id, req.params.id);
      res.status(201).json({ success: true });
    } catch (err: any) {
      next(err);
    }
  },
  removeInterest: async (req: any, res: Response, next: NextFunction) => {
    try {
      await contentService.removeProjectInterest(req.user.id, req.params.id);
      res.status(204).send();
    } catch (err: any) {
      next(err);
    }
  }
};

export const courseController = {
  ...handleCrud({
    getAll: contentService.getCourses,
    getById: contentService.getCourseById,
    create: contentService.createCourse,
    update: contentService.updateCourse,
    delete: contentService.deleteCourse
  }, courseSchema),
  getProgress: async (req: any, res: Response, next: NextFunction) => {
    try {
      const data = await contentService.getCourseProgressByUserId(req.user.id);
      res.json({ data });
    } catch (err: any) {
      next(err);
    }
  }
};

export const memberController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await contentService.getMembers(
        (req.query.search as string) || undefined, 
        (req.query.department as string) || undefined, 
        page, 
        limit
      );
      res.json({
        data: data.items,
        pagination: {
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: Math.ceil(data.total / data.limit)
        }
      });
    } catch (err: any) {
      next(err);
    }
  },
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await contentService.getMemberById(req.params.id as string);
      if (!data) return res.status(404).json({ error: { message: 'Not found' } });
      res.json({ data });
    } catch (err: any) {
      next(err);
    }
  }
};