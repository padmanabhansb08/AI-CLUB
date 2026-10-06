import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Download, UserCheck, UserX, Shield, 
  ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, X 
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/admin.api';
import type { AdminMemberItem, PaginationData, UserRole, MemberStatus } from '../../types/admin';

export const AdminMembers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [classSection, setClassSection] = useState('All');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const [members, setMembers] = useState<AdminMemberItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [roleModalMember, setRoleModalMember] = useState<AdminMemberItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [statusModalMember, setStatusModalMember] = useState<AdminMemberItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<MemberStatus>('Active');
  const [modalLoading, setModalLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getMembers({
        page,
        limit,
        search: searchTerm.trim() || undefined,
        department: department === 'All' ? undefined : department,
        year: year === 'All' ? undefined : Number(year),
        classSection: classSection === 'All' ? undefined : classSection,
        role: role === 'All' ? undefined : role,
        status: status === 'All' ? undefined : status,
      });
      setMembers(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load members:', err);
      setError(err.message || 'Failed to retrieve members list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, department, year, classSection, role, status, page]);

  const handleExport = async () => {
    try {
      setExporting(true);
      await adminApi.downloadExport('members');
      setActionSuccess('Members data exported successfully to CSV.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleModalMember) return;
    setModalLoading(true);
    try {
      await adminApi.updateMemberRole(roleModalMember.id, selectedRole);
      setActionSuccess(`Role updated to ${selectedRole} for ${roleModalMember.fullName}.`);
      setRoleModalMember(null);
      fetchMembers();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Role change failed: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusModalMember) return;
    setModalLoading(true);
    try {
      await adminApi.updateMemberStatus(statusModalMember.id, selectedStatus);
      setActionSuccess(`Status updated to ${selectedStatus} for ${statusModalMember.fullName}.`);
      setStatusModalMember(null);
      fetchMembers();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Status change failed: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const departments = ['All', 'CSE', 'AIDS', 'IT', 'ECE', 'EEE', 'MECH'];
  const years = ['All', '1', '2', '3', '4'];
  const classSections = ['All', 'A', 'B', 'C', 'D'];
  const roles = ['All', 'student', 'instructor', 'admin', 'super_admin'];
  const statuses = ['All', 'Active', 'Inactive', 'Suspended'];

  return (
    <AdminLayout pageTitle="Member Management">
      {/* Action Notification Banner */}
      {actionSuccess && (
        <div style={{
          marginBottom: '1rem',
          padding: '10px 16px',
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          color: '#4ade80',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
          <div className="search-container" style={{ minWidth: 260, maxWidth: 380, flex: 1 }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, reg no, email..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select 
              value={department} 
              onChange={(e) => { setDepartment(e.target.value); setPage(1); }} 
              className="filter-select"
            >
              <option disabled>Department</option>
              {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>)}
            </select>

            <select 
              value={year} 
              onChange={(e) => { setYear(e.target.value); setPage(1); }} 
              className="filter-select"
            >
              <option disabled>Year</option>
              {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : `Year ${y}`}</option>)}
            </select>

            <select 
              value={classSection} 
              onChange={(e) => { setClassSection(e.target.value); setPage(1); }} 
              className="filter-select"
            >
              <option disabled>Section</option>
              {classSections.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sections' : `Sec ${s}`}</option>)}
            </select>

            <select 
              value={role} 
              onChange={(e) => { setRole(e.target.value); setPage(1); }} 
              className="filter-select"
            >
              <option disabled>Role</option>
              {roles.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r.toUpperCase()}</option>)}
            </select>

            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
              className="filter-select"
            >
              <option disabled>Status</option>
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
            </select>
          </div>
        </div>

        <button 
          className="btn-secondary" 
          onClick={handleExport}
          disabled={exporting}
          style={{ fontSize: '0.8125rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Download size={14} />
          <span>{exporting ? 'Generating CSV...' : 'Export Members CSV'}</span>
        </button>
      </div>

      {/* Main Members Table */}
      <div className="admin-table-container">
        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Loading members data...
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 8px' }} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && members.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <UserX size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>No members found</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              No members matched your search and filter criteria. Try resetting filters.
            </p>
          </div>
        )}

        {!loading && members.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Register No</th>
                <th>Dept / Year</th>
                <th>Role</th>
                <th>Profile Completion</th>
                <th>Engagement</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="member-cell">
                      <div className="member-avatar">
                        {m.fullName ? m.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{m.collegeEmail || m.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{m.registerNumber}</td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{m.department}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginLeft: 6 }}>
                      (Yr {m.year}-{m.classSection})
                    </span>
                  </td>
                  <td>
                    <span className={`badge-role badge-role-${m.role}`}>
                      {m.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                        <div 
                          style={{ 
                            width: `${m.profileCompletionPercentage}%`, 
                            height: '100%', 
                            background: m.profileCompletionPercentage >= 80 ? '#4ade80' : (m.profileCompletionPercentage >= 50 ? '#818cf8' : '#fb923c') 
                          }} 
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', width: 32 }}>
                        {m.profileCompletionPercentage}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, fontSize: '0.75rem' }}>
                      <span title="Events Attended" style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                        📅 {m.eventsAttended}
                      </span>
                      <span title="Courses Enrolled" style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                        📚 {m.coursesEnrolled}
                      </span>
                      <span title="Achievements" style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                        🏆 {m.achievementsEarned}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-status badge-status-${m.status.toLowerCase()}`}>
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Link 
                        to={`/admin/members/${m.id}`} 
                        className="btn-ghost" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        Inspect
                      </Link>
                      <button 
                        className="btn-ghost" 
                        style={{ padding: '4px 6px', fontSize: '0.75rem' }}
                        title="Change Member Role"
                        onClick={() => {
                          setRoleModalMember(m);
                          setSelectedRole(m.role);
                        }}
                      >
                        <Shield size={13} />
                      </button>
                      <button 
                        className="btn-ghost" 
                        style={{ padding: '4px 6px', fontSize: '0.75rem' }}
                        title="Change Account Status"
                        onClick={() => {
                          setStatusModalMember(m);
                          setSelectedStatus(m.status);
                        }}
                      >
                        <UserCheck size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Server-Side Pagination Footer */}
        {!loading && members.length > 0 && (
          <div className="admin-pagination">
            <div>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} members
            </div>
            <div className="admin-pagination-actions">
              <button 
                className="btn-ghost" 
                disabled={pagination.page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: '4px 8px' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontWeight: 600 }}>Page {pagination.page} of {pagination.totalPages}</span>
              <button 
                className="btn-ghost" 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '4px 8px' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {roleModalMember && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Modify Permissions & Role</h3>
              <button className="btn-ghost" onClick={() => setRoleModalMember(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                Updating role for <strong>{roleModalMember.fullName}</strong> ({roleModalMember.registerNumber}).
                This will be permanently recorded in the administrative audit log.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>
                  Select New Role:
                </label>
                <select 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="filter-select"
                  style={{ width: '100%', padding: '10px' }}
                >
                  <option value="student">STUDENT (Standard club learner)</option>
                  <option value="instructor">INSTRUCTOR (Course creator & educator)</option>
                  <option value="admin">ADMIN (Operations & management)</option>
                  <option value="super_admin">SUPER_ADMIN (Full platform governance)</option>
                </select>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-ghost" onClick={() => setRoleModalMember(null)}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={handleRoleChange}
                disabled={modalLoading}
              >
                {modalLoading ? 'Updating Role...' : 'Confirm Role Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Status Modal */}
      {statusModalMember && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Member Account Moderation</h3>
              <button className="btn-ghost" onClick={() => setStatusModalMember(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                Change account status for <strong>{statusModalMember.fullName}</strong>.
              </p>
              {selectedStatus === 'Suspended' && (
                <div style={{
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  color: '#f87171',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <AlertTriangle size={16} />
                  <span>Suspending this account will immediately revoke all portal access and team activities.</span>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>
                  Status:
                </label>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value as MemberStatus)}
                  className="filter-select"
                  style={{ width: '100%', padding: '10px' }}
                >
                  <option value="Active">Active (Full access)</option>
                  <option value="Inactive">Inactive (Dormant profile)</option>
                  <option value="Suspended">Suspended (Access blocked)</option>
                </select>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-ghost" onClick={() => setStatusModalMember(null)}>Cancel</button>
              <button 
                className={selectedStatus === 'Suspended' ? 'btn-danger' : 'btn-primary'} 
                onClick={handleStatusChange}
                disabled={modalLoading}
              >
                {modalLoading ? 'Saving...' : 'Apply Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
