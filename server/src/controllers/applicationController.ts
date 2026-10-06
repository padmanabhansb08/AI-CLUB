import { Response, NextFunction } from 'express';
import { applicationService } from '../services/applicationService';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { BadRequestError } from '../errors/AppError';

export const applicationController = {
  // Student: Get current application status
  getMyApplication: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const result = await applicationService.getMyApplication(userId!);
      return sendSuccess(res, result, 'Application retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  // Student: Update profile / Complete application details
  updateProfile: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const {
        fullName,
        registerNumber,
        department,
        classSection,
        year,
        collegeEmail,
        phone,
        bio,
        skills,
        technicalInterests,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
      } = req.body;

      if (!fullName || !registerNumber || !department || !classSection || !year || !collegeEmail) {
        throw new BadRequestError('Required student profile fields are missing');
      }

      const result = await applicationService.updateStudentProfile(userId!, {
        fullName,
        registerNumber,
        department,
        classSection,
        year: Number(year),
        collegeEmail,
        phone,
        bio,
        skills,
        technicalInterests,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
      });

      return sendSuccess(res, result, 'Student profile updated successfully');
    } catch (err) {
      next(err);
    }
  },

  // Admin: List all applications with pagination and filters
  listApplications: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { search, status, passed, department, year, minScore, maxScore, sortBy, sortOrder, page, limit } =
        req.query;

      const result = await applicationService.listApplications({
        search: search as string,
        status: status as string,
        passed: passed as string,
        department: department as string,
        year: year ? Number(year) : undefined,
        minScore: minScore !== undefined ? Number(minScore) : undefined,
        maxScore: maxScore !== undefined ? Number(maxScore) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as any,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      return sendSuccess(res, result, 'Applications listed successfully');
    } catch (err) {
      next(err);
    }
  },

  // Admin: Get single application detail
  getApplicationById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const result = await applicationService.getApplicationById(id);
      return sendSuccess(res, result, 'Application details retrieved');
    } catch (err) {
      next(err);
    }
  },

  // Admin: Review application (Approve, Waitlist, Reject)
  reviewApplication: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.userId || req.user?.id;
      const id = req.params.id as string;
      const { decision, notes, rejectionReason } = req.body;

      if (!decision) {
        throw new BadRequestError('Decision is required (APPROVED, WAITLISTED, or REJECTED)');
      }

      const result = await applicationService.reviewApplication(
        id,
        adminId!,
        decision,
        notes,
        rejectionReason
      );

      return sendSuccess(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },

  // Admin: Selection Analytics
  getAnalytics: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await applicationService.getAnalytics();
      return sendSuccess(res, result, 'Selection analytics retrieved');
    } catch (err) {
      next(err);
    }
  },

  // Admin: Summary counts
  getCounts: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await applicationService.getCounts();
      return sendSuccess(res, result, 'Application counts retrieved');
    } catch (err) {
      next(err);
    }
  },
};
