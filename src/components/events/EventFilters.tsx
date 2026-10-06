import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { EVENT_TYPES } from '../../types/events';

interface EventFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedType: string;
  onTypeChange: (val: string) => void;
  activeTab: 'upcoming' | 'all' | 'registered' | 'past';
  onTabChange: (tab: 'upcoming' | 'all' | 'registered' | 'past') => void;
  onReset?: () => void;
  isAdmin?: boolean;
  selectedStatus?: string;
  onStatusChange?: (val: string) => void;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  activeTab,
  onTabChange,
  onReset,
  isAdmin = false,
  selectedStatus = '',
  onStatusChange,
}) => {
  const hasActiveFilters = Boolean(search || selectedType || (isAdmin && selectedStatus));

  return (
    <div className="space-y-4 mb-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => onTabChange('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-950/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => onTabChange('all')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-950/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          All Events
        </button>
        {!isAdmin && (
          <button
            onClick={() => onTabChange('registered')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'registered'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-950/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            My Registered
          </button>
        )}
        <button
          onClick={() => onTabChange('past')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeTab === 'past'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-950/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          Past Events
        </button>
      </div>

      {/* Search and Dropdowns Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events by title, description or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Event Type Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs md:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/80 cursor-pointer"
            >
              <option value="">All Event Types</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Filter size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>

          {/* Admin Status Filter */}
          {isAdmin && onStatusChange && (
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs md:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/80 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <Filter size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          )}

          {hasActiveFilters && onReset && (
            <button
              onClick={onReset}
              className="px-3 py-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition-colors"
              title="Clear all filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
