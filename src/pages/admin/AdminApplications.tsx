import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, CheckCircle2, Clock, XCircle, AlertTriangle, 
  Search, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { applicationApi, type MembershipApplication, type ApplicationCounts } from '../../api/application.api';
import { LoadingState } from '../../components/common/LoadingState';

export const AdminApplications: React.FC = () => {

  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<ApplicationCounts | null>(null);
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('submitted_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Load counts
  const loadCounts = async () => {
    try {
      const res = await applicationApi.getCounts();
      setCounts(res);
    } catch (err) {
      console.error('Failed to load application counts:', err);
    }
  };

  // Load applications
  const loadApplications = async (page = 1) => {
    try {
      setLoading(true);
      const res = await applicationApi.listApplications({
        search: searchTerm || undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        department: selectedDept !== 'ALL' ? selectedDept : undefined,
        year: selectedYear !== 'ALL' ? Number(selectedYear) : undefined,
        sortBy,
        sortOrder,
        page,
        limit: pagination.limit,
      });

      setApplications(res.applications);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  useEffect(() => {
    loadApplications(1);
  }, [selectedStatus, selectedDept, selectedYear, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadApplications(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'UNDER_REVIEW':
      case 'TEST_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Clock size={12} /> Under Review
          </span>
        );
      case 'WAITLISTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle size={12} /> Waitlisted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'TEST_IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            Test In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Test Required
          </span>
        );
    }
  };

  return (
    <AdminLayout pageTitle="Membership Applications">
      <div className="space-y-6 pb-12">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</div>
            <div className="text-2xl font-bold text-white mt-1">{counts?.total ?? '—'}</div>
            <div className="text-xs text-slate-500 mt-0.5">All Applicants</div>
          </div>
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 shadow-sm">
            <div className="text-xs text-blue-400 font-medium uppercase tracking-wider">Pending</div>
            <div className="text-2xl font-bold text-blue-300 mt-1">{counts?.pending ?? '—'}</div>
            <div className="text-xs text-blue-500/80 mt-0.5">Need Review</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 shadow-sm">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Passed</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{counts?.passed ?? '—'}</div>
            <div className="text-xs text-emerald-500/80 mt-0.5">Score ≥ 60%</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 shadow-sm">
            <div className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Approved</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{counts?.approved ?? '—'}</div>
            <div className="text-xs text-emerald-400/80 mt-0.5">Active Members</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 shadow-sm">
            <div className="text-xs text-amber-400 font-medium uppercase tracking-wider">Waitlist</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{counts?.waitlisted ?? '—'}</div>
            <div className="text-xs text-amber-500/80 mt-0.5">Reserved</div>
          </div>
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 shadow-sm">
            <div className="text-xs text-red-400 font-medium uppercase tracking-wider">Rejected</div>
            <div className="text-2xl font-bold text-red-300 mt-1">{counts?.rejected ?? '—'}</div>
            <div className="text-xs text-red-500/80 mt-0.5">Not Selected</div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Sort */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by student name, reg number, email, or application ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </form>

            {/* Quick Filter Selects */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Department */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="AIML">AIML</option>
                <option value="AIDS">AIDS</option>
                <option value="ECE">ECE</option>
                <option value="IT">IT</option>
                <option value="Data Science">Data Science</option>
                <option value="Mechanical">Mechanical</option>
              </select>

              {/* Year */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="submitted_at">Submission Date</option>
                <option value="score">Assessment Score</option>
                <option value="name">Student Name</option>
              </select>

              {/* Sort Order */}
              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold hover:bg-slate-700"
              >
                {sortOrder === 'DESC' ? 'High → Low ↓' : 'Low → High ↑'}
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
            {[
              { id: 'ALL', label: 'All Applications' },
              { id: 'UNDER_REVIEW', label: 'Under Review' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'WAITLISTED', label: 'Waitlisted' },
              { id: 'REJECTED', label: 'Rejected' },
              { id: 'TEST_REQUIRED', label: 'Test Pending' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12">
              <LoadingState message="Loading applications..." />
            </div>
          ) : applications.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <Users size={36} className="mx-auto text-slate-600" />
              <p className="font-semibold text-white">No applications found</p>
              <p className="text-xs">Try adjusting your search criteria or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-850/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Reg No</th>
                    <th className="py-3.5 px-4">Dept / Year</th>
                    <th className="py-3.5 px-4">Application ID</th>
                    <th className="py-3.5 px-4 text-center">Mock Score</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{app.fullName || '—'}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{app.email}</div>
                      </td>

                      {/* Reg No */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                        {app.registerNumber || '—'}
                      </td>

                      {/* Dept / Year */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{app.department || '—'}</div>
                        <div className="text-xs text-slate-400">Year {app.year || '—'}</div>
                      </td>

                      {/* App ID */}
                      <td className="py-3.5 px-4 font-mono text-xs text-blue-400 font-semibold">
                        {app.application_number}
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-center">
                        {app.final_score !== null ? (
                          <div className="inline-block text-center">
                            <span className="font-bold text-white text-base">
                              {app.final_score}
                            </span>
                            <span className="text-xs text-slate-400 font-normal"> / 25</span>
                            <div className="text-xs">
                              {app.passed ? (
                                <span className="text-emerald-400 font-semibold">PASSED ({app.score_percentage}%)</span>
                              ) : (
                                <span className="text-red-400 font-semibold">FAILED ({app.score_percentage}%)</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Not taken</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(app.status)}
                      </td>

                      {/* Submitted */}
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/applications/${app.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>Review</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Server-Side Pagination Bar */}
          {!loading && applications.length > 0 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing <strong className="text-white">{(pagination.page - 1) * pagination.limit + 1}</strong> to{' '}
                <strong className="text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of{' '}
                <strong className="text-white">{pagination.total}</strong> applicants
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadApplications(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <span className="font-semibold text-slate-200 px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => loadApplications(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
