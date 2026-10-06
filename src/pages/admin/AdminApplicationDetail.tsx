import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Clock, XCircle, AlertTriangle, 
  Award, ShieldCheck, User, ExternalLink, Globe
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { applicationApi, type MembershipApplication } from '../../api/application.api';
import { LoadingState } from '../../components/common/LoadingState';

export const AdminApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<MembershipApplication | null>(null);
  const [attempt, setAttempt] = useState<any | null>(null);

  // Decision Modal States
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'WAITLISTED' | 'REJECTED' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await applicationApi.getById(id);
      setApplication(res.application);
      setAttempt(res.attempt);
    } catch (err: any) {
      console.error('Failed to load application detail:', err);
      setError(err.message || 'Unable to retrieve application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleDecisionSubmit = async () => {
    if (!id || !decisionType || isSubmitting) return;

    if (decisionType === 'REJECTED' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason to inform the student.');
      return;
    }

    try {
      setIsSubmitting(true);
      await applicationApi.reviewApplication(id, {
        decision: decisionType,
        notes: adminNotes.trim() || undefined,
        rejectionReason: decisionType === 'REJECTED' ? rejectionReason.trim() : undefined,
      });

      setDecisionType(null);
      setRejectionReason('');
      setAdminNotes('');
      await loadDetail();
    } catch (err: any) {
      console.error('Failed to submit decision:', err);
      alert(err.message || 'Failed to update application decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Application Review">
        <LoadingState message="Loading applicant dossier..." />
      </AdminLayout>
    );
  }

  if (error || !application) {
    return (
      <AdminLayout pageTitle="Application Review">
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
          <AlertTriangle size={32} className="mx-auto text-amber-400" />
          <h2 className="text-xl font-bold text-white">Application Not Found</h2>
          <p className="text-slate-300 text-sm">{error || 'Unable to locate application.'}</p>
          <button
            onClick={() => navigate('/admin/applications')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all"
          >
            Back to Applications
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle={`Review — ${application.fullName || application.application_number}`}>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/admin/applications"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to All Applications</span>
          </Link>

          {/* Quick status pill */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-medium text-slate-400">Current Status:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-white">
              {application.status}
            </span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-mono font-bold text-blue-400 tracking-wider uppercase mb-1">
              Application {application.application_number}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {application.fullName}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              {application.department} • Year {application.year} (Sec {application.classSection}) • Reg No: <span className="font-mono text-white">{application.registerNumber}</span>
            </p>
          </div>

          {/* Decision Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setDecisionType('APPROVED')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-emerald-500/20 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>Approve Candidate</span>
            </button>

            <button
              onClick={() => setDecisionType('WAITLISTED')}
              className="px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 border border-amber-500/40 text-amber-300 hover:text-white font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Clock size={16} />
              <span>Waitlist</span>
            </button>

            <button
              onClick={() => setDecisionType('REJECTED')}
              className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <XCircle size={16} />
              <span>Reject</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Profile & Assessment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Assessment Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="font-bold text-base text-white flex items-center gap-2">
                  <Award size={18} className="text-blue-400" />
                  <span>Technical Assessment</span>
                </h2>
                {application.passed !== null && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    application.passed 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {application.passed ? 'PASSED (≥60%)' : 'NOT PASSED (<60%)'}
                  </span>
                )}
              </div>

              {attempt ? (
                <>
                  {/* Big Score Box */}
                  <div className="p-6 rounded-xl bg-slate-850 border border-slate-750 text-center space-y-1">
                    <div className="text-xs uppercase font-medium text-slate-400">Total Score</div>
                    <div className="text-4xl font-mono font-black text-white">
                      {attempt.score} <span className="text-xl font-normal text-slate-400">/ {attempt.totalQuestions}</span>
                    </div>
                    <div className="text-sm font-semibold text-blue-400">
                      Percentage: {attempt.percentage}%
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                      <div className="text-xs text-slate-400">Correct</div>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">{attempt.correctAnswers}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40">
                      <div className="text-xs text-slate-400">Wrong</div>
                      <div className="text-lg font-bold text-red-400 mt-0.5">{attempt.wrongAnswers}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                      <div className="text-xs text-slate-400">Unanswered</div>
                      <div className="text-lg font-bold text-slate-400 mt-0.5">{attempt.unanswered}</div>
                    </div>
                  </div>

                  {/* Test Timing Details */}
                  <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <div className="flex justify-between">
                      <span>Started At:</span>
                      <span className="text-slate-200">{new Date(attempt.startedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Submitted At:</span>
                      <span className="text-slate-200">{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : '—'}</span>
                    </div>
                    {attempt.durationMinutes !== null && (
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="text-slate-200">{attempt.durationMinutes} minutes</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Candidate has not yet completed the mock assessment.
                </div>
              )}
            </div>

            {/* Official Club Membership Card if Approved */}
            {application.status === 'APPROVED' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck size={18} />
                  <span>Official Member Record Active</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-sm text-emerald-300">
                  Member Number: <strong>{application.memberNumber || 'AIC-M-2026-ACTIVE'}</strong>
                </div>
                <div className="text-xs text-slate-400">
                  Approved on {application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : '—'}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Full Student Profile & Dossier (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <h2 className="font-bold text-base text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                <User size={18} className="text-blue-400" />
                <span>Student Academic Dossier</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <div className="text-xs text-slate-400">Email Address</div>
                  <div className="font-semibold text-white mt-0.5 truncate">{application.email}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <div className="text-xs text-slate-400">Contact Phone</div>
                  <div className="font-semibold text-white mt-0.5">{application.phone || 'Not provided'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <div className="text-xs text-slate-400">Academic Unit</div>
                  <div className="font-semibold text-white mt-0.5">{application.department}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <div className="text-xs text-slate-400">Year & Section</div>
                  <div className="font-semibold text-white mt-0.5">Year {application.year} • Section {application.classSection}</div>
                </div>
              </div>

              {/* Bio */}
              {application.bio && (
                <div>
                  <div className="text-xs uppercase font-semibold text-slate-400 mb-1">Student Biography</div>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-850 p-4 rounded-xl border border-slate-800">
                    {application.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {application.skills && application.skills.length > 0 && (
                <div>
                  <div className="text-xs uppercase font-semibold text-slate-400 mb-2">Technical Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {application.skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-300 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Interests */}
              {application.technicalInterests && application.technicalInterests.length > 0 && (
                <div>
                  <div className="text-xs uppercase font-semibold text-slate-400 mb-2">AI & Technical Focus</div>
                  <div className="flex flex-wrap gap-2">
                    {application.technicalInterests.map((t, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-800">
                {application.githubUrl && (
                  <a
                    href={application.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <Globe size={14} />
                    <span>GitHub Profile</span>
                    <ExternalLink size={12} className="text-slate-400" />
                  </a>
                )}
                {application.linkedinUrl && (
                  <a
                    href={application.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <Globe size={14} />
                    <span>LinkedIn Profile</span>
                    <ExternalLink size={12} className="text-slate-400" />
                  </a>
                )}
                {application.portfolioUrl && (
                  <a
                    href={application.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <Globe size={14} />
                    <span>Portfolio</span>
                    <ExternalLink size={12} className="text-slate-400" />
                  </a>
                )}
              </div>

              {/* Review History / Notes if already reviewed */}
              {(application.admin_notes || application.rejection_reason) && (
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-slate-300 uppercase">Review Records</div>
                  {application.admin_notes && (
                    <div>
                      <span className="text-slate-400">Admin Notes: </span>
                      <span className="text-slate-200">{application.admin_notes}</span>
                    </div>
                  )}
                  {application.rejection_reason && (
                    <div>
                      <span className="text-red-400">Rejection Reason: </span>
                      <span className="text-slate-200">{application.rejection_reason}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {decisionType && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                decisionType === 'APPROVED' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : decisionType === 'WAITLISTED'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
              }`}>
                {decisionType === 'APPROVED' ? <CheckCircle2 size={24} /> : decisionType === 'WAITLISTED' ? <Clock size={24} /> : <XCircle size={24} />}
              </div>
              <h3 className="text-xl font-bold text-white">
                Confirm Decision: {decisionType}
              </h3>
              <p className="text-slate-300 text-sm">
                Candidate: <strong className="text-white">{application.fullName}</strong>
                {application.final_score !== null && (
                  <span> (Score: {application.final_score}/25 • {application.score_percentage}%)</span>
                )}
              </p>
            </div>

            {decisionType === 'APPROVED' && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-xs">
                Approving this candidate will atomically create an official Club Membership record, mark their status ACTIVE, and generate their unique Member ID.
              </div>
            )}

            {decisionType === 'REJECTED' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Rejection Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Assessment score below semester cutoff threshold..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Internal Admin Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Internal notes visible to reviewers only..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDecisionType(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecisionSubmit}
                disabled={isSubmitting || (decisionType === 'REJECTED' && !rejectionReason.trim())}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                  decisionType === 'APPROVED' 
                    ? 'bg-emerald-600 hover:bg-emerald-500' 
                    : decisionType === 'WAITLISTED'
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {isSubmitting ? 'Processing...' : `Confirm ${decisionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
