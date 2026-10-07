import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle } from 'lucide-react';
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
      <DashboardLayout pageTitle="Membership Application">
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
      <div className="max-w-5xl mx-auto space-y-10 pb-16">
        {/* Header Hero */}
        <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[24px] p-8 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="editorial-number">ADMISSIONS WORKSPACE</span>
              <h1 className="text-[28px] md:text-[36px] font-normal tracking-[-0.03em] leading-tight text-[#111111]">
                AI CLUB Membership Selection
              </h1>
              <p className="text-[15px] text-[#66645F] mt-2 max-w-xl leading-relaxed">
                Official onboarding portal. Complete your student profile, take the 25-question technical assessment, and await evaluation from the administrative review committee.
              </p>
            </div>

            {application?.application_number && (
              <div className="bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] p-5 rounded-[16px] text-right md:text-left shrink-0">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[#92908A]">Application ID</div>
                <div className="text-[18px] font-mono font-semibold text-[#111111] mt-0.5 tracking-tight">
                  {application.application_number}
                </div>
                <div className="text-[12px] text-[#66645F] mt-1">
                  Submitted: {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'In Progress'}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-[16px] bg-[#FAF9F6] border border-[rgba(185,28,28,0.2)] text-[#b91c1c] text-sm flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 5-Step Process Timeline (Section 36) */}
        <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[24px] p-8 shadow-xs">
          <span className="editorial-number">APPLICATION MILESTONES</span>
          <h2 className="text-[18px] font-semibold text-[#111111] mb-6 tracking-tight">
            Journey to Full Membership
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Step 1: Account */}
            <div className="p-4 rounded-[16px] border border-[rgba(17,17,17,0.08)] bg-[#FAF9F6] flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#050505] text-[#FFFFFF] mb-2 text-xs font-semibold">
                ✓
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-[#111111]">01 ACCOUNT</div>
              <div className="text-[11px] text-[#15803d] font-medium mt-1">Verified</div>
            </div>

            {/* Step 2: Profile */}
            <div className="p-4 rounded-[16px] border border-[rgba(17,17,17,0.08)] bg-[#FAF9F6] flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#050505] text-[#FFFFFF] mb-2 text-xs font-semibold">
                ✓
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-[#111111]">02 PROFILE</div>
              <div className="text-[11px] text-[#15803d] font-medium mt-1">Completed</div>
            </div>

            {/* Step 3: Assessment */}
            <div className={`p-4 rounded-[16px] border flex flex-col items-center text-center ${
              currentStep > 3 
                ? 'bg-[#FAF9F6] border-[rgba(17,17,17,0.08)]' 
                : 'bg-[#FFFFFF] border-[#050505] shadow-xs'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 text-xs font-semibold ${
                currentStep > 3 ? 'bg-[#050505] text-[#FFFFFF]' : 'bg-[#EBE9E3] text-[#111111]'
              }`}>
                {currentStep > 3 ? '✓' : '●'}
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-[#111111]">03 ASSESSMENT</div>
              <div className="text-[11px] text-[#66645F] mt-1">
                {currentStep > 3 ? `${application?.final_score ?? 0}/25 Complete` : '25 Questions'}
              </div>
            </div>

            {/* Step 4: Admin Review */}
            <div className={`p-4 rounded-[16px] border flex flex-col items-center text-center ${
              currentStep > 4 
                ? 'bg-[#FAF9F6] border-[rgba(17,17,17,0.08)]' 
                : currentStep === 4 
                  ? 'bg-[#FFFFFF] border-[#050505] shadow-xs'
                  : 'bg-[#FAF9F6] border-[rgba(17,17,17,0.08)] opacity-60'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 text-xs font-semibold ${
                currentStep > 4 ? 'bg-[#050505] text-[#FFFFFF]' : currentStep === 4 ? 'bg-[#EBE9E3] text-[#111111]' : 'bg-[#EBE9E3] text-[#92908A]'
              }`}>
                {currentStep > 4 ? '✓' : currentStep === 4 ? '●' : '○'}
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-[#111111]">04 REVIEW</div>
              <div className="text-[11px] text-[#66645F] mt-1">
                {currentStep > 4 ? 'Done' : currentStep === 4 ? 'Under Review' : 'Pending'}
              </div>
            </div>

            {/* Step 5: Decision */}
            <div className={`p-4 rounded-[16px] border flex flex-col items-center text-center ${
              isApproved
                ? 'bg-[#FAF9F6] border-[#050505]'
                : status === 'WAITLISTED'
                  ? 'bg-[#FAF9F6] border-[rgba(180,83,9,0.3)]'
                  : 'bg-[#FAF9F6] border-[rgba(17,17,17,0.08)] opacity-60'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 text-xs font-semibold ${
                isApproved ? 'bg-[#050505] text-[#FFFFFF]' : 'bg-[#EBE9E3] text-[#92908A]'
              }`}>
                {isApproved ? '✓' : '○'}
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-[#111111]">05 DECISION</div>
              <div className="text-[11px] font-medium mt-1">
                {isApproved ? (
                  <span className="text-[#15803d]">Admitted</span>
                ) : status === 'WAITLISTED' ? (
                  <span className="text-[#b45309]">Waitlisted</span>
                ) : (
                  <span className="text-[#92908A]">Pending</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* State Panels */}

        {/* STATE: APPROVED MEMBER */}
        {isApproved && (
          <div className="p-8 md:p-10 rounded-[24px] bg-[#FFFFFF] border border-[rgba(17,17,17,0.1)] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-[#050505] text-[#FFFFFF] flex items-center justify-center text-xl shrink-0">
                  ✦
                </div>
                <div>
                  <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[#15803d] block mb-1">
                    MEMBER ADMISSION CONFIRMED
                  </span>
                  <h3 className="text-2xl font-normal tracking-tight text-[#111111]">
                    Welcome to AI CLUB, {user?.fullName || 'Student'}
                  </h3>
                  <p className="text-[14.5px] text-[#66645F] mt-1">
                    Your application has been approved. You now hold full privileges to courses, compute clusters, and project squads.
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] p-4 rounded-[16px] text-right sm:text-left shrink-0">
                <div className="text-[11px] text-[#92908A] uppercase font-semibold">Member Roll ID</div>
                <div className="text-[17px] font-mono font-semibold text-[#111111] mt-0.5">
                  {user?.memberNumber || application?.memberNumber || 'AIC-M-2026-ACTIVE'}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[rgba(17,17,17,0.07)] flex items-center justify-between">
              <span className="text-[13px] text-[#66645F]">Full access activated</span>
              <button
                onClick={() => navigate('/dashboard')}
                className="pill-btn h-[42px] px-6 text-sm"
              >
                Go to Workspace &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STATE: TEST REQUIRED */}
        {!isApproved && status === 'TEST_REQUIRED' && (
          <div className="p-8 md:p-10 rounded-[24px] bg-[#FFFFFF] border border-[rgba(17,17,17,0.1)] shadow-xs space-y-6">
            <div>
              <span className="editorial-number">NEXT REQUIREMENT</span>
              <h3 className="text-2xl font-normal tracking-tight text-[#111111] mb-2">
                25-Question AI &amp; Engineering Assessment
              </h3>
              <p className="text-[15px] text-[#66645F] leading-relaxed max-w-2xl">
                The entrance test evaluates conceptual foundations in Python, machine learning intuition, neural network architectures, and algorithm design. You have 30 minutes to complete 25 questions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
              <div className="p-4 rounded-[16px] bg-[#FAF9F6] border border-[rgba(17,17,17,0.07)]">
                <div className="text-[12px] text-[#92908A]">Questions</div>
                <div className="text-[18px] font-semibold text-[#111111] mt-0.5">25 Multiple Choice</div>
              </div>
              <div className="p-4 rounded-[16px] bg-[#FAF9F6] border border-[rgba(17,17,17,0.07)]">
                <div className="text-[12px] text-[#92908A]">Time Limit</div>
                <div className="text-[18px] font-semibold text-[#111111] mt-0.5">30 Minutes</div>
              </div>
              <div className="p-4 rounded-[16px] bg-[#FAF9F6] border border-[rgba(17,17,17,0.07)]">
                <div className="text-[12px] text-[#92908A]">Scoring</div>
                <div className="text-[18px] font-semibold text-[#111111] mt-0.5">Automated Server Evaluation</div>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(17,17,17,0.07)] flex items-center justify-between">
              <span className="text-[13px] text-[#66645F]">Your progress is auto-saved continuously.</span>
              <button
                onClick={() => navigate('/application/test')}
                className="pill-btn h-[44px] px-7 text-sm"
              >
                Begin Assessment &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STATE: UNDER REVIEW */}
        {!isApproved && (status === 'UNDER_REVIEW' || status === 'TEST_COMPLETED') && (
          <div className="p-8 md:p-10 rounded-[24px] bg-[#FFFFFF] border border-[rgba(17,17,17,0.1)] shadow-xs space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] flex items-center justify-center shrink-0 text-[#111111]">
                <Clock size={20} />
              </div>
              <div>
                <span className="editorial-number">REVIEW IN PROGRESS</span>
                <h3 className="text-2xl font-normal tracking-tight text-[#111111] mb-2">
                  Application Under Administrator Review
                </h3>
                <p className="text-[15px] text-[#66645F] leading-relaxed max-w-xl">
                  You scored <strong className="text-[#111111]">{application?.final_score || 0} / 25</strong> on the technical assessment. The admissions committee evaluates batches on a rolling basis. You will be notified via email upon status change.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STATE: WAITLISTED */}
        {!isApproved && status === 'WAITLISTED' && (
          <div className="p-8 md:p-10 rounded-[24px] bg-[#FFFFFF] border border-[rgba(180,83,9,0.25)] shadow-xs space-y-4">
            <span className="editorial-number">ADMISSIONS UPDATE</span>
            <h3 className="text-2xl font-normal tracking-tight text-[#b45309]">
              Application Waitlisted
            </h3>
            <p className="text-[15px] text-[#66645F] leading-relaxed max-w-xl">
              Your assessment score ({application?.final_score || 0}/25) has qualified you for our active waitlist. As cohorts scale, offers are released in order of rank.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
