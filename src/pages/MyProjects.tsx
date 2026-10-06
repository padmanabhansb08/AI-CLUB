import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProjectCard } from '../components/projects/ProjectCard';
import { TeamInvitationsBanner } from '../components/projects/TeamInvitationsBanner';
import { projectsApi } from '../api/projects.api';
import type { ProjectItem } from '../types/projects';
import { FolderGit2, ArrowRight } from 'lucide-react';

export const MyProjects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projData] = await Promise.all([
        projectsApi.getMyProjects(),
      ]);
      setProjects(projData);
    } catch (err: any) {
      setError(err.message || 'Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  return (
    <DashboardLayout pageTitle="My Projects & Teams">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderGit2 className="text-[var(--accent-color, #6366f1)]" size={24} />
            <h2 className="text-2xl font-bold tracking-tight text-white m-0">
              MY PROJECTS & PODS
            </h2>
          </div>
          <p className="text-sm text-[var(--text-muted, #94a3b8)]">
            Active club initiatives, team squads, and collaborations you are contributing to.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary flex items-center gap-2"
          onClick={() => navigate('/projects')}
        >
          Explore All Projects <ArrowRight size={16} />
        </button>
      </div>

      {/* Invitations banner */}
      <TeamInvitationsBanner onInvitationsChanged={fetchMyData} />

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--text-muted, #94a3b8)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color, #6366f1)] mb-3"></div>
          <p>Loading your projects...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm">
          {error}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
          <FolderGit2 size={40} className="mx-auto mb-3 text-[var(--text-muted, #64748b)]" />
          <h3 className="text-lg font-bold text-white mb-1">You Haven't Joined Any Projects Yet</h3>
          <p className="text-xs text-[var(--text-muted, #94a3b8)] max-w-sm mx-auto mb-4">
            Discover active club initiatives, request to join as a contributor, or build a team pod with peers.
          </p>
          <button
            type="button"
            className="btn btn-primary inline-flex items-center gap-2"
            onClick={() => navigate('/projects')}
          >
            Discover Projects
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
