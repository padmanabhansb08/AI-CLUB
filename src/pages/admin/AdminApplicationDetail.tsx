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
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] text-center space-y-4 shadow-sm">
          <AlertTriangle size={32} className="mx-auto text-amber-600" />
          <h2 className="text-xl font-bold text-[#111111]">Application Not Found</h2>
          <p className="text-[#66645F] text-xs">{error || 'Unable to locate application.'}</p>
          <button
            onClick={() => navigate('/admin/applications')}
            className="pill-btn px-5 py-2.5 text-xs font-semibold"
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
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#66645F] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to All Applications</span>
          </Link>

          {/* Quick status pill */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-medium text-[#92908A]">Current Status:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF9F6] border border-[rgba(17,17,17,0.12)] text-[#111111]">
              {application.status}
            </span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-mono font-bold text-[#66645F] tracking-wider uppercase mb-1">
              Application {application.application_number}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {application.fullName}
            </h1>
            <p className="text-[#66645F] text-xs sm:text-sm mt-1">
              {application.department} • Year {application.year} (Sec {application.classSection}) • Reg No: <span className="font-mono text-[#111111]">{application.registerNumber}</span>
            </p>
          </div>

          {/* Decision Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setDecisionType('APPROVED')}
              className="px-5 py-2.5 rounded-full bg-[#050505] hover:bg-[#222222] text-[#FFFFFF] font-semibold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>Approve Candidate</span>
            </button>

            <button
              onClick={() => setDecisionType('WAITLISTED')}
              className="px-4 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Clock size={15} />
              <span>Waitlist</span>
            </button>

            <button
              onClick={() => setDecisionType('REJECTED')}
              className="px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <XCircle size={15} />
              <span>Reject</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Profile & Assessment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Assessment Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(17,17,17,0.06)]">
                <h2 className="font-bold text-sm text-[#111111] flex items-center gap-2">
                  <Award size={18} className="text-[#111111]" />
                  <span>Technical Assessment</span>
                </h2>
                {application.passed !== null && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    application.passed 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {application.passed ? 'PASSED (≥60%)' : 'NOT PASSED (<60%)'}
                  </span>
                )}
              </div>

              {attempt ? (
                <>
                  {/* Big Score Box */}
                  <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)] text-center space-y-1">
                    <div className="text-xs uppercase font-medium text-[#92908A]">Total Score</div>
                    <div className="text-4xl font-mono font-black text-[#111111]">
                      {attempt.score} <span className="text-xl font-normal text-[#92908A]">/ {attempt.totalQuestions}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#111111] pt-1">
                      Percentage: {attempt.percentage}%
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                      <div className="text-xs text-[#66645F]">Correct</div>
                      <div className="text-lg font-bold text-emerald-800 mt-0.5 font-mono">{attempt.correctAnswers}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/60">
                      <div className="text-xs text-[#66645F]">Wrong</div>
                      <div className="text-lg font-bold text-rose-800 mt-0.5 font-mono">{attempt.wrongAnswers}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)]">
                      <div className="text-xs text-[#66645F]">Unanswered</div>
                      <div className="text-lg font-bold text-[#111111] mt-0.5 font-mono">{attempt.unanswered}</div>
                    </div>
                  </div>

                  {/* Test Timing Details */}
                  <div className="space-y-2 text-xs text-[#66645F] pt-2 border-t border-[rgba(17,17,17,0.06)]">
                    <div className="flex justify-between">
                      <span>Started At:</span>
                      <span className="text-[#111111] font-mono">{new Date(attempt.startedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Submitted At:</span>
                      <span className="text-[#111111] font-mono">{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : '—'}</span>
                    </div>
                    {attempt.durationMinutes !== null && (
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="text-[#111111] font-mono">{attempt.durationMinutes} minutes</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-[#92908A] text-xs">
                  Candidate has not yet completed the mock assessment.
                </div>
              )}
            </div>

            {/* Official Club Membership Card if Approved */}
            {application.status === 'APPROVED' && (
              <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck size={16} />
                  <span>Official Member Record Active</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-emerald-200/80 font-mono text-xs text-emerald-900">
                  Member Number: <strong>{application.memberNumber || 'AIC-M-2026-ACTIVE'}</strong>
                </div>
                <div className="text-[11px] text-[#66645F]">
                  Approved on {application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : '—'}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Full Student Profile & Dossier (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="font-bold text-sm text-[#111111] pb-3 border-b border-[rgba(17,17,17,0.06)] flex items-center gap-2">
                <User size={18} className="text-[#111111]" />
                <span>Student Academic Dossier</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)]">
                  <div className="text-[11px] text-[#92908A] uppercase tracking-wider font-semibold">Email Address</div>
                  <div className="font-semibold text-[#111111] mt-0.5 truncate">{application.email}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)]">
                  <div className="text-[11px] text-[#92908A] uppercase tracking-wider font-semibold">Contact Phone</div>
                  <div className="font-semibold text-[#111111] mt-0.5">{application.phone || 'Not provided'}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)]">
                  <div className="text-[11px] text-[#92908A] uppercase tracking-wider font-semibold">Academic Unit</div>
                  <div className="font-semibold text-[#111111] mt-0.5">{application.department}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)]">
                  <div className="text-[11px] text-[#92908A] uppercase tracking-wider font-semibold">Year & Section</div>
                  <div className="font-semibold text-[#111111] mt-0.5">Year {application.year} • Section {application.classSection}</div>
                </div>
              </div>

              {/* Bio */}
              {application.bio && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[#92908A] mb-1.5">Student Biography</div>
                  <p className="text-xs text-[#66645F] leading-relaxed bg-[#FAF9F6] p-4 rounded-2xl border border-[rgba(17,17,17,0.06)]">
                    {application.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {application.skills && application.skills.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[#92908A] mb-2">Technical Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {application.skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.1)] text-[#111111] text-xs font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Interests */}
              {application.technicalInterests && application.technicalInterests.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[#92908A] mb-2">AI & Technical Focus</div>
                  <div className="flex flex-wrap gap-2">
                    {application.technicalInterests.map((t, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              <div className="flex flex-wrap gap-3 pt-3 border-t border-[rgba(17,17,17,0.06)]">
                {application.githubUrl && (
                  <a
                    href={application.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF9F6] hover:bg-[#EBE9E3] text-[#111111] text-xs font-semibold transition-colors border border-[rgba(17,17,17,0.08)]"
                  >
                    <Globe size={13} />
                    <span>GitHub Profile</span>
                    <ExternalLink size={11} className="text-[#92908A]" />
                  </a>
                )}
                {application.linkedinUrl && (
                  <a
                    href={application.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF9F6] hover:bg-[#EBE9E3] text-[#111111] text-xs font-semibold transition-colors border border-[rgba(17,17,17,0.08)]"
                  >
                    <Globe size={13} />
                    <span>LinkedIn Profile</span>
                    <ExternalLink size={11} className="text-[#92908A]" />
                  </a>
                )}
                {application.portfolioUrl && (
                  <a
                    href={application.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF9F6] hover:bg-[#EBE9E3] text-[#111111] text-xs font-semibold transition-colors border border-[rgba(17,17,17,0.08)]"
                  >
                    <Globe size={13} />
                    <span>Portfolio</span>
                    <ExternalLink size={11} className="text-[#92908A]" />
                  </a>
                )}
              </div>

              {/* Review History / Notes if already reviewed */}
              {(application.admin_notes || application.rejection_reason) && (
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] space-y-2 text-xs">
                  <div className="font-semibold text-[#111111] uppercase tracking-wider text-[11px]">Review Records</div>
                  {application.admin_notes && (
                    <div>
                      <span className="text-[#66645F]">Admin Notes: </span>
                      <span className="text-[#111111] font-medium">{application.admin_notes}</span>
                    </div>
                  )}
                  {application.rejection_reason && (
                    <div>
                      <span className="text-rose-700">Rejection Reason: </span>
                      <span className="text-[#111111] font-medium">{application.rejection_reason}</span>
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
        <div className="fixed inset-0 z-50 bg-[#050505]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.12)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                decisionType === 'APPROVED' 
                  ? 'bg-emerald-50 text-emerald-800' 
                  : decisionType === 'WAITLISTED'
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-rose-50 text-rose-800'
              }`}>
                {decisionType === 'APPROVED' ? <CheckCircle2 size={24} /> : decisionType === 'WAITLISTED' ? <Clock size={24} /> : <XCircle size={24} />}
              </div>
              <h3 className="text-lg font-bold text-[#111111]">
                Confirm Decision: {decisionType}
              </h3>
              <p className="text-[#66645F] text-xs">
                Candidate: <strong className="text-[#111111]">{application.fullName}</strong>
                {application.final_score !== null && (
                  <span> (Score: {application.final_score}/25 • {application.score_percentage}%)</span>
                )}
              </p>
            </div>

            {decisionType === 'APPROVED' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
                Approving this candidate will atomically create an official Club Membership record, mark their status ACTIVE, and generate their unique Member ID.
              </div>
            )}

            {decisionType === 'REJECTED' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">
                  Rejection Reason <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Assessment score below semester cutoff threshold..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.15)] text-[#111111] placeholder-[#92908A] text-xs focus:outline-none focus:border-[#111111]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111111]">
                Internal Admin Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Internal notes visible to reviewers only..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.15)] text-[#111111] placeholder-[#92908A] text-xs focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setDecisionType(null)}
                className="flex-1 py-2.5 rounded-full border border-[rgba(17,17,17,0.12)] bg-[#FAF9F6] hover:bg-[#EBE9E3] text-[#111111] font-semibold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecisionSubmit}
                disabled={isSubmitting || (decisionType === 'REJECTED' && !rejectionReason.trim())}
                className={`flex-1 py-2.5 rounded-full font-bold text-xs text-white transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                  decisionType === 'APPROVED' 
                    ? 'bg-[#050505] hover:bg-[#222222]' 
                    : decisionType === 'WAITLISTED'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
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
export default AdminApplicationDetail;
