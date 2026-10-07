import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { membersApi } from '../api/members.api';
import type { PublicMember } from '../types/member';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { 
  User, 
  ArrowLeft, 
  Link as LinkIcon, 
  Layers, 
  Award, 
  ExternalLink,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<PublicMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMember = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await membersApi.getPublicMemberById(id);
      setMember(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load member profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout pageTitle="Member Profile">
        <LoadingState message="Loading member profile..." fullScreen={false} />
      </DashboardLayout>
    );
  }

  if (error || !member) {
    return (
      <DashboardLayout pageTitle="Member Profile">
        <ErrorState message={error || 'Member not found'} onRetry={fetchMember} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle={`${member.fullName} — Member Profile`}>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate('/members')}
            className="flex items-center gap-1.5 text-xs text-[#66645F] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft size={16} /> Back to Member Directory
          </button>
        </div>

        {/* Member Profile Hero */}
        <div className="rounded-3xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
          {member.profilePhotoUrl ? (
            <img
              src={member.profilePhotoUrl}
              alt={member.fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-[#111111] shadow-sm flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FAF9F6] border-2 border-[#111111] text-[#111111] font-bold font-mono text-3xl flex items-center justify-center flex-shrink-0">
              {member.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">{member.fullName}</h1>
                <p className="text-xs font-mono text-[#66645F] mt-0.5">{member.registerNumber}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 self-center sm:self-start">
                <CheckCircle2 size={12} /> AI CLUB Member
              </span>
            </div>

            <div className="inline-flex flex-wrap items-center gap-2 pt-1 text-xs text-[#66645F]">
              <span className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[#111111] font-medium">{member.department}</span>
              <span className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[#111111] font-medium">Year {member.year}</span>
              <span className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[#111111] font-medium">Section {member.classSection}</span>
              <span className="text-[#92908A] flex items-center gap-1 ml-2">
                <Calendar size={12} /> Joined {new Date(member.joinedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Social Links */}
            {(member.githubUrl || member.linkedinUrl || member.portfolioUrl) && (
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
                {member.githubUrl && (
                  <a
                    href={member.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] hover:bg-[#EBE9E3] text-[#111111] transition-colors"
                    title="GitHub Profile"
                  >
                    <LinkIcon size={16} />
                  </a>
                )}
                {member.linkedinUrl && (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] hover:bg-[#EBE9E3] text-[#111111] transition-colors"
                    title="LinkedIn Profile"
                  >
                    <LinkIcon size={16} />
                  </a>
                )}
                {member.portfolioUrl && (
                  <a
                    href={member.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] hover:bg-[#EBE9E3] text-[#111111] transition-colors"
                    title="Personal Portfolio"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About / Bio */}
          <div className="md:col-span-2 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 space-y-3 shadow-sm">
            <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
              <User size={18} className="text-[#111111]" /> About
            </h2>
            {member.bio ? (
              <p className="text-sm text-[#66645F] leading-relaxed whitespace-pre-line">{member.bio}</p>
            ) : (
              <p className="text-sm text-[#92908A] italic">This member has not provided a bio description yet.</p>
            )}
          </div>

          {/* Technical Skills */}
          <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 space-y-3 shadow-sm">
            <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
              <Layers size={18} className="text-[#111111]" /> Technical Skills
            </h2>
            {member.skills && member.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-xs font-medium text-[#111111]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#92908A] italic">No skills listed.</p>
            )}
          </div>

          {/* Technical Interests */}
          <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 space-y-3 shadow-sm">
            <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
              <Award size={18} className="text-[#111111]" /> Areas of Interest
            </h2>
            {member.technicalInterests && member.technicalInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {member.technicalInterests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3.5 py-1.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.1)] text-xs font-medium text-[#111111]"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#92908A] italic">No interests listed.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default MemberDetail;
