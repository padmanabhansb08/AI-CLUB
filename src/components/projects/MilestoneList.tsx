import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Plus, Trash2, Edit3, Calendar } from 'lucide-react';
import type { ProjectMilestoneItem } from '../../types/projects';
import { projectsApi } from '../../api/projects.api';

interface Props {
  projectId: string;
  milestones: ProjectMilestoneItem[];
  canManage?: boolean;
  onMilestonesUpdated: () => void;
}

export const MilestoneList: React.FC<Props> = ({
  projectId,
  milestones,
  canManage = false,
  onMilestonesUpdated,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestoneItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'TODO' as 'TODO' | 'IN_PROGRESS' | 'COMPLETED',
  });
  const [submitting, setSubmitting] = useState(false);

  const completedCount = milestones.filter((m) => m.status === 'COMPLETED').length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const handleOpenAdd = () => {
    setFormData({ title: '', description: '', due_date: '', status: 'TODO' });
    setEditingMilestone(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (m: ProjectMilestoneItem) => {
    setFormData({
      title: m.title,
      description: m.description || '',
      due_date: m.due_date ? m.due_date.substring(0, 10) : '',
      status: m.status as any,
    });
    setEditingMilestone(m);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSubmitting(true);
      const payload: any = {
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      };

      if (editingMilestone) {
        await projectsApi.updateMilestone(editingMilestone.id, payload);
      } else {
        await projectsApi.createMilestone(projectId, payload);
      }

      setShowAddModal(false);
      onMilestonesUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to save milestone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete milestone: "${title}"?`)) return;
    try {
      await projectsApi.deleteMilestone(id);
      onMilestonesUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete milestone');
    }
  };

  const handleQuickStatusToggle = async (m: ProjectMilestoneItem) => {
    if (!canManage) return;
    const nextStatus = m.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await projectsApi.updateMilestone(m.id, { status: nextStatus });
      onMilestonesUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="milestones-section">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Project Milestones
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-normal">
              {completedCount} / {milestones.length} Done ({progressPercent}%)
            </span>
          </h3>
          <p className="text-xs text-[var(--text-muted, #94a3b8)]">
            Roadmap, key deliverables, and development checkpoints.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            className="btn btn-sm btn-primary flex items-center gap-1.5"
            onClick={handleOpenAdd}
          >
            <Plus size={14} /> Add Milestone
          </button>
        )}
      </div>

      {milestones.length === 0 ? (
        <div className="p-6 text-center rounded-lg border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] text-[var(--text-muted, #94a3b8)] text-sm">
          No milestones defined for this project yet.
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((m, idx) => {
            const isCompleted = m.status === 'COMPLETED';
            const isInProgress = m.status === 'IN_PROGRESS';

            return (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] flex items-start justify-between gap-4 transition-all hover:border-[var(--border-hover, #475569)]"
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => handleQuickStatusToggle(m)}
                    disabled={!canManage}
                    className={`mt-0.5 transition-colors ${
                      canManage ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                    }`}
                    title={canManage ? 'Click to toggle status' : undefined}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    ) : isInProgress ? (
                      <Clock size={20} className="text-blue-400" />
                    ) : (
                      <Circle size={20} className="text-[var(--text-muted, #64748b)]" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-[var(--text-muted, #64748b)] font-mono">
                        #{idx + 1}
                      </span>
                      <h4
                        className={`text-sm font-semibold text-white ${
                          isCompleted ? 'line-through text-[var(--text-muted, #94a3b8)]' : ''
                        }`}
                      >
                        {m.title}
                      </h4>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isInProgress
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-white/5 text-[var(--text-muted, #94a3b8)] border border-white/10'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    {m.description && (
                      <p className="text-xs text-[var(--text-muted, #94a3b8)] mb-2">
                        {m.description}
                      </p>
                    )}

                    {m.due_date && (
                      <div className="text-[11px] text-[var(--text-muted, #64748b)] flex items-center gap-1">
                        <Calendar size={12} /> Target Due:{' '}
                        {new Date(m.due_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="p-1.5 rounded text-[var(--text-muted, #94a3b8)] hover:text-white hover:bg-white/5"
                      onClick={() => handleOpenEdit(m)}
                      title="Edit Milestone"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded text-[var(--text-muted, #94a3b8)] hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDelete(m.id, m.title)}
                      title="Delete Milestone"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Milestone Modal */}
      {showAddModal && (
        <div className="modal-backdrop fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="modal-content w-full max-w-md bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingMilestone ? 'Edit Milestone' : 'Add Project Milestone'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                  placeholder="e.g. Implement Transformer Attention Layer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                  placeholder="Key acceptance criteria or deliverables..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1">
                    Status
                  </label>
                  <select
                    className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  className="btn btn-outline text-sm"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingMilestone ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
