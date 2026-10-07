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
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] shadow-sm w-fit">
        <button
          aria-pressed={activeTab === 'upcoming'}
          onClick={() => onTabChange('upcoming')}
          className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-[#050505] text-[#FFFFFF] shadow-sm'
              : 'text-[#66645F] hover:text-[#111111]'
          }`}
        >
          Upcoming Events
        </button>
        <button
          aria-pressed={activeTab === 'all'}
          onClick={() => onTabChange('all')}
          className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-[#050505] text-[#FFFFFF] shadow-sm'
              : 'text-[#66645F] hover:text-[#111111]'
          }`}
        >
          All Events
        </button>
        {!isAdmin && (
          <button
            aria-pressed={activeTab === 'registered'}
            onClick={() => onTabChange('registered')}
            className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'registered'
                ? 'bg-[#050505] text-[#FFFFFF] shadow-sm'
                : 'text-[#66645F] hover:text-[#111111]'
            }`}
          >
            My Registered
          </button>
        )}
        <button
          aria-pressed={activeTab === 'past'}
          onClick={() => onTabChange('past')}
          className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
            activeTab === 'past'
              ? 'bg-[#050505] text-[#FFFFFF] shadow-sm'
              : 'text-[#66645F] hover:text-[#111111]'
          }`}
        >
          Past Events
        </button>
      </div>

      {/* Search and Dropdowns Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#92908A] pointer-events-none" />
          <input
            aria-label="Search events"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events by title, description or location..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.12)] text-xs md:text-sm text-[#111111] placeholder-[#92908A] focus:outline-none focus:border-[#111111] transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear event search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#92908A] hover:text-[#111111]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Event Type Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              aria-label="Event type"
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 rounded-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.12)] text-xs md:text-sm text-[#111111] focus:outline-none focus:border-[#111111] cursor-pointer shadow-sm"
            >
              <option value="">All Event Types</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Filter size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#92908A] pointer-events-none" />
          </div>

          {/* Admin Status Filter */}
          {isAdmin && onStatusChange && (
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 rounded-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.12)] text-xs md:text-sm text-[#111111] focus:outline-none focus:border-[#111111] cursor-pointer shadow-sm"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <Filter size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#92908A] pointer-events-none" />
            </div>
          )}

          {hasActiveFilters && onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2.5 rounded-full bg-[#FAF9F6] hover:bg-[#EBE9E3] text-xs font-semibold text-[#111111] border border-[rgba(17,17,17,0.12)] transition-colors shadow-sm"
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
