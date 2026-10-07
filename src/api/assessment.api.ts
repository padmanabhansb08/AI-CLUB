import { client } from './client';

export interface AssessmentQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  category: string;
  difficulty: string;
}

export interface AssessmentAttempt {
  attemptId: string;
  applicationId: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  startedAt: string;
  expiresAt: string;
  timeRemainingSeconds: number;
  totalQuestions: number;
  questions: AssessmentQuestion[];
  savedAnswers: Record<string, string>;
}

export interface AssessmentSubmissionResult {
  attemptId: string;
  applicationId: string;
  status: string;
  score: number;
  percentage: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  message: string;
}

export const assessmentApi = {
  // Start or resume test
  start: async (applicationId: string) => {
    return await client.post<AssessmentAttempt>('/assessments/start', { applicationId });
  },

  // Get active test attempt
  get: async (attemptId: string) => {
    return await client.get<AssessmentAttempt>(`/assessments/${attemptId}`);
  },

  // Auto-save single question answer
  saveAnswer: async (attemptId: string, questionId: string, selectedOption: string) => {
    return await client.put<{
      success: boolean;
      questionId: string;
      selectedOption: string;
      answeredAt: string;
    }>(`/assessments/${attemptId}/questions/${questionId}`, { selectedOption });
  },

  // Submit test for server-side evaluation
  submit: async (attemptId: string) => {
    return await client.post<AssessmentSubmissionResult>(`/assessments/${attemptId}/submit`);
  },
};
