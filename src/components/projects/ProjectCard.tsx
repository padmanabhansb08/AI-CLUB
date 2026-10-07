import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle2, ChevronRight, Layers, Clock } from 'lucide-react';
import type { ProjectItem } from '../../types/projects';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ProjectDomainBadge } from './ProjectDomainBadge';
import { ProjectDifficultyBadge } from './ProjectDifficultyBadge';

interface Props {
  project: ProjectItem;
  onJoinClick?: (project: ProjectItem) => void;
}

export const ProjectCard: React.FC<Props> = ({ project, onJoinClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/projects/${project.slug || project.id}`);
  };

  const progress = project.progress_percentage || 0;
  const techList = Array.isArray(project.technologies)
    ? project.technologies
    : (project.technologies as any)
    ? JSON.parse(project.technologies as any)
    : [];

  const shortDesc =
    project.short_description ||
    project.shortDescription ||
    project.description ||
    '';

  return (
    <div
      className="card project-card transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--surface-color, #1e293b)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: '12px',
        padding: '1.25rem',
        cursor: 'pointer',
      }}
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      aria-label={`View project: ${project.title}`}
      onKeyDown={event => { if (event.key === 'Enter' && event.target === event.currentTarget) handleCardClick(); }}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <ProjectDomainBadge domain={project.domain as string || project.category as string || 'AI_ML'} />
            <ProjectDifficultyBadge difficulty={project.difficulty as string || 'BEGINNER'} />
          </div>
          <ProjectStatusBadge status={project.status as string} />
        </div>

        {/* Title & Short Description */}
        <h3 className="text-lg font-bold mb-2 tracking-tight line-clamp-1 hover:text-[var(--accent-color)] text-white">
          {project.title}
        </h3>
        <p className="text-sm text-[var(--text-muted, #94a3b8)] mb-4 line-clamp-2">
          {shortDesc}
        </p>

        {/* Technologies tags */}
        {techList && techList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {techList.slice(0, 4).map((tech: string, i: number) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                }}
              >
                {tech}
              </span>
            ))}
            {techList.length > 4 && (
              <span className="text-xs text-[var(--text-muted, #94a3b8)] self-center">
                +{techList.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-[var(--text-muted, #94a3b8)] flex items-center gap-1">
              <Clock size={12} /> Progress
            </span>
            <span className="font-semibold text-white">{progress}%</span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background:
                  progress === 100
                    ? '#10b981'
                    : 'linear-gradient(90deg, #6366f1, #3b82f6)',
              }}
            />
          </div>
        </div>

        {/* Footer Metrics & Actions */}
        <div
          className="pt-3 border-t flex items-center justify-between"
          style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted, #94a3b8)]">
            <span className="flex items-center gap-1" title="Active Contributors">
              <Users size={14} />
              {project.members_count ?? 0}
            </span>
            <span className="flex items-center gap-1" title="Collaborative Teams">
              <Layers size={14} />
              {project.teams_count ?? 0}
            </span>
            {(project.milestones_count ?? 0) > 0 && (
              <span className="flex items-center gap-1" title="Milestones Completed">
                <CheckCircle2 size={14} className="text-emerald-400" />
                {project.completed_milestones_count ?? 0}/{project.milestones_count}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {project.current_member_status === 'ACTIVE' ? (
              <span className="text-xs font-medium text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Joined
              </span>
            ) : project.current_member_status === 'PENDING' ? (
              <span className="text-xs font-medium text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Pending
              </span>
            ) : onJoinClick && project.status === 'OPEN' ? (
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoinClick(project);
                }}
              >
                Join
              </button>
            ) : null}

            <button
              type="button"
              className="p-1 rounded text-[var(--text-muted, #94a3b8)] hover:text-white"
              aria-label="View Project"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
