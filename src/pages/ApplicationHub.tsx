import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck, 
  Award, User, BookOpen, Sparkles, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { applicationApi, type MembershipApplication } from '../api/application.api';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LoadingState } from '../components/common/LoadingState';

export const ApplicationHub: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<MembershipApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationApi.getMyApplication();
      setApplication(res.application);
      await refreshUser();
    } catch (err: any) {
      console.error('Failed to load application:', err);
      setError(err.message || 'Unable to load your AI CLUB application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  if (loading) {
    return (
      <DashboardLayout pageTitle="Club Application">
        <LoadingState message="Loading your AI CLUB application status..." />
      </DashboardLayout>
    );
  }

  const status = application?.status || 'TEST_REQUIRED';
  const isApproved = status === 'APPROVED' || user?.membershipStatus === 'ACTIVE';

  // Determine active step in the 5-step selection timeline
  let currentStep = 1;
  if (status === 'TEST_REQUIRED') currentStep = 2;
  if (status === 'TEST_IN_PROGRESS') currentStep = 3;
  if (status === 'UNDER_REVIEW' || status === 'TEST_COMPLETED') currentStep = 4;
  if (isApproved || status === 'WAITLISTED' || status === 'REJECTED') currentStep = 5;

  return (
    <DashboardLayout pageTitle="Membership Application">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 border border-blue-900/50 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
                <Sparkles size={14} className="text-blue-400 animate-pulse" />
                <span>AI CLUB SELECTION PROCESS</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                AI CLUB Membership Selection
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                Official student onboarding portal. Complete your profile, take the 25-question technical assessment, and get evaluated for official AI CLUB membership.
              </p>
            </div>

            {application?.application_number && (
              <div className="bg-slate-900/80 backdrop-blur border border-slate-700/60 p-4 rounded-xl text-right md:text-left shadow-md">
                <div className="text-xs uppercase font-medium text-slate-400">Application Number</div>
                <div className="text-lg font-mono font-bold text-blue-400 tracking-wider">
                  {application.application_number}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Submitted: {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'In Progress'}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 5-Step Process Timeline */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6">
            Selection Workflow Progress
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1: Account Created */}
            <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
              currentStep >= 1 ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-slate-800/30 border-slate-800 text-slate-500'
            }`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-400 mb-3">
                <CheckCircle2 size={22} />
              </div>
              <div className="font-semibold text-sm text-white">1. Account</div>
              <div className="text-xs text-emerald-400 mt-1">Completed ✓</div>
            </div>

            {/* Step 2: Student Profile */}
            <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
              currentStep >= 2 ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-slate-800/30 border-slate-800 text-slate-500'
            }`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-400 mb-3">
                <CheckCircle2 size={22} />
              </div>
              <div className="font-semibold text-sm text-white">2. Profile</div>
              <div className="text-xs text-emerald-400 mt-1">Verified ✓</div>
            </div>

            {/* Step 3: Mock Test */}
            <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
              currentStep > 3 
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                : currentStep === 3 || currentStep === 2
                  ? 'bg-blue-950/40 border-blue-600/50 text-blue-300 ring-2 ring-blue-500/30'
                  : 'bg-slate-800/30 border-slate-800 text-slate-500'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                currentStep > 3 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {currentStep > 3 ? <CheckCircle2 size={22} /> : <BookOpen size={22} />}
              </div>
              <div className="font-semibold text-sm text-white">3. Mock Test</div>
              <div className="text-xs mt-1">
                {currentStep > 3 ? (
                  <span className="text-emerald-400">{application?.final_score ?? 0}/25 Completed</span>
                ) : (
                  <span className="text-blue-400 font-medium">25 MCQ Assessment</span>
                )}
              </div>
            </div>

            {/* Step 4: Admin Review */}
            <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
              currentStep > 4 
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                : currentStep === 4 
                  ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 ring-2 ring-amber-500/30'
                  : 'bg-slate-800/30 border-slate-800 text-slate-500'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                currentStep > 4 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : currentStep === 4
                    ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                    : 'bg-slate-800 text-slate-500'
              }`}>
                {currentStep > 4 ? <CheckCircle2 size={22} /> : <Clock size={22} />}
              </div>
              <div className="font-semibold text-sm text-white">4. Admin Review</div>
              <div className="text-xs mt-1">
                {currentStep > 4 ? (
                  <span className="text-emerald-400">Reviewed ✓</span>
                ) : currentStep === 4 ? (
                  <span className="text-amber-400 font-medium">Under Review...</span>
                ) : (
                  <span className="text-slate-500">Pending Test</span>
                )}
              </div>
            </div>

            {/* Step 5: Membership Decision */}
            <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
              isApproved
                ? 'bg-gradient-to-b from-emerald-950/50 to-slate-900 border-emerald-500/50 text-emerald-300 ring-2 ring-emerald-500/40'
                : status === 'WAITLISTED'
                  ? 'bg-amber-950/30 border-amber-600/40 text-amber-300'
                  : status === 'REJECTED'
                    ? 'bg-red-950/30 border-red-800/40 text-red-300'
                    : 'bg-slate-800/30 border-slate-800 text-slate-500'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                isApproved
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : status === 'WAITLISTED'
                    ? 'bg-amber-500/20 text-amber-400'
                    : status === 'REJECTED'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-slate-800 text-slate-500'
              }`}>
                {isApproved ? <Award size={22} /> : status === 'REJECTED' ? <XCircle size={22} /> : <ShieldCheck size={22} />}
              </div>
              <div className="font-semibold text-sm text-white">5. Club Status</div>
              <div className="text-xs mt-1 font-medium">
                {isApproved ? (
                  <span className="text-emerald-400 font-bold">Approved Member</span>
                ) : status === 'WAITLISTED' ? (
                  <span className="text-amber-400">Waitlisted</span>
                ) : status === 'REJECTED' ? (
                  <span className="text-red-400">Not Selected</span>
                ) : (
                  <span className="text-slate-500">Final Decision</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic State Panels */}

        {/* STATE A: APPROVED MEMBER */}
        {isApproved && (
          <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/30 border-2 border-emerald-500/40 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
                  <Award size={32} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                    AI CLUB MEMBER ✓
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Congratulations, {user?.fullName || 'Student'}!
                  </h3>
                  <p className="text-slate-300 text-sm">
                    You have been officially admitted into the AI CLUB. Your club membership is active.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-emerald-600/40 p-4 rounded-xl text-right sm:text-left">
                <div className="text-xs text-slate-400 uppercase font-semibold">Official Member ID</div>
                <div className="text-xl font-mono font-extrabold text-emerald-400 tracking-wider">
                  {user?.memberNumber || application?.memberNumber || 'AIC-M-2026-ACTIVE'}
                </div>
                <div className="text-xs text-emerald-500/90 font-medium mt-1">Status: ACTIVE</div>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-800/30 flex flex-wrap gap-4 items-center justify-between">
              <div className="text-xs text-slate-400">
                All member-exclusive features (projects, LMS courses, attendance, AI assistant) are now unlocked.
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 cursor-pointer"
              >
                <span>Enter Member Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STATE B: WAITLISTED */}
        {!isApproved && status === 'WAITLISTED' && (
          <div className="p-8 rounded-2xl bg-amber-950/30 border border-amber-600/40 shadow-xl space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Application Status: Waitlisted</h3>
                <p className="text-slate-300 text-sm mt-1">
                  Your AI CLUB application is currently placed on the club waitlist.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-sm">
              Your test score of <strong className="text-amber-400">{application?.final_score}/25 ({application?.score_percentage}%)</strong> qualifies you for seat allocation if approved vacancies arise. You will receive an automated notification as soon as the review panel completes subsequent allocations.
            </div>
          </div>
        )}

        {/* STATE C: REJECTED */}
        {!isApproved && status === 'REJECTED' && (
          <div className="p-8 rounded-2xl bg-red-950/20 border border-red-800/40 shadow-xl space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <XCircle size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Application Status: Not Selected</h3>
                <p className="text-slate-300 text-sm mt-1">
                  Thank you for your interest in AI CLUB.
                </p>
              </div>
            </div>
            {application?.rejection_reason && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-red-900/40 text-slate-300 text-sm">
                <div className="text-xs font-semibold uppercase text-red-400 mb-1">Feedback from Review Panel:</div>
                <p className="text-slate-200">{application.rejection_reason}</p>
              </div>
            )}
            <p className="text-xs text-slate-400">
              You are welcome to re-apply during the next recruitment window after strengthening your machine learning foundations.
            </p>
          </div>
        )}

        {/* STATE D: UNDER REVIEW */}
        {!isApproved && (status === 'UNDER_REVIEW' || status === 'TEST_COMPLETED') && (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Clock size={32} className="animate-spin text-blue-400" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                    UNDER REVIEW
                  </div>
                  <h3 className="text-2xl font-bold text-white">Application Under Admin Review</h3>
                  <p className="text-slate-300 text-sm">
                    Your assessment results and profile details are now under evaluation by club administrators.
                  </p>
                </div>
              </div>

              {application?.final_score !== null && (
                <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl text-right sm:text-left">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Assessment Score</div>
                  <div className="text-2xl font-mono font-black text-white">
                    {application?.final_score} <span className="text-sm font-normal text-slate-400">/ 25</span>
                  </div>
                  <div className="text-xs font-semibold mt-1">
                    {application?.passed ? (
                      <span className="text-emerald-400">✓ PASSED ({application?.score_percentage}%)</span>
                    ) : (
                      <span className="text-amber-400">NOT PASSED ({application?.score_percentage}%)</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
              <strong>Selection Criteria Notice:</strong> The mock test evaluates foundational aptitude across AI, Machine Learning, Python, and Data Science. Passing the mock test qualifies your profile for final review, but administrative selection also considers class year, department balance, and project interest.
            </div>
          </div>
        )}

        {/* STATE E: TEST REQUIRED / TEST IN PROGRESS */}
        {!isApproved && (status === 'TEST_REQUIRED' || status === 'TEST_IN_PROGRESS') && (
          <div className="p-8 rounded-2xl bg-slate-900 border border-blue-900/60 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                  <BookOpen size={14} />
                  <span>STEP 3 OF 5: TECHNICAL ASSESSMENT</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  AI CLUB Entry Mock Test (25 Questions)
                </h3>
                <p className="text-slate-300 text-sm max-w-xl">
                  You are eligible to take the AI CLUB assessment test. The test comprises 25 multiple choice questions evaluating basic AI, ML, Python, and logical problem solving aptitude.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => navigate('/application/test')}
                  className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-blue-500/30 cursor-pointer"
                >
                  <span>{status === 'TEST_IN_PROGRESS' ? 'Resume Assessment' : 'Start Assessment Now'}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Test Rules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Questions</div>
                <div className="text-lg font-bold text-white mt-0.5">25 Multiple Choice</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Time Limit</div>
                <div className="text-lg font-bold text-white mt-0.5">30 Minutes</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Passing Mark</div>
                <div className="text-lg font-bold text-white mt-0.5">60% (15 / 25 Marks)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Auto-Save</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">Enabled ✓</div>
              </div>
            </div>
          </div>
        )}

        {/* Student Profile Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User size={18} className="text-blue-400" />
              <span>Registered Student Profile</span>
            </h3>
            <span className="text-xs text-slate-400">Verified Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Full Name</div>
              <div className="font-semibold text-white mt-0.5">{application?.fullName || user?.fullName || '—'}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Register Number</div>
              <div className="font-mono font-semibold text-white mt-0.5">{application?.registerNumber || user?.registerNumber || '—'}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Department & Year</div>
              <div className="font-semibold text-white mt-0.5">
                {application?.department || user?.department || '—'} • Year {application?.year || user?.year || '—'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">College Email</div>
              <div className="font-semibold text-white mt-0.5 truncate">{application?.email || user?.email || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
