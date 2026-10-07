export type AIProviderType = 'mock' | 'local' | 'openai' | 'anthropic';

export type RecommendationStrength = 'STRONG_MATCH' | 'GOOD_MATCH' | 'GROWTH_OPPORTUNITY';

export interface AIGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  systemPrompt?: string;
}

export interface AITextResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  provider: string;
  model: string;
}

export interface AIStructuredResponse<T> {
  data: T;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  provider: string;
  model: string;
}

export interface AIProvider {
  generateText(prompt: string, options?: AIGenerateOptions): Promise<AITextResponse>;
  generateStructuredOutput<T>(
    prompt: string,
    schemaDescription: string,
    options?: AIGenerateOptions
  ): Promise<AIStructuredResponse<T>>;
  embedText(text: string): Promise<number[]>;
}

export interface StudentAIContext {
  memberId: string;
  department: string;
  year: number;
  currentSkills: string[];
  interests: string[];
  coursesEnrolled: number;
  coursesCompleted: number;
  activeCourseTitles: string[];
  completedCourseTitles: string[];
  eventsAttended: number;
  projectTitles: string[];
  earnedAchievements: string[];
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

export interface AIPreferences {
  memberId: string;
  recommendationsEnabled: boolean;
  assistantEnabled: boolean;
  learningInsightsEnabled: boolean;
  weeklySummaryEnabled: boolean;
  updatedAt: string;
}
