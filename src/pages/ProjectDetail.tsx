import { confirmAction } from '../services/confirmation';
import { notifyError, notifySuccess } from '../services/actionFeedback';
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
      notifySuccess('Join request submitted! A project lead or admin will review your application.');
      await fetchProjectData();
    } catch (err: any) {
      notifyError(err.message || 'Failed to request to join project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!project) return;
    if (!await confirmAction('Are you sure you want to leave this project?')) return;
    try {
      setActionLoading(true);
      await projectsApi.leaveProject(project.id);
      await fetchProjectData();
    } catch (err: any) {
      notifyError(err.message || 'Failed to leave project');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Loading Project...">
        <div className="p-16 text-center text-[#66645F]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#111111] mb-3"></div>
          <p>Loading project workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout pageTitle="Project Not Found">
        <div className="p-12 text-center rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm">
          <h3 className="text-xl font-bold text-[#111111] mb-2">Project Not Found</h3>
          <p className="text-sm text-[#66645F] mb-6">
            The project you are looking for does not exist or may have been removed.
          </p>
          <button className="pill-btn" onClick={() => navigate('/projects')}>
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
        className="mb-6 flex items-center gap-2 text-sm text-[#66645F] hover:text-[#111111] transition-colors"
        onClick={() => navigate('/projects')}
      >
        <ArrowLeft size={16} /> Back to Projects Directory
      </button>

      {/* Project Header Hero Card */}
      <div className="p-6 md:p-8 rounded-3xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <ProjectDomainBadge domain={project.domain as string || project.category as string || 'AI_ML'} />
            <ProjectDifficultyBadge difficulty={project.difficulty as string || 'BEGINNER'} />
            <ProjectStatusBadge status={project.status as string} />
          </div>

          {canManage && (
            <button
              type="button"
              className="px-4 py-2 rounded-full border border-[rgba(17,17,17,0.15)] text-xs font-semibold text-[#111111] hover:bg-[#FAF9F6] flex items-center gap-1.5 transition-colors"
              onClick={() => setShowMembersModal(true)}
            >
              <Users size={14} /> Manage Members ({members.length})
            </button>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] tracking-tight mb-3">
          {project.title}
        </h1>

        <p className="text-base text-[#66645F] max-w-4xl mb-6">
          {project.short_description || project.shortDescription}
        </p>

        {/* Action Controls & Membership Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[rgba(17,17,17,0.08)]">
          <div className="flex items-center gap-4 text-xs text-[#66645F]">
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-[#111111]" />
              Owner: <strong className="text-[#111111]">{project.owner_name || 'Club Core Lead'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              <strong className="text-[#111111]">{project.members_count ?? members.length}</strong> Contributors
            </span>
            <span className="flex items-center gap-1.5">
              <Layers size={14} />
              <strong className="text-[#111111]">{project.teams_count ?? 0}</strong> Pods
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isMember ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <UserCheck size={14} /> Active {project.current_member_role || 'Contributor'}
                </span>
                {!isOwner && (
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-rose-700 border border-rose-200 hover:bg-rose-50 transition-colors"
                    onClick={handleLeaveProject}
                    disabled={actionLoading}
                  >
                    Leave
                  </button>
                )}
              </div>
            ) : isPending ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700">
                  <Clock size={14} /> Join Request Pending Review
                </span>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-[#66645F] border border-[rgba(17,17,17,0.15)] hover:bg-[#FAF9F6] transition-colors"
                  onClick={handleLeaveProject}
                  disabled={actionLoading}
                >
                  Cancel Request
                </button>
              </div>
            ) : project.status === 'OPEN' ? (
              <button
                type="button"
                className="pill-btn flex items-center gap-2 text-xs py-2 px-5"
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
                className="p-2 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[#66645F] hover:text-[#111111] hover:bg-[#EBE9E3] transition-colors"
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
                className="p-2 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[#66645F] hover:text-[#111111] hover:bg-[#EBE9E3] transition-colors"
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
                className="p-2 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[#66645F] hover:text-[#111111] hover:bg-[#EBE9E3] transition-colors"
                title="Documentation"
              >
                <BookOpen size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Project Progress Bar */}
        <div className="mt-6 pt-4 border-t border-[rgba(17,17,17,0.08)]">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#66645F] flex items-center gap-1 font-medium">
              <Clock size={12} /> Milestone Progress Completion
            </span>
            <span className="font-bold text-[#111111] font-mono">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-[#EBE9E3]">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[#050505]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Details, Right Milestones & Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Scope, Objectives, Requirements (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Overview */}
          <div className="p-6 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm">
            <h3 className="text-lg font-bold text-[#111111] mb-3">Project Scope & Problem</h3>
            <div className="text-sm text-[#66645F] leading-relaxed whitespace-pre-line">
              {project.description || project.overview || project.short_description}
            </div>
          </div>

          {/* Objectives */}
          {objList.length > 0 && (
            <div className="p-6 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm">
              <h3 className="text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#111111]" />
                Key Deliverables & Objectives
              </h3>
              <ul className="space-y-2 text-sm text-[#66645F]">
                {objList.map((obj: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#111111] mt-2 flex-shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements & Prerequisites */}
          {reqList.length > 0 && (
            <div className="p-6 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm">
              <h3 className="text-lg font-bold text-[#111111] mb-3">Prerequisites & Requirements</h3>
              <ul className="space-y-2 text-sm text-[#66645F]">
                {reqList.map((req: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#92908A] mt-2 flex-shrink-0" />
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
            <div className="p-6 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm">
              <h3 className="text-base font-bold text-[#111111] mb-3">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                {techList.map((tech: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[#111111]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Milestones Tracker */}
          <div className="p-6 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm">
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
export default ProjectDetail;
