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
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to Member Directory
          </button>
        </div>

        {/* Member Profile Hero */}
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800/60 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
          {member.profilePhotoUrl ? (
            <img
              src={member.profilePhotoUrl}
              alt={member.fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-accent shadow-md shadow-accent/10 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-accent/15 border-2 border-accent text-accent font-bold font-mono text-3xl flex items-center justify-center flex-shrink-0">
              {member.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">{member.fullName}</h1>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{member.registerNumber}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 self-center sm:self-start">
                <CheckCircle2 size={12} /> AI CLUB Member
              </span>
            </div>

            <div className="inline-flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-300">
              <span className="px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700">{member.department}</span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700">Year {member.year}</span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700">Section {member.classSection}</span>
              <span className="text-gray-500 flex items-center gap-1 ml-2">
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
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
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
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300 transition-colors"
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
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-accent hover:text-accent-hover transition-colors"
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
          <div className="md:col-span-2 rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-3">
            <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2">
              <User size={18} className="text-accent" /> About
            </h2>
            {member.bio ? (
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{member.bio}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">This member has not provided a bio description yet.</p>
            )}
          </div>

          {/* Technical Skills */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-3">
            <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2">
              <Layers size={18} className="text-accent" /> Technical Skills
            </h2>
            {member.skills && member.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-xs font-medium text-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No skills listed.</p>
            )}
          </div>

          {/* Technical Interests */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-3">
            <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2">
              <Award size={18} className="text-accent" /> Areas of Interest
            </h2>
            {member.technicalInterests && member.technicalInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {member.technicalInterests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-xs font-medium text-accent"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No interests listed.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
