import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { studentService } from '../services/studentService';
import { AIRecommendationService } from '../services/ai/aiRecommendationService';
import { AISkillAnalysisService } from '../services/ai/aiSkillAnalysisService';
import { AIAssistantService } from '../services/ai/aiAssistantService';
import { AIInsightService } from '../services/ai/aiInsightService';
import { AIPreferencesService } from '../services/ai/aiPreferencesService';
import { AISearchService } from '../services/ai/aiSearchService';
import { AIUsageService } from '../services/ai/aiUsageService';
import { config } from '../config';

const getMemberId = async (req: AuthRequest): Promise<string> => {
  const userId = req.user?.userId || req.user?.id;
  if (!userId) {
    throw new Error('Authentication required');
  }
  const member = await studentService.getMemberByUserId(userId);
  return member.id;
};

export const aiController = {
  // Safe status endpoint
  getStatus: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, {
        enabled: config.AI_ENABLED,
        recommendationsAvailable: config.AI_RECOMMENDATIONS_ENABLED,
        assistantAvailable: config.AI_ASSISTANT_ENABLED,
        skillAnalysisAvailable: config.AI_SKILL_ANALYSIS_ENABLED,
        adminInsightsAvailable: config.AI_ADMIN_INSIGHTS_ENABLED,
      }, 'AI status retrieved');
    } catch (err) {
      next(err);
    }
  },

  // Personalized Recommendations
  getRecommendations: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const [courses, events, projects] = await Promise.all([
        AIRecommendationService.getCourseRecommendations(memberId, 3),
        AIRecommendationService.getEventRecommendations(memberId, 3),
        AIRecommendationService.getProjectRecommendations(memberId, 3),
      ]);
      return sendSuccess(res, { courses, events, projects }, 'Personalized recommendations retrieved');
    } catch (err) {
      next(err);
    }
  },

  getCourseRecommendations: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const limit = parseInt(req.query.limit as string, 10) || 5;
      const courses = await AIRecommendationService.getCourseRecommendations(memberId, limit);
      return sendSuccess(res, courses, 'Course recommendations retrieved');
    } catch (err) {
      next(err);
    }
  },

  getEventRecommendations: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const limit = parseInt(req.query.limit as string, 10) || 5;
      const events = await AIRecommendationService.getEventRecommendations(memberId, limit);
      return sendSuccess(res, events, 'Event recommendations retrieved');
    } catch (err) {
      next(err);
    }
  },

  getProjectRecommendations: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const limit = parseInt(req.query.limit as string, 10) || 5;
      const projects = await AIRecommendationService.getProjectRecommendations(memberId, limit);
      return sendSuccess(res, projects, 'Project recommendations retrieved');
    } catch (err) {
      next(err);
    }
  },

  // Skill Gap Analysis
  getSkillGaps: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const target = (req.query.target as string) || 'Generative AI Developer';
      const result = await AISkillAnalysisService.analyzeSkillGap(memberId, target);
      return sendSuccess(res, result, 'Skill gap analysis retrieved');
    } catch (err) {
      next(err);
    }
  },

  analyzeSkills: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const target = req.body?.target || 'Generative AI Developer';
      const result = await AISkillAnalysisService.analyzeSkillGap(memberId, target);
      return sendSuccess(res, result, 'Skill analysis completed');
    } catch (err) {
      next(err);
    }
  },

  // Learning Path
  generateLearningPath: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const goal = req.body?.goal || 'Generative AI Developer';
      const path = await AISkillAnalysisService.generateLearningPath(memberId, goal);
      return sendSuccess(res, path, 'Learning path generated');
    } catch (err) {
      next(err);
    }
  },

  // AI Club Assistant
  chat: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const { message, conversationId } = req.body;
      const result = await AIAssistantService.chat(memberId, message, conversationId);
      return sendSuccess(res, result, 'AI assistant response generated');
    } catch (err) {
      next(err);
    }
  },

  listConversations: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const conversations = await AIAssistantService.listConversations(memberId);
      return sendSuccess(res, conversations, 'AI conversations retrieved');
    } catch (err) {
      next(err);
    }
  },

  getConversation: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const conversationId = req.params.id as string;
      const messages = await AIAssistantService.getConversationMessages(memberId, conversationId);
      return sendSuccess(res, messages, 'Conversation messages retrieved');
    } catch (err) {
      next(err);
    }
  },

  deleteConversation: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const conversationId = req.params.id as string;
      const deleted = await AIAssistantService.deleteConversation(memberId, conversationId);
      return sendSuccess(res, { deleted }, 'Conversation deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  // Dashboard Insights
  getInsights: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const insights = await AIInsightService.getStudentDashboardInsights(memberId);
      return sendSuccess(res, insights, 'Personalized AI insights retrieved');
    } catch (err) {
      next(err);
    }
  },

  // AI Preferences
  getPreferences: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const prefs = await AIPreferencesService.getPreferences(memberId);
      return sendSuccess(res, prefs, 'AI preferences retrieved');
    } catch (err) {
      next(err);
    }
  },

  updatePreferences: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberId = await getMemberId(req);
      const updated = await AIPreferencesService.updatePreferences(memberId, req.body);
      return sendSuccess(res, updated, 'AI preferences updated');
    } catch (err) {
      next(err);
    }
  },

  // Grounded Multi-Domain Search
  search: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query = (req.query.q as string) || '';
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const results = await AISearchService.search(query, limit);
      return sendSuccess(res, results, 'Search results retrieved');
    } catch (err) {
      next(err);
    }
  },

  // Admin AI Insights & Telemetry
  getAdminInsights: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const insights = await AIInsightService.getAdminAIInsights();
      return sendSuccess(res, insights, 'Admin AI insights retrieved');
    } catch (err) {
      next(err);
    }
  },

  getAdminTelemetry: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const telemetry = await AIUsageService.getAdminTelemetry();
      return sendSuccess(res, telemetry, 'AI telemetry data retrieved');
    } catch (err) {
      next(err);
    }
  },
};
