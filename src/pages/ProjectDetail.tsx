import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { projectsApi } from '../api/projects.api';
import type { ProjectItem, ProjectMilestoneItem, ProjectMembershipItem } from '../types/projects';
import { ProjectStatusBadge } from '../components/projects/ProjectStatusBadge';
import { ProjectDomainBadge } from '../components/projects/ProjectDomainBadge';
import { ProjectDifficultyBadge } from '../components/projects/ProjectDifficultyBadge';
import { MilestoneList } from '../components/projects/MilestoneList';
import { TeamManagementSection } from '../components/projects/TeamManagementSection';
import { ProjectMembersModal } from '../components/projects/ProjectMembersModal';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Users,
  Code2,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
  UserCheck,
  UserPlus,
} from 'lucide-react';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestoneItem[]>([]);
  const [members, setMembers] = useState<ProjectMembershipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Action loading
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjectData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const [projData, milestonesData, membersData] = await Promise.all([
        projectsApi.getProject(id),
        projectsApi.getMilestones(id).catch(() => []),
        projectsApi.getProjectMembers(id).catch(() => []),
      ]);

      setProject(projData);
      setMilestones(milestonesData);
      setMembers(membersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleJoinProject = async () => {
    if (!project) return;
    try {
      setActionLoading(true);
      await projectsApi.joinProject(project.id, 'CONTRIBUTOR');
      alert('Join request submitted! A project lead or admin will review your application.');
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to request to join project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!project) return;
    if (!confirm('Are you sure you want to leave this project?')) return;
    try {
      setActionLoading(true);
      await projectsApi.leaveProject(project.id);
      await fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to leave project');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Loading Project...">
        <div className="p-16 text-center text-[var(--text-muted, #94a3b8)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color, #6366f1)] mb-3"></div>
          <p>Loading project workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout pageTitle="Project Not Found">
        <div className="empty-state p-12 text-center rounded-2xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
          <h3 className="text-xl font-bold text-white mb-2">Project Not Found</h3>
          <p className="text-sm text-[var(--text-muted, #94a3b8)] mb-6">
            The project you are looking for does not exist or may have been removed.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/projects')}>
            Back to All Projects
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isOwner = project.current_member_role === 'OWNER' || project.owner_id === user?.id;
  const isLead = project.current_member_role === 'LEAD';
  const isAdmin = user?.role === 'admin';
  const canManage = isOwner || isLead || isAdmin;

  const isMember = project.current_member_status === 'ACTIVE';
  const isPending = project.current_member_status === 'PENDING';

  const progress = project.progress_percentage || 0;

  const techList = Array.isArray(project.technologies)
    ? project.technologies
    : (project.technologies as any)
    ? JSON.parse(project.technologies as any)
    : [];

  const reqList = Array.isArray(project.requirements)
    ? project.requirements
    : (project.requirements as any)
    ? JSON.parse(project.requirements as any)
    : [];

  const objList = Array.isArray(project.objectives)
    ? project.objectives
    : (project.objectives as any)
    ? JSON.parse(project.objectives as any)
    : [];

  return (
    <DashboardLayout pageTitle={project.title}>
      {/* Back button */}
      <button
        type="button"
        className="back-btn mb-6 flex items-center gap-2 text-sm text-[var(--text-muted, #94a3b8)] hover:text-white transition-colors"
        onClick={() => navigate('/projects')}
      >
        <ArrowLeft size={16} /> Back to Projects Directory
      </button>

      {/* Project Header Hero Card */}
      <div className="card p-6 md:p-8 rounded-2xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <ProjectDomainBadge domain={project.domain as string || project.category as string || 'AI_ML'} />
            <ProjectDifficultyBadge difficulty={project.difficulty as string || 'BEGINNER'} />
            <ProjectStatusBadge status={project.status as string} />
          </div>

          {canManage && (
            <button
              type="button"
              className="btn btn-sm btn-outline flex items-center gap-1.5"
              onClick={() => setShowMembersModal(true)}
            >
              <Users size={14} /> Manage Members ({members.length})
            </button>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
          {project.title}
        </h1>

        <p className="text-base text-[var(--text-muted, #94a3b8)] max-w-4xl mb-6">
          {project.short_description || project.shortDescription}
        </p>

        {/* Action Controls & Membership Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted, #94a3b8)]">
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-[var(--accent-color, #6366f1)]" />
              Owner: <strong className="text-white">{project.owner_name || 'Club Core Lead'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              <strong className="text-white">{project.members_count ?? members.length}</strong> Contributors
            </span>
            <span className="flex items-center gap-1.5">
              <Layers size={14} />
              <strong className="text-white">{project.teams_count ?? 0}</strong> Pods
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isMember ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <UserCheck size={14} /> Active {project.current_member_role || 'Contributor'}
                </span>
                {!isOwner && (
                  <button
                    type="button"
                    className="btn btn-xs btn-outline text-red-400 hover:bg-red-500/10 border-red-500/30"
                    onClick={handleLeaveProject}
                    disabled={actionLoading}
                  >
                    Leave
                  </button>
                )}
              </div>
            ) : isPending ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Clock size={14} /> Join Request Pending Review
                </span>
                <button
                  type="button"
                  className="btn btn-xs btn-outline text-slate-400 hover:text-white"
                  onClick={handleLeaveProject}
                  disabled={actionLoading}
                >
                  Cancel Request
                </button>
              </div>
            ) : project.status === 'OPEN' ? (
              <button
                type="button"
                className="btn btn-primary flex items-center gap-2"
                onClick={handleJoinProject}
                disabled={actionLoading}
              >
                <UserPlus size={16} /> Request to Join Project
              </button>
            ) : null}

            {/* External Links */}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-muted, #94a3b8)] hover:text-white hover:bg-white/10 transition-colors"
                title="GitHub Repository"
              >
                <Code2 size={18} />
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-muted, #94a3b8)] hover:text-white hover:bg-white/10 transition-colors"
                title="Live Demo"
              >
                <ExternalLink size={18} />
              </a>
            )}
            {project.documentation_url && (
              <a
                href={project.documentation_url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-muted, #94a3b8)] hover:text-white hover:bg-white/10 transition-colors"
                title="Documentation"
              >
                <BookOpen size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Project Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[var(--text-muted, #94a3b8)] flex items-center gap-1 font-medium">
              <Clock size={12} /> Milestone Progress Completion
            </span>
            <span className="font-bold text-white">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-black/30">
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
      </div>

      {/* Grid Layout: Left Details, Right Milestones & Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Scope, Objectives, Requirements (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Overview */}
          <div className="card p-6 rounded-2xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
            <h3 className="text-lg font-bold text-white mb-3">Project Scope & Problem</h3>
            <div className="text-sm text-[var(--text-muted, #cbd5e1)] leading-relaxed whitespace-pre-line">
              {project.description || project.overview || project.short_description}
            </div>
          </div>

          {/* Objectives */}
          {objList.length > 0 && (
            <div className="card p-6 rounded-2xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[var(--accent-color, #6366f1)]" />
                Key Deliverables & Objectives
              </h3>
              <ul className="space-y-2 text-sm text-[var(--text-muted, #cbd5e1)]">
                {objList.map((obj: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color, #6366f1)] mt-2 flex-shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements & Prerequisites */}
          {reqList.length > 0 && (
            <div className="card p-6 rounded-2xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
              <h3 className="text-lg font-bold text-white mb-3">Prerequisites & Requirements</h3>
              <ul className="space-y-2 text-sm text-[var(--text-muted, #cbd5e1)]">
                {reqList.map((req: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-2 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Collaborative Teams Pods */}
          <TeamManagementSection
            projectId={project.id}
            projectStatus={project.status as string}
            canCreateTeam={canManage || isMember}
          />
        </div>

        {/* Right Column: Stack & Milestones Tracker (1 col) */}
        <div className="space-y-6">
          {/* Tech Stack Card */}
          {techList.length > 0 && (
            <div className="card p-6 rounded-2xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
              <h3 className="text-base font-bold text-white mb-3">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                {techList.map((tech: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-black/20 border border-white/10 text-white"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Milestones Tracker */}
          <div className="card p-6 rounded-2xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
            <MilestoneList
              projectId={project.id}
              milestones={milestones}
              canManage={canManage}
              onMilestonesUpdated={fetchProjectData}
            />
          </div>
        </div>
      </div>

      {/* Project Members Modal */}
      {showMembersModal && (
        <ProjectMembersModal
          projectId={project.id}
          members={members}
          canManage={canManage}
          onClose={() => setShowMembersModal(false)}
          onMembersUpdated={fetchProjectData}
        />
      )}
    </DashboardLayout>
  );
};
