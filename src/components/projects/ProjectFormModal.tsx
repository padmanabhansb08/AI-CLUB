import { useDialog } from '../../hooks/useDialog';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  type ProjectItem,
  PROJECT_DOMAINS,
  PROJECT_DIFFICULTIES,
  PROJECT_STATUSES,
} from '../../types/projects';
import { projectsApi } from '../../api/projects.api';

interface Props {
  project?: ProjectItem | null;
  onClose: () => void;
  onSaved: (project: ProjectItem) => void;
}

export const ProjectFormModal: React.FC<Props> = ({ project, onClose, onSaved }) => {
  const dialogRef = useDialog(true, onClose);
  const [formData, setFormData] = useState({
    title: project?.title || '',
    short_description:
      project?.short_description || project?.shortDescription || '',
    description: project?.description || project?.overview || '',
    domain: project?.domain || project?.category || 'AI_ML',
    difficulty: project?.difficulty || 'BEGINNER',
    status: project?.status || 'DRAFT',
    max_team_size: project?.max_team_size || 5,
    github_url: project?.github_url || '',
    demo_url: project?.demo_url || '',
    documentation_url: project?.documentation_url || '',
    technologies: (project?.technologies || []).join(', '),
    requirements: (project?.requirements || []).join('\n'),
    objectives: (project?.objectives || []).join('\n'),
    featured: project?.featured || false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.short_description.trim()) {
      setError('Title and short description are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const technologiesArray = formData.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const requirementsArray = formData.requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const objectivesArray = formData.objectives
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean);

      const payload: any = {
        title: formData.title.trim(),
        short_description: formData.short_description.trim(),
        description: formData.description.trim() || formData.short_description.trim(),
        domain: formData.domain,
        difficulty: formData.difficulty,
        status: formData.status,
        max_team_size: Number(formData.max_team_size) || 5,
        github_url: formData.github_url.trim() || null,
        demo_url: formData.demo_url.trim() || null,
        documentation_url: formData.documentation_url.trim() || null,
        technologies: technologiesArray,
        requirements: requirementsArray,
        objectives: objectivesArray,
        featured: Boolean(formData.featured),
      };

      let result: ProjectItem;
      if (project?.id) {
        result = await projectsApi.updateProject(project.id, payload);
      } else {
        result = await projectsApi.createProject(payload);
      }

      onSaved(result);
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Project editor" tabIndex={-1} className="modal-content w-full max-w-3xl bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] rounded-2xl p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white">
              {project ? 'Edit Project' : 'Create New Project'}
            </h3>
            <p className="text-xs text-[var(--text-muted, #94a3b8)]">
              Specify scope, technologies, deliverables, and collaboration settings.
            </p>
          </div>
          <button
            type="button"
            className="text-[var(--text-muted, #94a3b8)] hover:text-white p-1 rounded"
            aria-label="Close dialog" onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Title & Domain & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-1">
                Project Title *
              </label>
              <input id="projectformmodal-field-1"
                type="text"
                required
                className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                placeholder="e.g. Vision-Based Autonomous Aerial Navigation"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-2">
                Domain / Field *
              </label>
              <select id="projectformmodal-field-2"
                className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value as any })}
              >
                {PROJECT_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-3">
                Difficulty Level *
              </label>
              <select id="projectformmodal-field-3"
                className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
              >
                {PROJECT_DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-4">
                Status *
              </label>
              <select id="projectformmodal-field-4"
                className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                {PROJECT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-5">
              Short Description (1-2 sentences) *
            </label>
            <input id="projectformmodal-field-5"
              type="text"
              required
              maxLength={500}
              className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
              placeholder="A concise summary shown on cards and listings..."
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-6">
              Full Overview & Scope
            </label>
            <textarea id="projectformmodal-field-6"
              rows={4}
              className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
              placeholder="Detailed architecture, background problem, and approach..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Technologies & Max Team Size */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-7">
                Technologies & Tools (comma-separated)
              </label>
              <input id="projectformmodal-field-7"
                type="text"
                className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                placeholder="PyTorch, ROS2, OpenCV, Docker"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-8">
                Max Team Size
              </label>
              <input id="projectformmodal-field-8"
                type="number"
                min={1}
                max={20}
                className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                value={formData.max_team_size}
                onChange={(e) => setFormData({ ...formData, max_team_size: parseInt(e.target.value, 10) || 5 })}
              />
            </div>
          </div>

          {/* Objectives & Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-9">
                Project Objectives (one per line)
              </label>
              <textarea id="projectformmodal-field-9"
                rows={3}
                className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                placeholder="Implement visual odometry&#10;Benchmark on drone test dataset&#10;Publish open-source repo"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-10">
                Prerequisites & Requirements (one per line)
              </label>
              <textarea id="projectformmodal-field-10"
                rows={3}
                className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                placeholder="Basic Python & C++&#10;Understanding of neural networks"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-11">
                GitHub Repository URL
              </label>
              <input id="projectformmodal-field-11"
                type="url"
                className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                placeholder="https://github.com/..."
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-12">
                Live Demo URL
              </label>
              <input id="projectformmodal-field-12"
                type="url"
                className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                placeholder="https://demo.aiclub.com"
                value={formData.demo_url}
                onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted, #94a3b8)] mb-1" htmlFor="projectformmodal-field-13">
                Documentation URL
              </label>
              <input id="projectformmodal-field-13"
                type="url"
                className="form-input w-full px-3 py-2 rounded-lg bg-[var(--bg-color, #0f172a)] border border-[var(--border-color, #334155)] text-white text-sm focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
                placeholder="https://docs.aiclub.com"
                value={formData.documentation_url}
                onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
              />
            </div>
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featured-checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded text-[var(--accent-color, #6366f1)]"
            />
            <label htmlFor="featured-checkbox" className="text-sm text-white cursor-pointer">
              Mark as Featured Club Project
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              className="btn btn-outline text-sm"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-sm"
              disabled={submitting}
            >
              {submitting ? 'Saving Project...' : project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
