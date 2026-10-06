import React, { useState, useEffect } from 'react';
import { Mail, Check, X } from 'lucide-react';
import type { TeamInvitationItem } from '../../types/projects';
import { projectsApi } from '../../api/projects.api';

interface Props {
  onInvitationsChanged?: () => void;
}

export const TeamInvitationsBanner: React.FC<Props> = ({ onInvitationsChanged }) => {
  const [invitations, setInvitations] = useState<TeamInvitationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getMyInvitations();
      setInvitations(data);
    } catch (err) {
      console.error('Failed to fetch my invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRespond = async (invitationId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      setActionLoading(invitationId);
      await projectsApi.respondToInvitation(invitationId, action);
      await fetchInvitations();
      if (onInvitationsChanged) onInvitationsChanged();
    } catch (err: any) {
      alert(err.message || `Failed to ${action.toLowerCase()} invitation`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || invitations.length === 0) return null;

  return (
    <div className="mb-6 p-4 rounded-xl border border-[var(--accent-color, #6366f1)]/40 bg-[var(--accent-color, #6366f1)]/10">
      <div className="flex items-center gap-2 mb-3 text-[var(--accent-color, #6366f1)] font-bold text-sm">
        <Mail size={16} />
        <span>You Have {invitations.length} Pending Team {invitations.length === 1 ? 'Invitation' : 'Invitations'}</span>
      </div>

      <div className="space-y-2">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="p-3 rounded-lg bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{inv.team_name}</span>
                {inv.project_title && (
                  <span className="text-xs text-[var(--text-muted, #94a3b8)]">
                    &middot; for project: <strong className="text-slate-300">{inv.project_title}</strong>
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted, #94a3b8)] mt-0.5">
                Invited by {inv.inviter_name || 'Team Lead'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                className="btn btn-xs btn-primary flex items-center gap-1"
                onClick={() => handleRespond(inv.id, 'ACCEPT')}
                disabled={actionLoading === inv.id}
              >
                <Check size={12} /> Accept
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline text-red-400 hover:bg-red-500/10 border-red-500/30 flex items-center gap-1"
                onClick={() => handleRespond(inv.id, 'DECLINE')}
                disabled={actionLoading === inv.id}
              >
                <X size={12} /> Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
