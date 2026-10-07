import { assessmentRepo } from '../repositories/assessmentRepository';
import { applicationRepo } from '../repositories/applicationRepository';
import { notificationService } from './notificationService';
import { query } from '../db';
import { AppError, NotFoundError, ForbiddenError, BadRequestError } from '../errors/AppError';

const ASSESSMENT_CONFIG = {
  TOTAL_QUESTIONS: 25,
  TIME_LIMIT_MINUTES: 30,
  PASSING_PERCENTAGE: 60, // 15 out of 25 = 60%
};

export const assessmentService = {
  // 1. Start or resume student assessment attempt
  startAssessment: async (userId: string, applicationId: string) => {
    // Verify application
    const app = await applicationRepo.findById(applicationId);
    if (!app) {
      throw new NotFoundError('Application not found');
    }
    if (app.user_id !== userId) {
      throw new ForbiddenError('You can only access your own application assessment');
    }

    if (app.status === 'APPROVED') {
      throw new BadRequestError('Application already approved. Membership is active.');
    }
    if (app.status === 'UNDER_REVIEW' || app.status === 'TEST_COMPLETED') {
      throw new BadRequestError('Assessment has already been completed and submitted for review.');
    }

    // Check for an active existing attempt
    const activeAttempt = await assessmentRepo.getActiveAttempt(applicationId, userId);
    if (activeAttempt) {
      const now = new Date();
      if (new Date(activeAttempt.expires_at) > now) {
        // Return active attempt with preserved questions in original randomized order
        const questions = await assessmentRepo.getQuestionsByIdsForStudent(activeAttempt.question_ids);
        const answers = await assessmentRepo.getAnswersForAttempt(activeAttempt.id);
        const answersMap = answers.reduce((acc: Record<string, string>, curr) => {
          if (curr.selected_option) acc[curr.question_id] = curr.selected_option;
          return acc;
        }, {});

        return {
          attemptId: activeAttempt.id,
          applicationId: activeAttempt.application_id,
          status: activeAttempt.status,
          startedAt: activeAttempt.started_at,
          expiresAt: activeAttempt.expires_at,
          timeRemainingSeconds: Math.max(
            0,
            Math.floor((new Date(activeAttempt.expires_at).getTime() - now.getTime()) / 1000)
          ),
          totalQuestions: activeAttempt.total_questions,
          questions,
          savedAnswers: answersMap,
        };
      }
    }

    // Pick 25 questions randomly from active question bank
    const questions = await assessmentRepo.getRandomQuestions(ASSESSMENT_CONFIG.TOTAL_QUESTIONS);
    if (questions.length < ASSESSMENT_CONFIG.TOTAL_QUESTIONS) {
      throw new BadRequestError(
        `Insufficient active questions in the question bank. Found ${questions.length}, required ${ASSESSMENT_CONFIG.TOTAL_QUESTIONS}.`
      );
    }

    const questionIds = questions.map((q) => q.id);
    const expiresAt = new Date(Date.now() + ASSESSMENT_CONFIG.TIME_LIMIT_MINUTES * 60 * 1000);

    const attempt = await assessmentRepo.createAttempt({
      applicationId,
      studentId: userId,
      questionIds,
      expiresAt,
      totalQuestions: questions.length,
    });

    // Update application status to TEST_IN_PROGRESS
    await applicationRepo.updateStatus(applicationId, {
      status: 'TEST_IN_PROGRESS',
      testAttemptId: attempt.id,
    });

    return {
      attemptId: attempt.id,
      applicationId: attempt.application_id,
      status: attempt.status,
      startedAt: attempt.started_at,
      expiresAt: attempt.expires_at,
      timeRemainingSeconds: ASSESSMENT_CONFIG.TIME_LIMIT_MINUTES * 60,
      totalQuestions: questions.length,
      questions,
      savedAnswers: {},
    };
  },

  // 2. Get active attempt with questions and saved answers (NO correct_option)
  getAssessment: async (attemptId: string, userId: string) => {
    const attempt = await assessmentRepo.getAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Assessment attempt not found');
    }
    if (attempt.student_id !== userId) {
      throw new ForbiddenError('Unauthorized attempt access');
    }

    const now = new Date();
    const questions = await assessmentRepo.getQuestionsByIdsForStudent(attempt.question_ids);
    const answers = await assessmentRepo.getAnswersForAttempt(attemptId);
    const answersMap = answers.reduce((acc: Record<string, string>, curr) => {
      if (curr.selected_option) acc[curr.question_id] = curr.selected_option;
      return acc;
    }, {});

    const timeRemainingSeconds = Math.max(
      0,
      Math.floor((new Date(attempt.expires_at).getTime() - now.getTime()) / 1000)
    );

    return {
      attemptId: attempt.id,
      applicationId: attempt.application_id,
      status: attempt.status,
      startedAt: attempt.started_at,
      expiresAt: attempt.expires_at,
      timeRemainingSeconds,
      totalQuestions: attempt.total_questions,
      questions,
      savedAnswers: answersMap,
    };
  },

  // 3. Auto-save student's answer
  saveAnswer: async (
    attemptId: string,
    questionId: string,
    selectedOption: string,
    userId: string
  ) => {
    const attempt = await assessmentRepo.getAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Assessment attempt not found');
    }
    if (attempt.student_id !== userId) {
      throw new ForbiddenError('Unauthorized attempt access');
    }
    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestError(`Cannot save answer. Attempt status is ${attempt.status}`);
    }

    // Backend timer enforcement
    if (new Date() > new Date(attempt.expires_at)) {
      throw new AppError(400, 'TEST_EXPIRED', 'Assessment time limit has expired. Please submit the test.');
    }

    // Validate that question belongs to this attempt
    if (!attempt.question_ids.includes(questionId)) {
      throw new BadRequestError('Question does not belong to this assessment attempt');
    }

    // Validate option
    const cleanOption = selectedOption.toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(cleanOption)) {
      throw new BadRequestError('Invalid option selected. Must be A, B, C, or D.');
    }

    const saved = await assessmentRepo.saveAnswer(attemptId, questionId, cleanOption);
    return {
      success: true,
      questionId: saved.question_id,
      selectedOption: saved.selected_option,
      answeredAt: saved.answered_at,
    };
  },

  // 4. Server-Side Evaluation and Submission
  submitAssessment: async (attemptId: string, userId: string) => {
    const attempt = await assessmentRepo.getAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Assessment attempt not found');
    }
    if (attempt.student_id !== userId) {
      throw new ForbiddenError('Unauthorized attempt access');
    }
    if (attempt.status === 'SUBMITTED') {
      throw new BadRequestError('Assessment has already been submitted');
    }

    // Server-side scoring: Fetch question answer key from DB
    const questionsWithAnswers = await assessmentRepo.getQuestionsWithAnswers(attempt.question_ids);
    const correctMap = new Map(questionsWithAnswers.map((q) => [q.id, q.correct_option]));

    // Fetch student's answers
    const studentAnswers = await assessmentRepo.getAnswersForAttempt(attemptId);
    const answerMap = new Map(studentAnswers.map((a) => [a.question_id, a.selected_option]));

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;

    for (const qId of attempt.question_ids) {
      const selected = answerMap.get(qId);
      const correct = correctMap.get(qId);

      if (!selected) {
        unanswered++;
      } else if (selected === correct) {
        correctAnswers++;
        await assessmentRepo.updateAnswerCorrectness(attemptId, qId, true);
      } else {
        wrongAnswers++;
        await assessmentRepo.updateAnswerCorrectness(attemptId, qId, false);
      }
    }

    const total = attempt.total_questions || 25;
    const score = correctAnswers; // 1 mark each
    const percentage = Number(((score / total) * 100).toFixed(2));
    const passed = percentage >= ASSESSMENT_CONFIG.PASSING_PERCENTAGE;

    // Finalize attempt
    const updatedAttempt = await assessmentRepo.submitAttempt(attemptId, {
      correctAnswers,
      wrongAnswers,
      unanswered,
      score,
      percentage,
      passed,
    });

    // Update application to UNDER_REVIEW
    await applicationRepo.updateStatus(attempt.application_id, {
      status: 'UNDER_REVIEW',
      testAttemptId: attemptId,
      finalScore: score,
      scorePercentage: percentage,
      passed,
      submittedAt: new Date(),
    });

    // Send notification to student
    try {
      // Find member profile ID for recipient_id if exists
      const memRes = await query(`SELECT id FROM members WHERE user_id = $1`, [userId]);
      if (memRes.rowCount && memRes.rows[0]) {
        await notificationService.createNotification({
          recipient_id: memRes.rows[0].id,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: 'Assessment Submitted',
          message: `Your AI CLUB mock test was submitted. Score: ${score}/${total} (${percentage}%). Your application is now Under Review.`,
          priority: 'HIGH',
        });
      }
    } catch (notifErr) {
      console.warn('[assessmentService] Notification failed to send:', notifErr);
    }

    // Audit log
    await query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, after_data)
       VALUES ($1, 'ASSESSMENT_SUBMITTED', 'membership_applications', $2, $3::jsonb)`,
      [
        userId,
        attempt.application_id,
        JSON.stringify({ score, percentage, passed, correctAnswers, wrongAnswers, unanswered }),
      ]
    );

    return {
      attemptId: updatedAttempt.id,
      applicationId: updatedAttempt.application_id,
      status: updatedAttempt.status,
      score,
      percentage,
      passed,
      totalQuestions: total,
      correctAnswers,
      wrongAnswers,
      unanswered,
      message: 'Your assessment has been successfully submitted for club administrator review.',
    };
  },
};
