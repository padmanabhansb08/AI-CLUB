import { confirmAction } from '../../services/confirmation';
import { useDialog } from '../../hooks/useDialog';
import { notifyError } from '../../services/actionFeedback';
import React, { useState } from 'react';
import { User, Check, X, Shield, Trash2 } from 'lucide-react';
import type { ProjectMembershipItem } from '../../types/projects';
import { projectsApi } from '../../api/projects.api';

interface Props {
  projectId: string;
  members: ProjectMembershipItem[];
  canManage: boolean;
  onClose: () => void;
  onMembersUpdated: () => void;
}

export const ProjectMembersModal: React.FC<Props> = ({
  projectId,
  members,
  canManage,
  onClose,
  onMembersUpdated,
}) => {
  const dialogRef = useDialog(true, onClose);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredMembers = members.filter((m) => {
    if (filter === 'ALL') return true;
    return m.status === filter;
  });

  const handleApprove = async (memberId: string) => {
    try {
      setActionLoading(memberId);
      await projectsApi.updateProjectMembership(projectId, memberId, {
        status: 'ACTIVE',
      });
      onMembersUpdated();
    } catch (err: any) {
      notifyError(err.message || 'Failed to approve member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (memberId: string) => {
    try {
      setActionLoading(memberId);
      await projectsApi.updateProjectMembership(projectId, memberId, {
        status: 'REJECTED',
      });
      onMembersUpdated();
    } catch (err: any) {
      notifyError(err.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (memberId: string, name?: string) => {
    if (!await confirmAction(`Are you sure you want to remove ${name || 'this contributor'} from the project?`)) return;
    try {
      setActionLoading(memberId);
      await projectsApi.removeProjectMember(projectId, memberId);
      onMembersUpdated();
    } catch (err: any) {
      notifyError(err.message || 'Failed to remove member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      setActionLoading(memberId);
      await projectsApi.updateProjectMembership(projectId, memberId, {
        status: 'ACTIVE',
        role: newRole,
      });
      onMembersUpdated();
    } catch (err: any) {
      notifyError(err.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Project members" tabIndex={-1} className="modal-content w-full max-w-2xl bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] rounded-2xl p-6 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">Project Members & Contributors</h3>
            <p className="text-xs text-[var(--text-muted, #94a3b8)]">
              {members.length} total participants in this project.
            </p>
          </div>
          <button
            type="button"
            className="text-[var(--text-muted, #94a3b8)] hover:text-white p-1 rounded"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === 'ALL'
                ? 'bg-[var(--accent-color, #6366f1)] text-white font-medium'
                : 'bg-white/5 text-[var(--text-muted, #94a3b8)] hover:text-white'
            }`}
            onClick={() => setFilter('ALL')}
          >
            All ({members.length})
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === 'ACTIVE'
                ? 'bg-[var(--accent-color, #6366f1)] text-white font-medium'
                : 'bg-white/5 text-[var(--text-muted, #94a3b8)] hover:text-white'
            }`}
            onClick={() => setFilter('ACTIVE')}
          >
            Active ({members.filter((m) => m.status === 'ACTIVE').length})
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === 'PENDING'
                ? 'bg-[var(--accent-color, #6366f1)] text-white font-medium'
                : 'bg-white/5 text-[var(--text-muted, #94a3b8)] hover:text-white'
            }`}
            onClick={() => setFilter('PENDING')}
          >
            Join Requests ({members.filter((m) => m.status === 'PENDING').length})
          </button>
        </div>

        {/* Member List Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-muted, #94a3b8)]">
              No members found matching this filter.
            </div>
          ) : (
            filteredMembers.map((m) => {
              const isPending = m.status === 'PENDING';
              const isOwner = m.role === 'OWNER';

              return (
                <div
                  key={m.member_id}
                  className="p-3.5 rounded-xl border border-[var(--border-color, #334155)] bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-white/10">
                      {m.profile_photo_url ? (
                        <img
                          src={m.profile_photo_url}
                          alt={m.full_name || 'Member'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={18} className="text-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{m.full_name}</h4>
                        {isOwner && (
                          <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Shield size={10} /> OWNER
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${
                            m.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-muted, #94a3b8)]">
                        {m.department} &middot; Year {m.year} &middot;{' '}
                        <span className="font-mono">{m.register_number}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {canManage && isPending ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-xs btn-primary flex items-center gap-1"
                          onClick={() => handleApprove(m.member_id)}
                          disabled={actionLoading === m.member_id}
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs text-red-400 hover:bg-red-500/10 border border-red-500/30 flex items-center gap-1"
                          onClick={() => handleReject(m.member_id)}
                          disabled={actionLoading === m.member_id}
                        >
                          <X size={12} /> Reject
                        </button>
                      </>
                    ) : canManage && !isOwner ? (
                      <>
                        <select
                          className="text-xs px-2 py-1 rounded bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] text-white focus:outline-none"
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.member_id, e.target.value)}
                          disabled={actionLoading === m.member_id}
                        >
                          <option value="CONTRIBUTOR">Contributor</option>
                          <option value="LEAD">Lead</option>
                          <option value="MENTOR">Mentor</option>
                          <option value="MEMBER">Member</option>
                        </select>

                        <button
                          type="button"
                          className="p-1.5 rounded text-[var(--text-muted, #94a3b8)] hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleRemove(m.member_id, m.full_name)}
                          disabled={actionLoading === m.member_id}
                          title="Remove contributor"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-[var(--text-muted, #94a3b8)] font-medium">
                        {m.role}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
