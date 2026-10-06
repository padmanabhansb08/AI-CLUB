import { Request, Response, NextFunction } from 'express';
import { courseService } from '../services/courseService';
import { sendSuccess, sendPaginated } from '../utils/response';
import {
  courseCreateSchema,
  courseUpdateSchema,
  courseModuleCreateSchema,
  courseModuleUpdateSchema,
  courseLessonCreateSchema,
  courseLessonUpdateSchema,
  lessonProgressUpdateSchema,
} from '../validators/schemas';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { auditService } from '../services/auditService';

export const courseController = {
  // Discovery & listing
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

      const result = await courseService.getCourses(
        {
          search: req.query.search as string,
          category: req.query.category as string,
          difficulty: req.query.difficulty as string,
          instructor_id: req.query.instructor_id as string,
          status: req.query.status as string,
          page,
          limit,
        },
        authReq.user
      );

      return sendPaginated(
        res,
        result.items,
        result.pagination,
        'Courses list retrieved'
      );
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const id = req.params.id as string;
      const course = await courseService.getCourse(id, authReq.user);
      return sendSuccess(res, course, 'Course details retrieved');
    } catch (err) {
      next(err);
    }
  },

  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const validated = courseCreateSchema.parse(req.body);
      const course = await courseService.createCourse(validated, req.user);
      return sendSuccess(res, course, 'Course created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const validated = courseUpdateSchema.parse(req.body);
      const course = await courseService.updateCourse(id, validated, req.user);
      return sendSuccess(res, course, 'Course updated successfully');
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      await courseService.deleteCourse(id, req.user);
      return sendSuccess(res, { id }, 'Course deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  publish: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const course = await courseService.publishCourse(id, req.user);

      auditService.logAction({
        actorId: req.user.userId || req.user.id,
        action: 'COURSE_PUBLISHED',
        entityType: 'COURSE',
        entityId: id,
        afterData: { title: course?.title, status: 'PUBLISHED' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(() => {});

      return sendSuccess(res, course, 'Course published successfully');
    } catch (err) {
      next(err);
    }
  },

  unpublish: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const course = await courseService.unpublishCourse(id, req.user);

      auditService.logAction({
        actorId: req.user.userId || req.user.id,
        action: 'COURSE_UNPUBLISHED',
        entityType: 'COURSE',
        entityId: id,
        afterData: { title: course?.title, status: 'DRAFT' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(() => {});

      return sendSuccess(res, course, 'Course unpublished successfully');
    } catch (err) {
      next(err);
    }
  },

  archive: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const course = await courseService.archiveCourse(id, req.user);

      auditService.logAction({
        actorId: req.user.userId || req.user.id,
        action: 'COURSE_ARCHIVED',
        entityType: 'COURSE',
        entityId: id,
        afterData: { title: course?.title, status: 'ARCHIVED' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(() => {});

      return sendSuccess(res, course, 'Course archived successfully');
    } catch (err) {
      next(err);
    }
  },

  // Curriculum & Modules
  getCurriculum: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const id = req.params.id as string;
      const curriculum = await courseService.getCurriculum(id, authReq.user);
      return sendSuccess(res, curriculum, 'Course curriculum retrieved');
    } catch (err) {
      next(err);
    }
  },

  createModule: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const validated = courseModuleCreateSchema.parse(req.body);
      const mod = await courseService.createModule(id, validated, req.user);
      return sendSuccess(res, mod, 'Module created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  updateModule: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const validated = courseModuleUpdateSchema.parse(req.body);
      const mod = await courseService.updateModule(id, validated, req.user);
      return sendSuccess(res, mod, 'Module updated successfully');
    } catch (err) {
      next(err);
    }
  },

  deleteModule: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      await courseService.deleteModule(id, req.user);
      return sendSuccess(res, { id }, 'Module deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  // Lessons
  createLesson: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const moduleId = req.params.moduleId as string;
      const validated = courseLessonCreateSchema.parse(req.body);
      const lesson = await courseService.createLesson(moduleId, validated, req.user);
      return sendSuccess(res, lesson, 'Lesson created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  getLesson: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const id = req.params.id as string;
      const lesson = await courseService.getLesson(id, authReq.user);
      return sendSuccess(res, lesson, 'Lesson content retrieved');
    } catch (err) {
      next(err);
    }
  },

  updateLesson: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const validated = courseLessonUpdateSchema.parse(req.body);
      const lesson = await courseService.updateLesson(id, validated, req.user);
      return sendSuccess(res, lesson, 'Lesson updated successfully');
    } catch (err) {
      next(err);
    }
  },

  deleteLesson: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      await courseService.deleteLesson(id, req.user);
      return sendSuccess(res, { id }, 'Lesson deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  // Enrollments
  enroll: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const enrollment = await courseService.enroll(id, req.user);
      return sendSuccess(res, enrollment, 'Enrolled in course successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  dropEnrollment: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      await courseService.dropEnrollment(id, req.user);
      return sendSuccess(res, { courseId: id, status: 'DROPPED' }, 'Course enrollment dropped');
    } catch (err) {
      next(err);
    }
  },

  getEnrollment: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const enrollment = await courseService.getEnrollment(id, req.user);
      return sendSuccess(res, enrollment, 'Enrollment status retrieved');
    } catch (err) {
      next(err);
    }
  },

  getMyCourses: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const list = await courseService.getMyCourses(req.user);
      return sendSuccess(res, list, 'My enrolled courses retrieved');
    } catch (err) {
      next(err);
    }
  },

  // Progress
  startLesson: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const progress = await courseService.startLesson(id, req.user);
      return sendSuccess(res, progress, 'Lesson started');
    } catch (err) {
      next(err);
    }
  },

  updateProgress: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const validated = lessonProgressUpdateSchema.parse(req.body);
      const progress = await courseService.updateProgress(id, validated, req.user);
      return sendSuccess(res, progress, 'Lesson progress updated');
    } catch (err) {
      next(err);
    }
  },

  completeLesson: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const progress = await courseService.completeLesson(id, req.user);
      return sendSuccess(res, progress, 'Lesson marked complete');
    } catch (err) {
      next(err);
    }
  },

  getCourseProgress: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const summary = await courseService.getCourseProgress(id, req.user);
      return sendSuccess(res, summary, 'Course progress retrieved');
    } catch (err) {
      next(err);
    }
  },

  getLessonProgress: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const progress = await courseService.getLessonProgress(id, req.user);
      return sendSuccess(res, progress, 'Lesson progress retrieved');
    } catch (err) {
      next(err);
    }
  },

  // Analytics
  getAnalytics: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const id = req.params.id as string;
      const analytics = await courseService.getAnalytics(id, req.user);
      return sendSuccess(res, analytics, 'Course analytics retrieved');
    } catch (err) {
      next(err);
    }
  },

  // Legacy progress adapter
  getProgress: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const list = await courseService.getMyCourses(req.user);
      return sendSuccess(res, list, 'Course progress retrieved');
    } catch (err) {
      next(err);
    }
  },
};
