import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { projectsApi } from '../../api/projects.api';
import type { ProjectItem, TeamItem } from '../../types/projects';
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge';
import { ProjectDomainBadge } from '../../components/projects/ProjectDomainBadge';
import { ProjectDifficultyBadge } from '../../components/projects/ProjectDifficultyBadge';
import { ProjectFormModal } from '../../components/projects/ProjectFormModal';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  Send,
  Layers,
  X,
} from 'lucide-react';

export const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  // Inspect Teams State
  const [inspectingProject, setInspectingProject] = useState<ProjectItem | null>(null);
  const [projectTeams, setProjectTeams] = useState<TeamItem[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectsApi.getProjects({
        search: searchTerm.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        limit: 100,
      });
      setProjects(res.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, statusFilter]);

  const handleAdd = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (proj: ProjectItem) => {
    setEditingProject(proj);
    setIsFormOpen(true);
  };

  const handlePublish = async (proj: ProjectItem) => {
    try {
      await projectsApi.publishProject(proj.id);
      await fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to publish project');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete project "${title}"?\nThis will remove all associated teams, milestones, and memberships.`)) {
      try {
        await projectsApi.deleteProject(id);
        await fetchProjects();
      } catch (err: any) {
        alert(err.message || 'Failed to delete project');
      }
    }
  };

  const handleInspectTeams = async (proj: ProjectItem) => {
    setInspectingProject(proj);
    setLoadingTeams(true);
    try {
      const teams = await projectsApi.getProjectTeams(proj.id);
      setProjectTeams(teams);
    } catch (err: any) {
      alert(err.message || 'Failed to load teams');
    } finally {
      setLoadingTeams(false);
    }
  };

  return (
    <AdminLayout pageTitle="Projects & Teams Management">
      <div className="admin-section">
        {/* Header */}
        <div className="admin-section-header flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Club Projects Management</h2>
            <p className="text-sm text-[var(--text-muted, #94a3b8)]">
              Create, review, publish, and govern club projects, teams, and milestones.
            </p>
          </div>
          <button type="button" className="btn btn-primary flex items-center gap-2" onClick={handleAdd}>
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted, #94a3b8)]" />
            <input
              type="text"
              placeholder="Search projects by title..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              className="text-xs px-3 py-2 rounded-lg bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] text-white focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Drafts</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Table of Projects */}
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--text-muted, #94a3b8)]">
            Loading projects...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
            <p className="text-sm text-[var(--text-muted, #94a3b8)]">No projects found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
            <table className="w-full text-left text-sm text-[var(--text-muted, #94a3b8)]">
              <thead className="bg-black/30 text-xs uppercase font-bold tracking-wider text-slate-300 border-b border-[var(--border-color, #334155)]">
                <tr>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Domain / Difficulty</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Contributors / Pods</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white mb-0.5 line-clamp-1">{proj.title}</div>
                      <div className="text-xs text-[var(--text-muted, #64748b)] line-clamp-1">
                        {proj.short_description || proj.shortDescription}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <ProjectDomainBadge domain={proj.domain as string || proj.category as string || 'AI_ML'} />
                        <ProjectDifficultyBadge difficulty={proj.difficulty as string || 'BEGINNER'} />
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <ProjectStatusBadge status={proj.status as string} />
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-xs text-white flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users size={13} className="text-slate-400" /> {proj.members_count ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers size={13} className="text-slate-400" /> {proj.teams_count ?? 0}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-white">{proj.progress_percentage || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${proj.progress_percentage || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {proj.status === 'DRAFT' && (
                          <button
                            type="button"
                            className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            onClick={() => handlePublish(proj)}
                            title="Publish Project to OPEN"
                          >
                            <Send size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="p-1.5 rounded text-[var(--text-muted, #94a3b8)] hover:text-white hover:bg-white/5"
                          onClick={() => handleInspectTeams(proj)}
                          title="Inspect Squads / Pods"
                        >
                          <Layers size={15} />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded text-[var(--text-muted, #94a3b8)] hover:text-white hover:bg-white/5"
                          onClick={() => handleEdit(proj)}
                          title="Edit Project"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded text-[var(--text-muted, #94a3b8)] hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(proj.id, proj.title)}
                          title="Delete Project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Project Form Modal (Create / Edit) */}
        {isFormOpen && (
          <ProjectFormModal
            project={editingProject}
            onClose={() => setIsFormOpen(false)}
            onSaved={() => {
              setIsFormOpen(false);
              fetchProjects();
            }}
          />
        )}

        {/* Inspect Project Squads Modal */}
        {inspectingProject && (
          <div className="modal-backdrop fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="modal-content w-full max-w-xl bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] rounded-2xl p-6 max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Team Squads: {inspectingProject.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted, #94a3b8)]">
                    {projectTeams.length} teams formed for this project.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-white p-1 rounded"
                  onClick={() => setInspectingProject(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loadingTeams ? (
                  <p className="text-xs text-center py-6 text-slate-400">Loading squads...</p>
                ) : projectTeams.length === 0 ? (
                  <p className="text-xs text-center py-6 text-slate-400">No teams formed yet.</p>
                ) : (
                  projectTeams.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-white/10 bg-black/20 flex justify-between items-center"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{t.name}</h4>
                        {t.description && <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>}
                        <div className="text-[11px] text-slate-500 mt-2">
                          Lead: {t.team_lead_name || 'Assigned Lead'} &middot;{' '}
                          {t.member_count} / {t.max_members || 5} members
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                        {t.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
