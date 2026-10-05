import { useState, useEffect } from 'react';
import { projectTeamService } from '../services/content/projectTeamService';
import type { ProjectTeam } from '../data/projectTeams';
import { authService } from '../services/authService';
import { Users, Plus, Shield, User } from 'lucide-react';
import { StateView } from './common/StateView';

interface Props {
  projectId: string;
  projectStatus: string;
}

export const ProjectTeamsSection = ({ projectId, projectStatus }: Props) => {
  const [teams, setTeams] = useState<ProjectTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ name: '', description: '', maxMembers: 4 });
  const [creating, setCreating] = useState(false);
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isClosed = projectStatus === 'Completed' || projectStatus === 'Archived';
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectTeamService.getProjectTeams(projectId);
      setTeams(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [projectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      setCreating(true);
      await projectTeamService.createTeam(projectId, {
        name: createData.name,
        description: createData.description,
        maxMembers: createData.maxMembers
      });
      setShowCreateModal(false);
      setCreateData({ name: '', description: '', maxMembers: 4 });
      await fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (teamId: string) => {
    if (!isAuthenticated) return;
    try {
      setActionLoading(teamId);
      await projectTeamService.joinTeam(teamId);
      await fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Failed to join team');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (teamId: string) => {
    if (!isAuthenticated) return;
    // @ts-ignore
    if (!window.__E2E_TEST__ && !window.confirm("Are you sure you want to leave this team?")) return;
    try {
      setActionLoading(teamId);
      await projectTeamService.leaveTeam(teamId);
      await fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Failed to leave team');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <section className="detail-section mt-8 border-t border-[var(--border-color)] pt-8">
      <div className="flex-between mb-6">
        <div>
          <h3 className="text-xl font-bold tracking-wider text-[var(--accent-color)] mb-1">TEAM FORMATION</h3>
          <p className="text-[var(--text-muted)] text-sm">Join an existing team or form a new one to work on this project.</p>
        </div>
        {isAuthenticated && !isClosed && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} className="mr-2" /> Create Team
          </button>
        )}
      </div>

      <StateView 
        loading={loading}
        error={error}
        empty={teams.length === 0}
        emptyMessage="No teams have been formed for this project yet."
        retry={fetchTeams}
      >
        <div className="space-y-4">
          {teams.map(team => {
            const isFull = team.max_members && parseInt(team.member_count) >= team.max_members;
            const isMember = team.currentStudentMembership != null;
            
            return (
              <div key={team.id} className="card p-5 border border-[var(--border-color)] bg-[var(--surface-color)]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold mb-1">{team.name}</h4>
                    {team.description && <p className="text-sm text-[var(--text-muted)] mb-3">{team.description}</p>}
                  </div>
                  <span className={`status-badge status-${team.status.toLowerCase()}`}>
                    {team.status}
                  </span>
                </div>
                
                <div className="flex-between items-center mt-4">
                  <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Users size={14} /> 
                      {team.member_count} {team.max_members ? `/ ${team.max_members}` : ''} members
                    </span>
                    {team.members && team.members.some(m => m.role === 'leader') && (
                      <span className="flex items-center gap-1">
                        <Shield size={14} className="text-[var(--accent-color)]" />
                        Leader: {team.members.find(m => m.role === 'leader')?.full_name}
                      </span>
                    )}
                  </div>
                  
                  {isAuthenticated && (
                    <div>
                      {isMember ? (
                        <button 
                          className="btn btn-outline border-red-500 text-red-500 hover:bg-red-500/10"
                          onClick={() => handleLeave(team.id)}
                          disabled={actionLoading === team.id}
                        >
                          {actionLoading === team.id ? 'Leaving...' : 'Leave Team'}
                        </button>
                      ) : (
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleJoin(team.id)}
                          disabled={isFull || actionLoading === team.id || isClosed || team.status === 'closed'}
                        >
                          {actionLoading === team.id ? 'Joining...' : (isFull ? 'Team Full' : 'Join Team')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Members list compact */}
                {team.members && team.members.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex flex-wrap gap-2">
                    {team.members.map(member => (
                      <div key={member.member_id} className="flex items-center gap-2 bg-[var(--bg-color)] px-3 py-1.5 rounded-full text-xs border border-[var(--border-color)]">
                        <User size={12} className={member.role === 'leader' ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'} />
                        <span className={member.member_id === user?.id ? 'font-bold' : ''}>{member.full_name}</span>
                        {member.role === 'leader' && <span className="text-[10px] text-[var(--accent-color)] uppercase tracking-wider ml-1">LEADER</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </StateView>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="mb-4 text-xl">Create a Team</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group mb-4">
                <label className="form-label">Team Name</label>
                <input 
                  type="text" 
                  className="form-input w-full" 
                  value={createData.name} 
                  onChange={e => setCreateData({...createData, name: e.target.value})}
                  required 
                  minLength={3}
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Description (optional)</label>
                <textarea 
                  className="form-input w-full" 
                  value={createData.description} 
                  onChange={e => setCreateData({...createData, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="form-group mb-6">
                <label className="form-label">Maximum Members (optional)</label>
                <input 
                  type="number" 
                  className="form-input w-full" 
                  value={createData.maxMembers} 
                  onChange={e => setCreateData({...createData, maxMembers: parseInt(e.target.value)})}
                  min={2}
                  max={50}
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)} disabled={creating}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
