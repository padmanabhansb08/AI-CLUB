import { apiClient } from './client';
import type {
  AIStatus,
  AllRecommendations,
  CourseRecommendation,
  EventRecommendation,
  ProjectRecommendation,
  SkillGapAnalysisResult,
  LearningPathResult,
  AIChatSource,
  AIChatMessage,
  AIConversationSummary,
  StudentDashboardInsights,
  AdminAIInsights,
  AdminAIAnalytics,
  AIPreferences,
  AISearchResultItem,
} from '../types/ai';

export const aiApi = {
  // 1. Status & Public Configuration
  getStatus: async (): Promise<AIStatus> => {
    return apiClient.get<AIStatus>('/api/ai/status');
  },

  // 2. Recommendations
  getRecommendations: async (): Promise<AllRecommendations> => {
    return apiClient.get<AllRecommendations>('/api/ai/recommendations');
  },

  getCourseRecommendations: async (limit = 5): Promise<CourseRecommendation[]> => {
    return apiClient.get<CourseRecommendation[]>(`/api/ai/recommendations/courses?limit=${limit}`);
  },

  getEventRecommendations: async (limit = 5): Promise<EventRecommendation[]> => {
    return apiClient.get<EventRecommendation[]>(`/api/ai/recommendations/events?limit=${limit}`);
  },

  getProjectRecommendations: async (limit = 5): Promise<ProjectRecommendation[]> => {
    return apiClient.get<ProjectRecommendation[]>(`/api/ai/recommendations/projects?limit=${limit}`);
  },

  // 3. Skill Gap Analysis & Learning Paths
  getSkillGaps: async (target = 'Generative AI Developer'): Promise<SkillGapAnalysisResult> => {
    return apiClient.get<SkillGapAnalysisResult>(`/api/ai/skills/gaps?target=${encodeURIComponent(target)}`);
  },

  analyzeSkillGap: async (target: string): Promise<SkillGapAnalysisResult> => {
    return apiClient.post<SkillGapAnalysisResult>('/api/ai/skills/analyze', { target });
  },

  generateLearningPath: async (goal: string): Promise<LearningPathResult> => {
    return apiClient.post<LearningPathResult>('/api/ai/learning-path', { goal });
  },

  // 4. AI Club Assistant Chat
  chat: async (
    message: string,
    conversationId?: string
  ): Promise<{ message: string; sources: AIChatSource[]; conversationId: string }> => {
    return apiClient.post<{ message: string; sources: AIChatSource[]; conversationId: string }>(
      '/api/ai/assistant/chat',
      { message, conversationId }
    );
  },

  getConversations: async (): Promise<AIConversationSummary[]> => {
    return apiClient.get<AIConversationSummary[]>('/api/ai/assistant/conversations');
  },

  getConversationMessages: async (id: string): Promise<AIChatMessage[]> => {
    return apiClient.get<AIChatMessage[]>(`/api/ai/assistant/conversations/${id}`);
  },

  deleteConversation: async (id: string): Promise<{ deleted: boolean }> => {
    return apiClient.delete<{ deleted: boolean }>(`/api/ai/assistant/conversations/${id}`);
  },

  // 5. Dashboard Insights & Next Best Action
  getInsights: async (): Promise<StudentDashboardInsights> => {
    return apiClient.get<StudentDashboardInsights>('/api/ai/insights');
  },

  // 6. Preferences & Opt-In Controls
  getPreferences: async (): Promise<AIPreferences> => {
    return apiClient.get<AIPreferences>('/api/ai/preferences');
  },

  updatePreferences: async (preferences: Partial<AIPreferences>): Promise<AIPreferences> => {
    return apiClient.put<AIPreferences>('/api/ai/preferences', preferences);
  },

  // 7. Grounded Search
  search: async (q: string): Promise<AISearchResultItem[]> => {
    return apiClient.get<AISearchResultItem[]>(`/api/ai/search?q=${encodeURIComponent(q)}`);
  },

  // 8. Admin AI Analytics & Insights
  getAdminInsights: async (): Promise<AdminAIInsights> => {
    return apiClient.get<AdminAIInsights>('/api/ai/admin/insights');
  },

  getAdminAnalytics: async (): Promise<AdminAIAnalytics> => {
    return apiClient.get<AdminAIAnalytics>('/api/ai/admin/analytics');
  },
};
