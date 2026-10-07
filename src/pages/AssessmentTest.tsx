import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { applicationApi } from '../api/application.api';
import { assessmentApi, type AssessmentQuestion, type AssessmentSubmissionResult } from '../api/assessment.api';
import { LoadingState } from '../components/common/LoadingState';

export const AssessmentTest: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assessment Attempt state
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30 * 60);

  // Submit confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results state
  const [result, setResult] = useState<AssessmentSubmissionResult | null>(null);

  // Initialize test
  useEffect(() => {
    const initTest = async () => {
      try {
        setLoading(true);
        setError(null);

        const appRes = await applicationApi.getMyApplication();
        const app = appRes.application;

        if (!app) {
          setError('No membership application found. Please initialize your application first.');
          return;
        }

        if (app.status === 'UNDER_REVIEW' || app.status === 'APPROVED' || app.status === 'TEST_COMPLETED') {
          setError('You have already submitted this assessment. Your application is under review.');
          return;
        }

        const testRes = await assessmentApi.start(app.id);
        setAttemptId(testRes.attemptId);
        setQuestions(testRes.questions);
        setAnswers(testRes.savedAnswers || {});
        setSecondsRemaining(testRes.timeRemainingSeconds);
      } catch (err: any) {
        console.error('Failed to start assessment:', err);
        setError(err.message || 'Unable to start assessment.');
      } finally {
        setLoading(false);
      }
    };

    initTest();
  }, []);

  // Countdown timer interval
  useEffect(() => {
    if (!attemptId || result || loading) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptId, result, loading]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = async (optionKey: string) => {
    if (!attemptId || !questions[currentIndex]) return;

    const question = questions[currentIndex];
    const newAnswers = { ...answers, [question.id]: optionKey };
    setAnswers(newAnswers);

    try {
      setSaveStatus('saving');
      await assessmentApi.saveAnswer(attemptId, question.id, optionKey);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to auto-save answer:', err);
      setSaveStatus('error');
    }
  };

  const handleFinalSubmit = async () => {
    if (!attemptId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const subResult = await assessmentApi.submit(attemptId);
      setResult(subResult);
      setShowSubmitModal(false);
    } catch (err: any) {
      console.error('Failed to submit assessment:', err);
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center p-6 text-[#111111]">
        <LoadingState message="Configuring 25-question technical assessment..." />
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center p-6 text-[#111111]">
        <div className="max-w-md w-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.1)] rounded-[24px] p-8 text-center space-y-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.1)] text-[#111111] flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-medium tracking-tight mb-2">Assessment Notice</h2>
            <p className="text-sm text-[#66645F] leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => navigate('/application')}
            className="pill-btn w-full text-center"
          >
            Back to Application Dashboard &rarr;
          </button>
        </div>
      </div>
    );
  }

  // Visual Result State (Editorial Section 35)
  if (result) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center p-6 text-[#111111]">
        <div className="max-w-xl w-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[28px] p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.04)] space-y-8 text-center">
          <span className="editorial-number">EVALUATION REPORT</span>

          <h2 className="text-[32px] sm:text-[40px] font-normal tracking-[-0.03em] leading-tight text-[#111111]">
            ASSESSMENT COMPLETE
          </h2>

          {/* Large Score Metric */}
          <div className="py-6 border-y border-[rgba(17,17,17,0.08)] space-y-2">
            <div className="text-[64px] sm:text-[80px] font-normal tracking-[-0.04em] text-[#111111] leading-none">
              {result.percentage}%
            </div>
            <div className="text-[18px] font-medium text-[#66645F]">
              {result.score} / {result.totalQuestions} Questions Correct
            </div>
            <div className="inline-block mt-3 px-4 py-1 rounded-full text-[12px] font-semibold uppercase tracking-wider bg-[#FAF9F6] border border-[rgba(17,17,17,0.09)] text-[#111111]">
              UNDER REVIEW
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-2 text-sm">
            <div>
              <div className="text-[11.5px] uppercase tracking-wider text-[#92908A] font-semibold">Correct</div>
              <div className="text-[20px] font-medium text-[#111111] mt-0.5">{result.correctAnswers}</div>
            </div>
            <div>
              <div className="text-[11.5px] uppercase tracking-wider text-[#92908A] font-semibold">Wrong</div>
              <div className="text-[20px] font-medium text-[#111111] mt-0.5">{result.wrongAnswers}</div>
            </div>
            <div>
              <div className="text-[11.5px] uppercase tracking-wider text-[#92908A] font-semibold">Unanswered</div>
              <div className="text-[20px] font-medium text-[#92908A] mt-0.5">{result.unanswered}</div>
            </div>
          </div>

          <p className="text-[15px] text-[#66645F] leading-relaxed max-w-[48ch] mx-auto">
            Your technical assessment has been recorded and officially attached to your application. The AI CLUB selection committee will review your scores alongside your profile.
          </p>

          <button
            onClick={() => navigate('/application')}
            className="pill-btn w-full h-[48px] text-[15px]"
          >
            Return to Application Hub &rarr;
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#111111] flex flex-col">
      {/* Editorial Header */}
      <header className="sticky top-0 z-30 bg-[#F5F4F0]/95 backdrop-blur-md border-b border-[rgba(17,17,17,0.08)] px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-[15px]">✦</span>
            <div>
              <h1 className="text-[14px] font-semibold tracking-[-0.01em] uppercase text-[#111111]">
                AI CLUB ENTRY ASSESSMENT
              </h1>
              <div className="text-[12px] text-[#92908A]">
                Question {currentIndex + 1} of {questions.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Auto-save Status */}
            <div className="text-[12px] hidden sm:flex items-center gap-1.5 text-[#66645F]">
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle2 size={13} className="text-[#15803d]" />
                  <span>Draft saved</span>
                </>
              )}
              {saveStatus === 'saving' && <span className="text-[#92908A]">Saving...</span>}
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] text-[13.5px] font-mono font-medium">
              <Clock size={14} className="text-[#66645F]" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            {/* Submit Pill CTA */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="pill-btn h-[36px] px-5 text-[12.5px]"
            >
              Finish Assessment
            </button>
          </div>
        </div>
      </header>

      {/* Main Testing Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Question & Options */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-8">
          <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[24px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(17,17,17,0.06)]">
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[#92908A]">
                {currentQ.category?.replace('_', ' ') || 'MACHINE LEARNING'}
              </span>
              <span className="text-[12px] text-[#66645F]">
                Difficulty &middot; {currentQ.difficulty || 'Intermediate'}
              </span>
            </div>

            <div>
              <span className="editorial-number">QUESTION {currentIndex + 1}</span>
              <h2 className="text-[22px] sm:text-[26px] font-normal tracking-[-0.02em] leading-snug text-[#111111]">
                {currentQ.question}
              </h2>
            </div>

            {/* 4 Clean Options */}
            <div className="space-y-3 pt-2">
              {[
                { key: 'A', text: currentQ.option_a },
                { key: 'B', text: currentQ.option_b },
                { key: 'C', text: currentQ.option_c },
                { key: 'D', text: currentQ.option_d },
              ].map(({ key, text }) => {
                const isSelected = answers[currentQ.id] === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectOption(key)}
                    className={`w-full text-left p-5 rounded-[16px] border transition-all flex items-start gap-4 cursor-pointer ${
                      isSelected
                        ? 'bg-[#050505] text-[#FFFFFF] border-[#050505] shadow-md'
                        : 'bg-[#FFFFFF] hover:bg-[#FAF9F6] border-[rgba(17,17,17,0.1)] text-[#111111]'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[13px] shrink-0 ${
                      isSelected
                        ? 'bg-[#FFFFFF] text-[#050505]'
                        : 'bg-[#FAF9F6] border border-[rgba(17,17,17,0.1)] text-[#66645F]'
                    }`}>
                      {key}
                    </span>
                    <span className="text-[15px] pt-0.5 leading-relaxed">{text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] rounded-[20px] p-4 shadow-xs">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="pill-outline h-[38px] px-4 text-[13px] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} /> Previous
            </button>

            <span className="text-[13px] text-[#92908A]">
              {currentIndex + 1} / {questions.length}
            </span>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="pill-btn h-[38px] px-5 text-[13px]"
              >
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="pill-btn h-[38px] px-5 text-[13px]"
              >
                Submit Assessment &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Navigator */}
        <div className="lg:col-span-4">
          <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[24px] p-6 space-y-6 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(17,17,17,0.06)]">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92908A]">
                NAVIGATOR
              </span>
              <span className="text-[12px] text-[#66645F]">
                {answeredCount} / {questions.length} answered
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-full text-[12.5px] font-semibold transition-all flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? 'bg-[#050505] text-[#FFFFFF] shadow-sm'
                        : isAnswered
                          ? 'bg-[#EBE9E3] text-[#111111] border border-[rgba(17,17,17,0.12)]'
                          : 'bg-[#FAF9F6] text-[#92908A] border border-[rgba(17,17,17,0.08)] hover:bg-[#EBE9E3]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[rgba(17,17,17,0.06)] space-y-2 text-[12px] text-[#66645F]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#050505]" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EBE9E3] border border-[rgba(17,17,17,0.1)]" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)]" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.1)] rounded-[24px] p-8 shadow-2xl space-y-6 text-center">
            <h3 className="text-2xl font-normal tracking-tight text-[#111111]">Submit Assessment?</h3>
            <p className="text-[15px] text-[#66645F] leading-relaxed">
              You have answered <strong className="text-[#111111]">{answeredCount}</strong> of 25 questions.
            </p>
            {unansweredCount > 0 && (
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[12.5px] text-[#b45309]">
                Notice: {unansweredCount} question(s) remain unanswered.
              </div>
            )}
            <p className="text-[12px] text-[#92908A]">
              Once submitted, your answers will be evaluated immediately.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="pill-outline flex-1"
              >
                Return
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="pill-btn flex-1"
              >
                {isSubmitting ? 'Evaluating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
