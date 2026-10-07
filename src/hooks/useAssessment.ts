import { useState, useCallback } from 'react';
import { assessmentApi, type AssessmentAttempt, type AssessmentSubmissionResult } from '../api/assessment.api';

export function useAssessment() {
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentSubmissionResult | null>(null);

  const startAssessment = useCallback(async (applicationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await assessmentApi.start(applicationId);
      setAttempt(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to start assessment');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAttempt = useCallback(async (attemptId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await assessmentApi.get(attemptId);
      setAttempt(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to load assessment');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAnswer = async (questionId: string, selectedOption: string) => {
    if (!attempt) return false;
    try {
      await assessmentApi.saveAnswer(attempt.attemptId, questionId, selectedOption);
      setAttempt((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          savedAnswers: {
            ...prev.savedAnswers,
            [questionId]: selectedOption,
          },
        };
      });
      return true;
    } catch (err: any) {
      console.error('Failed to auto-save answer:', err);
      return false;
    }
  };

  const submitAssessment = async () => {
    if (!attempt) return null;
    try {
      setSubmitting(true);
      setError(null);
      const res = await assessmentApi.submit(attempt.attemptId);
      setResult(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    attempt,
    loading,
    submitting,
    error,
    result,
    startAssessment,
    loadAttempt,
    saveAnswer,
    submitAssessment,
  };
}
