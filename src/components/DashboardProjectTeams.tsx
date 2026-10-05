import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectTeamService } from '../services/content/projectTeamService';
import type { ProjectTeam } from '../data/projectTeams';
import { authService } from '../services/authService';
import { Users } from 'lucide-react';

export const DashboardProjectTeams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<ProjectTeam[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      projectTeamService.getMyTeams()
        .then(setTeams)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  if (loading) return null;

  return (
    <div className="bg-dark-card border border-[var(--border-color)] p-4 rounded-lg flex items-center justify-between mt-4">
      <div className="flex items-center gap-3">
        <div className="bg-[var(--accent-color)]/10 text-[var(--accent-color)] p-2 rounded-lg">
          <Users size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-[var(--text-color)]">PROJECT TEAMS</h4>
          <p className="text-xs text-[var(--text-muted)]">
            {teams.length > 0 
              ? `${teams.length} active ${teams.length === 1 ? 'team' : 'teams'}`
              : "You're not part of a project team yet."}
          </p>
        </div>
      </div>
      
      <button 
        className="btn btn-outline text-xs px-3 py-1.5"
        onClick={() => navigate('/projects')}
      >
        {teams.length > 0 ? 'View Teams' : 'Explore Projects'}
      </button>
    </div>
  );
};
