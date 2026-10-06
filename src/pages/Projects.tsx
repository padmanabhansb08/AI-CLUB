import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectFilters } from '../components/projects/ProjectFilters';
import { TeamInvitationsBanner } from '../components/projects/TeamInvitationsBanner';
import { projectsApi } from '../api/projects.api';
import type { ProjectItem } from '../types/projects';
import { Sparkles, FolderGit2 } from 'lucide-react';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sort, setSort] = useState('latest');
  const [totalCount, setTotalCount] = useState(0);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectsApi.getProjects({
        search: search.trim() || undefined,
        domain: domain !== 'ALL' ? domain : undefined,
        difficulty: difficulty !== 'ALL' ? difficulty : undefined,
        status: status !== 'ALL' ? status : undefined,
        sort: sort as any,
        page: 1,
        limit: 50,
      });

      setProjects(res.items);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, domain, difficulty, status, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setDomain('ALL');
    setDifficulty('ALL');
    setStatus('ALL');
    setSort('latest');
  };

  const handleQuickJoin = async (project: ProjectItem) => {
    try {
      await projectsApi.joinProject(project.id, 'CONTRIBUTOR');
      alert(`Join request submitted for "${project.title}"! Project leads will review.`);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to submit join request');
    }
  };

  const featuredProjects = projects.filter((p) => p.featured);
  const standardProjects = projects.filter((p) => !p.featured);

  return (
    <DashboardLayout pageTitle="Projects & Teams">
      {/* Header Banner */}
      <div className="projects-header mb-6">
        <div className="projects-title-block">
          <div className="flex items-center gap-2 mb-1">
            <FolderGit2 className="text-[var(--accent-color, #6366f1)]" size={24} />
            <h2 className="text-2xl font-bold tracking-tight text-white m-0">
              CLUB PROJECTS & TEAMS
            </h2>
          </div>
          <p className="text-sm text-[var(--text-muted, #94a3b8)]">
            Explore club-driven AI initiatives, join collaborative pods, and build production solutions together.
          </p>
        </div>
      </div>

      {/* Pending Team Invitations Alert Banner */}
      <TeamInvitationsBanner onInvitationsChanged={fetchProjects} />

      {/* Reactive Filter & Search Controls */}
      <ProjectFilters
        search={search}
        domain={domain}
        difficulty={difficulty}
        status={status}
        sort={sort}
        onSearchChange={setSearch}
        onDomainChange={setDomain}
        onDifficultyChange={setDifficulty}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onReset={handleResetFilters}
        totalCount={totalCount}
      />

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--text-muted, #94a3b8)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color, #6366f1)] mb-3"></div>
          <p>Discovering projects...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm">
          {error}
          <div className="mt-3">
            <button type="button" className="btn btn-sm btn-outline" onClick={fetchProjects}>
              Try Again
            </button>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
          <FolderGit2 size={40} className="mx-auto mb-3 text-[var(--text-muted, #64748b)]" />
          <h3 className="text-lg font-bold text-white mb-1">No Projects Match Your Filter</h3>
          <p className="text-xs text-[var(--text-muted, #94a3b8)] max-w-sm mx-auto mb-4">
            Try adjusting your search query, selecting different domains, or clearing current filters.
          </p>
          <button type="button" className="btn btn-sm btn-primary" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Projects Highlight */}
          {featuredProjects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  Featured Club Initiatives
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredProjects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    onJoinClick={handleQuickJoin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Standard Project Grid */}
          <div>
            {featuredProjects.length > 0 && (
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted, #94a3b8)] mb-4">
                All Active Projects
              </h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {standardProjects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  onJoinClick={handleQuickJoin}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
