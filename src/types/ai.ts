export type RecommendationStrength = 'STRONG_MATCH' | 'GOOD_MATCH' | 'GROWTH_OPPORTUNITY';

export interface AIStatus {
  enabled: boolean;
  assistantAvailable: boolean;
  recommendationsAvailable: boolean;
  skillAnalysisAvailable: boolean;
  adminInsightsAvailable: boolean;
  provider: string;
}

export interface CourseRecommendation {
  courseId: string;
  title: string;
  category: string;
  difficulty: string;
  score: number;
  matchStrength: RecommendationStrength;
  reasons: string[];
  thumbnailUrl?: string;
}

export interface EventRecommendation {
  eventId: string;
  title: string;
  eventType: string;
  startAt: string;
  location?: string;
  score: number;
  matchStrength: RecommendationStrength;
  reasons: string[];
}

export interface ProjectRecommendation {
  projectId: string;
  title: string;
  category?: string;
  difficulty?: string;
  score: number;
  matchStrength: RecommendationStrength;
  reasons: string[];
}

export interface AllRecommendations {
  courses: CourseRecommendation[];
  events: EventRecommendation[];
  projects: ProjectRecommendation[];
}

export interface SkillGapAnalysisResult {
  target: string;
  currentSkills: string[];
  developingSkills: string[];
  missingSkills: string[];
  recommendedCourses: Array<{
    courseId: string;
    title: string;
    coversSkills: string[];
  }>;
  summary: string;
}

export interface LearningPathStep {
  step: number;
  title: string;
  description: string;
  courseId?: string;
  courseTitle?: string;
  targetSkills: string[];
}

export interface LearningPathResult {
  goal: string;
  targetRole: string;
  totalSteps: number;
  steps: LearningPathStep[];
  estimatedDurationWeeks: number;
}

export interface AIChatSource {
  type: 'COURSE' | 'EVENT' | 'PROJECT' | 'DOCUMENTATION';
  id: string;
  title: string;
  url?: string;
}

export interface AIChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: AIChatSource[];
  createdAt?: string;
}

export interface AIConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDashboardInsights {
  recommendedCourses: CourseRecommendation[];
  recommendedEvents: EventRecommendation[];
  recommendedProjects: ProjectRecommendation[];
  nextBestAction: string;
  skillSummary: string;
  weeklyHighlights: string[];
}

export interface AdminAIInsights {
  executiveSummary: string;
  observations: string[];
  areasToInvestigate: string[];
  generatedAt: string;
  telemetry: {
    totalRequests: number;
    avgLatencyMs: number;
    errorRatePct: number;
  };
}

export interface AdminAIAnalytics {
  totalRequests: number;
  successRatePct: number;
  avgLatencyMs: number;
  estimatedTotalCost: number;
  byFeature: Array<{
    feature: string;
    count: number;
    avgLatencyMs: number;
  }>;
}

export interface AIPreferences {
  memberId: string;
  recommendationsEnabled: boolean;
  assistantEnabled: boolean;
  learningInsightsEnabled: boolean;
  weeklySummaryEnabled: boolean;
  updatedAt: string;
}

export interface AISearchResultItem {
  type: 'COURSE' | 'EVENT' | 'PROJECT';
  id: string;
  title: string;
  snippet: string;
  category?: string;
  url: string;
  score: number;
}
