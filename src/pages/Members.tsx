import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useMembers } from '../hooks/useMembers';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/ui/Button';
import { DEPARTMENT_OPTIONS } from '../constants/academicOptions';
import { 
  Users, 
  Search, 
  Filter, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export const Members: React.FC = () => {
  const navigate = useNavigate();
  const {
    members,
    pagination,
    loading,
    error,
    search,
    setSearch,
    department,
    setDepartment,
    page,
    setPage,
    retry,
  } = useMembers();

  return (
    <DashboardLayout pageTitle="Member Directory">
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <Users size={24} className="text-accent" /> Student Member Directory
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Connect with peer AI Club members, discover shared skills, and find research collaborators.
            </p>
          </div>
          <div className="text-xs font-mono text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">
            {pagination.total} Registered Members
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, register number, or skill (e.g. PyTorch, React)..."
              className="w-full bg-dark-bg border border-gray-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-dark-bg border border-gray-700/80 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent"
            >
              <option value="All">All Departments</option>
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <LoadingState message="Searching member directory..." fullScreen={false} />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : members.length === 0 ? (
          <EmptyState
            title="No Members Found"
            message={`No students found matching '${search || department}'. Try searching for another skill or department.`}
            actionText="Reset Search"
            onAction={() => {
              setSearch('');
              setDepartment('All');
            }}
          />
        ) : (
          <>
            {/* Member Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => navigate(`/members/${member.id}`)}
                  className="rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/80 hover:border-gray-700 p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Avatar & Identity */}
                    <div className="flex items-start gap-3.5 mb-3">
                      {member.profilePhotoUrl ? (
                        <img
                          src={member.profilePhotoUrl}
                          alt={member.fullName}
                          className="w-12 h-12 rounded-full object-cover border border-accent flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent text-accent font-bold font-mono flex items-center justify-center flex-shrink-0">
                          {member.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-gray-100 group-hover:text-accent transition-colors truncate">
                          {member.fullName}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {member.department} &bull; Year {member.year}
                        </p>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    {member.bio && (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3.5 leading-relaxed">
                        {member.bio}
                      </p>
                    )}

                    {/* Skills Tags */}
                    {member.skills && member.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="text-[10px] px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300"
                            >
                              {s}
                            </span>
                          ))}
                          {member.skills.length > 4 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-gray-500">
                              +{member.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
                    <span className="text-[11px] font-mono text-gray-500">{member.registerNumber}</span>
                    <span className="text-accent group-hover:underline flex items-center gap-1">
                      View Profile <ExternalLink size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <span className="text-xs text-gray-400">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total members)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="flex items-center gap-1 text-xs py-1 px-3"
                  >
                    <ChevronLeft size={14} /> Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="flex items-center gap-1 text-xs py-1 px-3"
                  >
                    Next <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
