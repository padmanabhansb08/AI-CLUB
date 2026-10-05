import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectTeamService } from '../services/content/projectTeamService';
import type { ProjectTeam } from '../data/projectTeams';
import { authService } from '../services/authService';
import { Users, ChevronRight } from 'lucide-react';
import { StateView } from './common/StateView';

export const MyProjectTeams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<ProjectTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const isAuthenticated = authService.isAuthenticated();

  const fetchTeams = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await projectTeamService.getMyTeams();
      setTeams(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  if (!loading && !error && teams.length === 0) return null; // Only show if they have teams, or if loading/error

  return (
    <div className="mb-8 border border-[var(--border-color)] rounded-xl bg-[var(--surface-color)] p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="text-[var(--accent-color)]" size={20} />
        My Project Teams
      </h3>
      
      <StateView 
        loading={loading}
        error={error}
        empty={teams.length === 0}
        emptyMessage="You are not part of any project teams yet."
        retry={fetchTeams}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <div 
              key={team.id} 
              className="card p-4 border border-[var(--border-color)] bg-[var(--bg-color)] cursor-pointer hover:border-[var(--accent-color)] transition-colors"
              onClick={() => navigate(`/projects/${team.project_id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`status-badge status-${team.status.toLowerCase()}`}>
                  {team.status}
                </span>
                <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] border border-[var(--border-color)] px-2 py-0.5 rounded">
                  {team.role}
                </span>
              </div>
              
              <h4 className="font-bold text-lg mb-1 truncate">{team.name}</h4>
              <p className="text-sm text-[var(--text-muted)] truncate mb-3">{team.project_title}</p>
              
              <div className="flex justify-between items-center text-sm text-[var(--text-muted)] pt-3 border-t border-[var(--border-color)]">
                <span className="flex items-center gap-1">
                  <Users size={14} /> 
                  {team.member_count} {team.max_members ? `/ ${team.max_members}` : ''}
                </span>
                <span className="flex items-center text-[var(--accent-color)] group-hover:underline">
                  View Project <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </StateView>
    </div>
  );
};
