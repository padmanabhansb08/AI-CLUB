import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Shield,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Trash2,
} from 'lucide-react';
import type { TeamItem, TeamMemberItem } from '../../types/projects';
import { projectsApi } from '../../api/projects.api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  projectId: string;
  projectStatus: string;
  canCreateTeam?: boolean;
}

export const TeamManagementSection: React.FC<Props> = ({
  projectId,
  projectStatus,
  canCreateTeam = true,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Team Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ name: '', description: '', max_members: 4 });
  const [creating, setCreating] = useState(false);

  // Invite Member Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitingTeamId, setInvitingTeamId] = useState<string | null>(null);
  const [candidateMembers, setCandidateMembers] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [inviting, setInviting] = useState(false);

  // Action loading state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isClosed = projectStatus === 'COMPLETED' || projectStatus === 'ARCHIVED' || projectStatus === 'CANCELLED';

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getProjectTeams(projectId);
      setTeams(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [projectId]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      setCreating(true);
      await projectsApi.createTeam(projectId, {
        name: createData.name,
        description: createData.description || undefined,
        max_members: Number(createData.max_members) || 4,
      });
      setShowCreateModal(false);
      setCreateData({ name: '', description: '', max_members: 4 });
      await fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      setActionLoading(`join-${teamId}`);
      await projectsApi.joinTeam(teamId);
      await fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Failed to join team');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to leave this team?')) return;
    try {
      setActionLoading(`leave-${teamId}`);
      await projectsApi.leaveTeam(teamId);
      await fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Failed to leave team');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenInvite = async (teamId: string) => {
    setInvitingTeamId(teamId);
    setShowInviteModal(true);
    try {
      // Fetch members of this project to invite
      const projectMembers = await projectsApi.getProjectMembers(projectId, 'ACTIVE');
      setCandidateMembers(projectMembers);
      if (projectMembers.length > 0) {
        setSelectedCandidateId(projectMembers[0].member_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitingTeamId || !selectedCandidateId) return;

    try {
      setInviting(true);
      await projectsApi.inviteToTeam(invitingTeamId, selectedCandidateId);
      alert('Team invitation sent successfully!');
      setShowInviteModal(false);
      setSelectedCandidateId('');
    } catch (err: any) {
      alert(err.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleDisbandTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to disband "${teamName}"? This action cannot be undone.`)) return;
    try {
      setActionLoading(`disband-${teamId}`);
      await projectsApi.deleteTeam(teamId);
      await fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Failed to disband team');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (teamId: string, memberId: string, newRole: string) => {
    try {
      await projectsApi.updateTeamMemberRole(teamId, memberId, newRole);
      await fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Failed to update member role');
    }
  };

  return (
    <div className="teams-collaboration-section mt-8 pt-8 border-t border-[var(--border-color, #334155)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Team Collaboration & Pods
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-normal">
              {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
            </span>
          </h3>
          <p className="text-sm text-[var(--text-muted, #94a3b8)]">
            Form collaborative squads, join active teams, or collaborate on tasks.
          </p>
        </div>

        {isAuthenticated && !isClosed && canCreateTeam && (
          <button
            type="button"
            className="btn btn-primary flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} /> Create Team Pod
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted, #94a3b8)]">
          Loading project teams...
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      ) : teams.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
          <Users size={32} className="mx-auto mb-2 text-[var(--text-muted, #64748b)]" />
          <h4 className="text-base font-bold text-white mb-1">No Teams Formed Yet</h4>
          <p className="text-xs text-[var(--text-muted, #94a3b8)] max-w-sm mx-auto mb-4">
            Be the first to step up! Create a team pod, invite peers, and start collaborating on this project.
          </p>
          {isAuthenticated && !isClosed && (
            <button
              type="button"
              className="btn btn-sm btn-primary inline-flex items-center gap-1.5"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={14} /> Form the First Team
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => {
            const memberCount = Number(team.member_count ?? team.members?.length ?? 0);
            const maxMembers = team.max_members || 5;
            const isFull = memberCount >= maxMembers || team.status === 'FULL';
            const isMember = Boolean(team.current_student_role);
            const isLeader = team.current_student_role === 'TEAM_LEAD' || user?.role === 'admin';

            return (
              <div
                key={team.id}
                className="p-5 rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] flex flex-col justify-between"
              >
                <div>
                  {/* Team Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-base font-bold text-white">{team.name}</h4>
                      {team.description && (
                        <p className="text-xs text-[var(--text-muted, #94a3b8)] mt-1">
                          {team.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        isFull
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isFull ? 'FULL' : 'OPEN'}
                    </span>
                  </div>

                  {/* Capacity & Lead Badge */}
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted, #94a3b8)] mb-4">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      <strong className="text-white">{memberCount}</strong> / {maxMembers} Members
                    </span>
                    {team.team_lead_name && (
                      <span className="flex items-center gap-1">
                        <Shield size={14} className="text-[var(--accent-color, #6366f1)]" />
                        Lead: <strong className="text-white">{team.team_lead_name}</strong>
                      </span>
                    )}
                  </div>

                  {/* Member Roster Chips */}
                  {team.members && team.members.length > 0 && (
                    <div className="space-y-2 mb-4 pt-3 border-t border-white/5">
                      <span className="text-[11px] font-semibold text-[var(--text-muted, #64748b)] uppercase tracking-wider block">
                        Team Roster
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {team.members.map((member: TeamMemberItem) => {
                          const isCurrentLead = member.role === 'TEAM_LEAD' || member.role === 'leader';
                          return (
                            <div
                              key={member.member_id}
                              className="px-2.5 py-1 rounded-lg text-xs bg-black/20 border border-white/10 flex items-center gap-1.5"
                            >
                              <User size={12} className={isCurrentLead ? 'text-[var(--accent-color)]' : 'text-slate-400'} />
                              <span className="text-white font-medium">{member.full_name}</span>
                              <span className="text-[10px] text-[var(--text-muted, #94a3b8)] font-mono">
                                ({member.role.replace(/_/g, ' ')})
                              </span>

                              {isLeader && !isCurrentLead && (
                                <select
                                  className="text-[10px] bg-transparent text-[var(--accent-color)] border-0 cursor-pointer ml-1"
                                  value={member.role}
                                  onChange={(e) => handleRoleChange(team.id, member.member_id, e.target.value)}
                                  title="Change Role"
                                >
                                  <option value="DEVELOPER">Dev</option>
                                  <option value="ML_ENGINEER">ML</option>
                                  <option value="DESIGNER">Design</option>
                                  <option value="RESEARCHER">Research</option>
                                  <option value="TEAM_LEAD">Make Lead</option>
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Action Bar */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isLeader && (
                      <>
                        <button
                          type="button"
                          className="btn btn-xs btn-outline flex items-center gap-1"
                          onClick={() => handleOpenInvite(team.id)}
                          title="Invite project member to this squad"
                        >
                          <UserPlus size={13} /> Invite
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs text-red-400 hover:bg-red-500/10 p-1 rounded"
                          onClick={() => handleDisbandTeam(team.id, team.name)}
                          title="Disband squad"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>

                  <div>
                    {isMember ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline text-red-400 hover:bg-red-500/10 border-red-500/30 flex items-center gap-1.5"
                        onClick={() => handleLeaveTeam(team.id)}
                        disabled={actionLoading === `leave-${team.id}`}
                      >
                        <LogOut size={14} />
                        {actionLoading === `leave-${team.id}` ? 'Leaving...' : 'Leave Team'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary flex items-center gap-1.5"
                        onClick={() => handleJoinTeam(team.id)}
                        disabled={isFull || isClosed || actionLoading === `join-${team.id}`}
                      >
                        <LogIn size={14} />
                        {actionLoading === `join-${team.id}` ? 'Joining...' : isFull ? 'Team Full' : 'Join Pod'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-backdrop fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="modal-content w-full max-w-md bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Form a Team Pod</h3>
            <p className="text-xs text-[var(--text-muted, #94a3b8)] mb-4">
              You will automatically become the initial Team Lead of this pod.
            </p>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                  placeholder="e.g. Vision Odometry Unit"
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1">
                  Pod Focus / Mission (optional)
                </label>
                <textarea
                  rows={3}
                  className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                  placeholder="What aspect will this squad tackle?"
                  value={createData.description}
                  onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1">
                  Maximum Pod Members (2 - 20)
                </label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                  value={createData.max_members}
                  onChange={(e) => setCreateData({ ...createData, max_members: parseInt(e.target.value, 10) || 4 })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  className="btn btn-outline text-sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-sm"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Form Team Pod'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-backdrop fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="modal-content w-full max-w-md bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Invite Member to Pod</h3>
            <p className="text-xs text-[var(--text-muted, #94a3b8)] mb-4">
              Select an active project contributor to send an invitation.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1">
                  Select Project Member
                </label>
                {candidateMembers.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted, #94a3b8)]">
                    No active contributors available to invite.
                  </p>
                ) : (
                  <select
                    className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                    value={selectedCandidateId}
                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                  >
                    {candidateMembers.map((m) => (
                      <option key={m.member_id} value={m.member_id}>
                        {m.full_name} ({m.department} - Year {m.year})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  className="btn btn-outline text-sm"
                  onClick={() => setShowInviteModal(false)}
                  disabled={inviting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-sm"
                  disabled={inviting || candidateMembers.length === 0}
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
