import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StateView } from '../components/common/StateView';
import { memberService } from '../services/content/memberService';

export const MemberDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (id) fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await memberService.getPublicMemberById(id!);
      setMember(res.data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/members" className="text-sm font-mono text-gray-500 hover:text-gray-300 uppercase tracking-widest inline-flex items-center gap-2">
        &larr; Back to Directory
      </Link>

      <StateView loading={loading} error={error}>
        {member && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-100 mb-2">{member.full_name}</h1>
                  <div className="text-lg font-mono text-blue-400 mb-6">
                    {member.department} • Year {member.year} {member.class_section ? `• Sec ${member.class_section}` : ''}
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap max-w-2xl leading-relaxed">
                    {member.bio || 'No bio provided.'}
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  {member.github_url && (
                    <a href={member.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                      <span className="font-mono text-sm">GitHub</span>
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      <span className="font-mono text-sm">LinkedIn</span>
                    </a>
                  )}
                  {member.portfolio_url && (
                    <a href={member.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                      <span className="font-mono text-sm">Portfolio</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Technical Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-100 mb-4 font-mono uppercase tracking-widest border-b border-gray-800 pb-2">Skills</h3>
                {member.skills && member.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((s: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">No skills listed</p>
                )}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-100 mb-4 font-mono uppercase tracking-widest border-b border-gray-800 pb-2">Technical Interests</h3>
                {member.technical_interests && member.technical_interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {member.technical_interests.map((t: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-blue-900/20 border border-blue-800/30 text-blue-300 text-sm rounded-md font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">No interests listed</p>
                )}
              </div>
            </div>

            {/* Achievements & Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-100 mb-4 font-mono uppercase tracking-widest border-b border-gray-800 pb-2">Selected Achievements</h3>
                {member.achievements && member.achievements.length > 0 ? (
                  <ul className="space-y-4">
                    {member.achievements.map((ach: any) => (
                      <li key={ach.id} className="border-l-2 border-blue-600 pl-4 py-1">
                        <div className="font-medium text-gray-200">{ach.title}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          {ach.category} {ach.year ? `• ${ach.year}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic text-sm">No achievements listed</p>
                )}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-100 mb-4 font-mono uppercase tracking-widest border-b border-gray-800 pb-2">Active Project Teams</h3>
                {member.project_teams && member.project_teams.length > 0 ? (
                  <ul className="space-y-4">
                    {member.project_teams.map((pt: any) => (
                      <li key={pt.team_name} className="border-l-2 border-gray-700 pl-4 py-1">
                        <Link to={`/projects/${pt.project_id}`} className="font-medium text-gray-200 hover:text-blue-400 transition-colors">
                          {pt.project_title}
                        </Link>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          Team: {pt.team_name} • Role: <span className="uppercase">{pt.role}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic text-sm">Not currently in any active project teams</p>
                )}
              </div>
            </div>
          </div>
        )}
      </StateView>
    </div>
  );
};
