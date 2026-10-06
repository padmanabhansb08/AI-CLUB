import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, AlertTriangle, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, 
  Send, Award, BookOpen
} from 'lucide-react';
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

        // Fetch student's application to get applicationId
        const appRes = await applicationApi.getMyApplication();
        const app = appRes.application;

        if (!app) {
          setError('No membership application found. Please initialize your application first.');
          return;
        }

        if (app.status === 'UNDER_REVIEW' || app.status === 'APPROVED' || app.status === 'TEST_COMPLETED') {
          // Already taken
          setError('You have already submitted this assessment. Your application is under review.');
          return;
        }

        // Start or resume test
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
          // Auto submit on expiry
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptId, result, loading]);

  // Format seconds to MM:SS
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle option select with automatic background saving
  const handleSelectOption = async (option: string) => {
    if (!attemptId || !questions[currentIndex]) return;
    const currentQ = questions[currentIndex];

    // Optimistic UI update
    setAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
    setSaveStatus('saving');

    try {
      await assessmentApi.saveAnswer(attemptId, currentQ.id, option);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Auto-save failed:', err);
      setSaveStatus('error');
    }
  };

  // Final submission handler
  const handleFinalSubmit = async () => {
    if (!attemptId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setShowSubmitModal(false);
      const res = await assessmentApi.submit(attemptId);
      setResult(res);
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert(err.message || 'Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your 25-question assessment..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-white">Assessment Notice</h2>
          <p className="text-slate-300 text-sm">{error}</p>
          <button
            onClick={() => navigate('/application')}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all"
          >
            Back to Application
          </button>
        </div>
      </div>
    );
  }

  // Result Screen View
  if (result) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
            result.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {result.passed ? <Award size={36} /> : <AlertTriangle size={36} />}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Assessment Completed
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              {result.score} / {result.totalQuestions}
            </h2>
            <div className="text-lg font-bold mt-1 text-slate-200">
              Score: {result.percentage}% •{' '}
              <span className={result.passed ? 'text-emerald-400' : 'text-amber-400'}>
                {result.passed ? 'PASSED' : 'NOT PASSED'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-sm">
            <div>
              <div className="text-xs text-slate-400">Correct</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{result.correctAnswers}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Wrong</div>
              <div className="text-base font-bold text-red-400 mt-0.5">{result.wrongAnswers}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Unanswered</div>
              <div className="text-base font-bold text-slate-400 mt-0.5">{result.unanswered}</div>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Your AI CLUB entry mock test has been evaluated and officially attached to your application. The club administrators will review your student profile and assessment performance to make final selection decisions.
          </p>

          <button
            onClick={() => navigate('/application')}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/25 cursor-pointer"
          >
            Go to Application Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Test Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">AI CLUB ENTRY ASSESSMENT</h1>
              <div className="text-xs text-slate-400">Question {currentIndex + 1} of {questions.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Auto-save indicator */}
            <div className="text-xs flex items-center gap-1.5 text-slate-400">
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Saved</span>
                </>
              )}
              {saveStatus === 'saving' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span className="text-blue-300">Saving...</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle size={14} className="text-amber-400" />
                  <span className="text-amber-400">Save pending</span>
                </>
              )}
            </div>

            {/* Live Timer */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
              secondsRemaining < 300 
                ? 'bg-red-950/40 border-red-600/60 text-red-400 animate-pulse' 
                : 'bg-slate-800/80 border-slate-700 text-blue-300'
            }`}>
              <Clock size={16} />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            {/* Quick Submit CTA */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-md cursor-pointer"
            >
              Submit Test
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current Question */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            {/* Metadata Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                {currentQ.category.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Difficulty: <strong className="text-slate-300 uppercase">{currentQ.difficulty}</strong>
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentIndex + 1}. {currentQ.question}
            </h2>

            {/* 4 Multiple Choice Options */}
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
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white ring-1 ring-blue-500/50 shadow-md'
                        : 'bg-slate-850 hover:bg-slate-800/80 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                    }`}>
                      {key}
                    </span>
                    <span className="text-sm pt-1 leading-snug">{text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation Controls */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <div className="text-xs text-slate-400">
              {currentIndex + 1} of {questions.length} questions
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <span>Submit Assessment</span>
                <Send size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Navigator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Question Navigator
              </h3>
              <div className="text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold">{answeredCount}</span> / {questions.length} Answered
              </div>
            </div>

            {/* 25 Question Circles Grid */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-blue-400 bg-blue-600 text-white shadow-lg'
                        : isAnswered
                          ? 'bg-blue-950/60 border border-blue-600/60 text-blue-300'
                          : 'bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-blue-600 ring-1 ring-blue-400 inline-block" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-blue-950/60 border border-blue-600/60 inline-block" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-800/60 border border-slate-700/60 inline-block" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Send size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Submit Assessment?</h3>
              <p className="text-sm text-slate-300">
                You have answered <strong className="text-emerald-400">{answeredCount}</strong> of 25 questions.
              </p>
              {unansweredCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-300 text-xs flex items-center gap-2 text-left">
                  <AlertTriangle size={16} className="shrink-0 text-amber-400" />
                  <span>Warning: {unansweredCount} question(s) remain unanswered and will be marked 0.</span>
                </div>
              )}
              <p className="text-xs text-slate-400">
                Once submitted, your answers cannot be altered. The test will be evaluated immediately.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/25 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
