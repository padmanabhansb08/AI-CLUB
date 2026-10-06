import { pool, query } from '../db';

export interface QuestionForStudent {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  category: string;
  difficulty: string;
}

export interface AssessmentAttemptRow {
  id: string;
  application_id: string;
  student_id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  started_at: Date;
  expires_at: Date;
  submitted_at: Date | null;
  question_ids: string[];
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  score: number;
  percentage: number;
  passed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AssessmentAnswerRow {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option: string | null;
  is_correct: boolean | null;
  answered_at: Date;
}

export const assessmentRepo = {
  // 1. Fetch 25 randomized active questions WITHOUT exposing correct answers
  getRandomQuestions: async (count: number = 25): Promise<QuestionForStudent[]> => {
    const res = await query(
      `SELECT id, question, option_a, option_b, option_c, option_d, category, difficulty
       FROM assessment_questions
       WHERE is_active = true
       ORDER BY RANDOM()
       LIMIT $1`,
      [count]
    );
    return res.rows;
  },

  // 2. Fetch questions by fixed array of IDs in original attempt order (NO correct_option)
  getQuestionsByIdsForStudent: async (ids: string[]): Promise<QuestionForStudent[]> => {
    if (!ids || ids.length === 0) return [];
    const res = await query(
      `SELECT id, question, option_a, option_b, option_c, option_d, category, difficulty
       FROM assessment_questions
       WHERE id = ANY($1::uuid[])`,
      [ids]
    );
    // Sort to match exact ordered array stored in attempt
    const map = new Map(res.rows.map((q: QuestionForStudent) => [q.id, q]));
    return ids.map((id) => map.get(id)).filter(Boolean) as QuestionForStudent[];
  },

  // 3. Internal: Fetch correct answers for server-side evaluation ONLY
  getQuestionsWithAnswers: async (ids: string[]): Promise<{ id: string; correct_option: string }[]> => {
    if (!ids || ids.length === 0) return [];
    const res = await query(
      `SELECT id, correct_option
       FROM assessment_questions
       WHERE id = ANY($1::uuid[])`,
      [ids]
    );
    return res.rows;
  },

  // 4. Create new assessment attempt
  createAttempt: async (data: {
    applicationId: string;
    studentId: string;
    questionIds: string[];
    expiresAt: Date;
    totalQuestions?: number;
  }): Promise<AssessmentAttemptRow> => {
    const res = await query(
      `INSERT INTO assessment_attempts (
        application_id, student_id, question_ids, expires_at, total_questions, status
      )
      VALUES ($1, $2, $3::jsonb, $4, $5, 'IN_PROGRESS')
      RETURNING *`,
      [
        data.applicationId,
        data.studentId,
        JSON.stringify(data.questionIds),
        data.expiresAt,
        data.totalQuestions || 25,
      ]
    );
    return res.rows[0];
  },

  // 5. Find attempt by ID
  getAttemptById: async (attemptId: string): Promise<AssessmentAttemptRow | null> => {
    const res = await query(
      `SELECT * FROM assessment_attempts WHERE id = $1`,
      [attemptId]
    );
    return res.rows[0] || null;
  },

  // 6. Find existing active attempt for student/application
  getActiveAttempt: async (applicationId: string, studentId: string): Promise<AssessmentAttemptRow | null> => {
    const res = await query(
      `SELECT * FROM assessment_attempts 
       WHERE application_id = $1 AND student_id = $2 AND status = 'IN_PROGRESS'
       ORDER BY started_at DESC
       LIMIT 1`,
      [applicationId, studentId]
    );
    return res.rows[0] || null;
  },

  // 7. Find submitted attempt for application
  getSubmittedAttempt: async (applicationId: string): Promise<AssessmentAttemptRow | null> => {
    const res = await query(
      `SELECT * FROM assessment_attempts
       WHERE application_id = $1 AND status = 'SUBMITTED'
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [applicationId]
    );
    return res.rows[0] || null;
  },

  // 8. Auto-save student answer
  saveAnswer: async (
    attemptId: string,
    questionId: string,
    selectedOption: string
  ): Promise<AssessmentAnswerRow> => {
    const res = await query(
      `INSERT INTO assessment_answers (attempt_id, question_id, selected_option, answered_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (attempt_id, question_id) 
       DO UPDATE SET selected_option = EXCLUDED.selected_option, answered_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [attemptId, questionId, selectedOption]
    );
    return res.rows[0];
  },

  // 9. Get all saved answers for an attempt
  getAnswersForAttempt: async (attemptId: string): Promise<AssessmentAnswerRow[]> => {
    const res = await query(
      `SELECT id, attempt_id, question_id, selected_option, is_correct, answered_at
       FROM assessment_answers
       WHERE attempt_id = $1`,
      [attemptId]
    );
    return res.rows;
  },

  // 10. Finalize attempt submission in DB
  submitAttempt: async (
    attemptId: string,
    metrics: {
      correctAnswers: number;
      wrongAnswers: number;
      unanswered: number;
      score: number;
      percentage: number;
      passed: boolean;
    }
  ): Promise<AssessmentAttemptRow> => {
    const res = await query(
      `UPDATE assessment_attempts
       SET status = 'SUBMITTED',
           submitted_at = CURRENT_TIMESTAMP,
           correct_answers = $2,
           wrong_answers = $3,
           unanswered = $4,
           score = $5,
           percentage = $6,
           passed = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [
        attemptId,
        metrics.correctAnswers,
        metrics.wrongAnswers,
        metrics.unanswered,
        metrics.score,
        metrics.percentage,
        metrics.passed,
      ]
    );
    return res.rows[0];
  },

  // 11. Update correctness flag on answer rows for audit trail
  updateAnswerCorrectness: async (
    attemptId: string,
    questionId: string,
    isCorrect: boolean
  ): Promise<void> => {
    await query(
      `UPDATE assessment_answers
       SET is_correct = $3
       WHERE attempt_id = $1 AND question_id = $2`,
      [attemptId, questionId, isCorrect]
    );
  },
};
