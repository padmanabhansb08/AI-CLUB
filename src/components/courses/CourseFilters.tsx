import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { COURSE_CATEGORIES, COURSE_DIFFICULTIES } from '../../types/courses';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (value: string) => void;
  totalResults: number;
}

export const CourseFilters: React.FC<Props> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  totalResults,
}) => {
  const hasActiveFilters =
    searchTerm.trim() !== '' || selectedCategory !== 'All' || selectedDifficulty !== 'All';

  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange('All');
    onDifficultyChange('All');
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Search and Dropdowns Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted,#94a3b8)]"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courses by title, topic, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-[var(--surface-color,rgba(15,23,42,0.6))] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-color,#6366f1)] focus:ring-1 focus:ring-[var(--accent-color,#6366f1)] transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Select */}
        <div className="sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-[var(--surface-color,rgba(15,23,42,0.6))] text-sm text-white focus:outline-none focus:border-[var(--accent-color,#6366f1)] transition-all cursor-pointer"
          >
            {COURSE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-slate-900 text-white">
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Select */}
        <div className="sm:w-44">
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-[var(--surface-color,rgba(15,23,42,0.6))] text-sm text-white focus:outline-none focus:border-[var(--accent-color,#6366f1)] transition-all cursor-pointer"
          >
            <option value="All" className="bg-slate-900 text-white">
              All Levels
            </option>
            {COURSE_DIFFICULTIES.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-white">
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count & Clear Button */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted,#94a3b8)] px-1">
        <span className="font-mono">
          Showing <span className="font-bold text-white">{totalResults}</span>{' '}
          {totalResults === 1 ? 'course' : 'courses'}
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <Filter size={12} /> Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};
