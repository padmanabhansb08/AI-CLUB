import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { PROJECT_DOMAINS, PROJECT_DIFFICULTIES } from '../../types/projects';

interface Props {
  search: string;
  domain: string;
  difficulty: string;
  status: string;
  sort: string;
  onSearchChange: (val: string) => void;
  onDomainChange: (val: string) => void;
  onDifficultyChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onSortChange: (val: string) => void;
  onReset: () => void;
  totalCount: number;
}

export const ProjectFilters: React.FC<Props> = ({
  search,
  domain,
  difficulty,
  status,
  sort,
  onSearchChange,
  onDomainChange,
  onDifficultyChange,
  onStatusChange,
  onSortChange,
  onReset,
  totalCount,
}) => {
  const isFiltering =
    Boolean(search) ||
    domain !== 'ALL' ||
    difficulty !== 'ALL' ||
    status !== 'ALL' ||
    sort !== 'latest';

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Search & Results */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted, #94a3b8)]"
          />
          <input
            aria-label="Search projects"
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] text-white placeholder-[#64748b] focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
            placeholder="Search projects by title, description, or tech stack..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-muted, #94a3b8)] whitespace-nowrap">
            <strong className="text-white">{totalCount}</strong> projects found
          </span>

          {isFiltering && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs flex items-center gap-1 text-[var(--text-muted, #94a3b8)] hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10"
            >
              <X size={12} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdowns row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs text-[var(--text-muted, #94a3b8)] flex items-center gap-1 mr-1">
          <SlidersHorizontal size={14} /> Filter:
        </span>

        {/* Domain Filter */}
        <select
          className="text-xs px-3 py-1.5 rounded-lg bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] text-white focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
          value={domain}
          aria-label="Project domain"
          onChange={(e) => onDomainChange(e.target.value)}
        >
          <option value="ALL">All Domains</option>
          {PROJECT_DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d.replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          className="text-xs px-3 py-1.5 rounded-lg bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] text-white focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
          value={difficulty}
          aria-label="Project difficulty"
          onChange={(e) => onDifficultyChange(e.target.value)}
        >
          <option value="ALL">All Difficulties</option>
          {PROJECT_DIFFICULTIES.map((diff) => (
            <option key={diff} value={diff}>
              {diff}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          className="text-xs px-3 py-1.5 rounded-lg bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] text-white focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
          value={status}
          aria-label="Project status"
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open For Joining</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* Sort Filter */}
        <select
          className="text-xs px-3 py-1.5 rounded-lg bg-[var(--surface-color, #1e293b)] border border-[var(--border-color, #334155)] text-white ml-auto focus:outline-none focus:border-[var(--accent-color, #6366f1)]"
          value={sort}
          aria-label="Sort projects"
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="latest">Sort: Newest First</option>
          <option value="popular">Sort: Most Contributors</option>
          <option value="progress">Sort: Highest Progress</option>
        </select>
      </div>
    </div>
  );
};
