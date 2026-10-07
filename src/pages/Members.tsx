import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useMembers } from '../hooks/useMembers';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
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
            <h1 className="text-2xl font-bold text-[#111111] flex items-center gap-2">
              <Users size={24} className="text-[#111111]" /> Student Member Directory
            </h1>
            <p className="text-sm text-[#66645F] mt-1">
              Connect with peer AI Club members, discover shared research topics, and find project collaborators.
            </p>
          </div>
          <div className="text-xs font-mono text-[#111111] bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] px-3.5 py-1.5 rounded-full self-start sm:self-auto font-semibold">
            {pagination.total} Registered Members
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#92908A]" />
            <input
              aria-label="Search members"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, register number, or skill (e.g. PyTorch, React)..."
              className="w-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.12)] rounded-full pl-10 pr-4 py-2.5 text-sm text-[#111111] placeholder-[#92908A] focus:outline-none focus:border-[#111111]"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#92908A]" />
            <select
              aria-label="Member department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-[#FAF9F6] border border-[rgba(17,17,17,0.12)] rounded-full px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] font-medium"
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
                  className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] hover:border-[rgba(17,17,17,0.2)] p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div>
                    {/* Top Row: Avatar & Identity */}
                    <div className="flex items-start gap-3.5 mb-3">
                      {member.profilePhotoUrl ? (
                        <img
                          src={member.profilePhotoUrl}
                          alt={member.fullName}
                          className="w-12 h-12 rounded-full object-cover border border-[#111111] flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#111111] text-[#111111] font-bold font-mono flex items-center justify-center flex-shrink-0">
                          {member.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-[#111111] group-hover:opacity-80 transition-opacity truncate">
                          {member.fullName}
                        </h3>
                        <p className="text-xs text-[#66645F] mt-0.5">
                          {member.department} &bull; Year {member.year}
                        </p>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    {member.bio && (
                      <p className="text-xs text-[#66645F] line-clamp-2 mb-3.5 leading-relaxed">
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
                              className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[#111111] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                          {member.skills.length > 4 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-[#92908A]">
                              +{member.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-3 border-t border-[rgba(17,17,17,0.06)] flex items-center justify-between text-xs text-[#66645F]">
                    <span className="text-[11px] font-mono text-[#92908A]">{member.registerNumber}</span>
                    <span className="text-[#111111] font-medium group-hover:underline flex items-center gap-1">
                      View Profile <ExternalLink size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[rgba(17,17,17,0.08)]">
                <span className="text-xs text-[#66645F]">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total members)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="pill-outline flex items-center gap-1 text-xs py-1 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="pill-outline flex items-center gap-1 text-xs py-1 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
export default Members;
