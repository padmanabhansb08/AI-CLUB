import { Response, NextFunction } from 'express';
import { assessmentService } from '../services/assessmentService';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { BadRequestError } from '../errors/AppError';

export const assessmentController = {
  // Start assessment attempt
  startAssessment: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const { applicationId } = req.body;
      if (!applicationId) {
        throw new BadRequestError('applicationId is required in request body');
      }

      const result = await assessmentService.startAssessment(userId!, applicationId);
      return sendSuccess(res, result, 'Assessment started successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  // Get active assessment attempt with questions (NO answer keys)
  getAssessment: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const attemptId = req.params.attemptId as string;

      const result = await assessmentService.getAssessment(attemptId, userId!);
      return sendSuccess(res, result, 'Assessment retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  // Auto-save student's answer
  saveAnswer: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const attemptId = req.params.attemptId as string;
      const questionId = req.params.questionId as string;
      const { selectedOption } = req.body;

      if (!selectedOption) {
        throw new BadRequestError('selectedOption is required');
      }

      const result = await assessmentService.saveAnswer(attemptId, questionId, selectedOption, userId!);
      return sendSuccess(res, result, 'Answer saved successfully');
    } catch (err) {
      next(err);
    }
  },

  // Submit assessment and calculate score server-side
  submitAssessment: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const attemptId = req.params.attemptId as string;

      const result = await assessmentService.submitAssessment(attemptId, userId!);
      return sendSuccess(res, result, 'Assessment submitted and evaluated successfully');
    } catch (err) {
      next(err);
    }
  },
};
