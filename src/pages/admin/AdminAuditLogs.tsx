import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/admin.api';
import type { AuditLogItem, PaginationData } from '../../types/admin';
import { 
  FileText, Shield, Search, RefreshCw, AlertTriangle, 
  Eye, ChevronLeft, ChevronRight, Terminal
} from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit: pagination.limit,
      };
      if (search.trim()) params.search = search.trim();
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entityType = entityFilter;

      const res = await adminApi.getAuditLogs(params);
      if (res && res.items) {
        setLogs(res.items);
        setPagination({
          page: res.page || page,
          limit: res.limit || 15,
          total: res.total || 0,
          totalPages: res.totalPages || 1,
        });
      }
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err?.message || 'Failed to load administrative audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter, entityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const getActionBadgeClass = (action: string) => {
    if (action.includes('SUSPEND') || action.includes('CANCEL') || action.includes('ARCHIVE') || action.includes('DEACTIVATE')) {
      return 'action-danger';
    }
    if (action.includes('ROLE') || action.includes('PERMISSION') || action.includes('CHANGE')) {
      return 'action-warning';
    }
    if (action.includes('CREATE') || action.includes('PUBLISH') || action.includes('ACTIVATE') || action.includes('RESTORE')) {
      return 'action-success';
    }
    return 'action-info';
  };

  return (
    <AdminLayout pageTitle="Audit Logs">
      <div className="admin-section">
        {/* Header description */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <p className="text-secondary text-sm">
              Immutable security and administrative action trail for compliance, operations, and governance.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => fetchLogs(pagination.page)} disabled={loading}>
            <RefreshCw size={14} className={`mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Filter Bar */}
        <div className="admin-toolbar mb-6">
          <form onSubmit={handleSearchSubmit} className="admin-search-box flex-1">
            <Search size={16} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search by action, entity ID, or actor..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
            {search && (
              <button 
                type="button" 
                className="text-xs text-secondary hover:text-white"
                onClick={() => { setSearch(''); fetchLogs(1); }}
              >
                Clear
              </button>
            )}
          </form>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary">Action:</span>
              <select 
                className="admin-select"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="MEMBER_ROLE_CHANGED">MEMBER_ROLE_CHANGED</option>
                <option value="MEMBER_STATUS_CHANGED">MEMBER_STATUS_CHANGED</option>
                <option value="EVENT_CREATED">EVENT_CREATED</option>
                <option value="EVENT_PUBLISHED">EVENT_PUBLISHED</option>
                <option value="EVENT_CANCELLED">EVENT_CANCELLED</option>
                <option value="COURSE_PUBLISHED">COURSE_PUBLISHED</option>
                <option value="COURSE_ARCHIVED">COURSE_ARCHIVED</option>
                <option value="ACHIEVEMENT_CREATED">ACHIEVEMENT_CREATED</option>
                <option value="ACHIEVEMENT_UPDATED">ACHIEVEMENT_UPDATED</option>
                <option value="ANNOUNCEMENT_CREATED">ANNOUNCEMENT_CREATED</option>
                <option value="DATA_EXPORTED">DATA_EXPORTED</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary">Entity:</span>
              <select 
                className="admin-select"
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
              >
                <option value="">All Entities</option>
                <option value="USER">USER</option>
                <option value="MEMBER">MEMBER</option>
                <option value="EVENT">EVENT</option>
                <option value="COURSE">COURSE</option>
                <option value="PROJECT">PROJECT</option>
                <option value="ACHIEVEMENT">ACHIEVEMENT</option>
                <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                <option value="EXPORT">EXPORT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="admin-loading-container py-12">
            <div className="admin-spinner" />
            <p>Querying immutable audit records...</p>
          </div>
        )}

        {error && !loading && (
          <div className="admin-error-box my-6">
            <AlertTriangle size={32} />
            <h3>Failed to load audit logs</h3>
            <p>{error}</p>
            <button className="btn btn-primary mt-4" onClick={() => fetchLogs(pagination.page)}>
              <RefreshCw size={14} className="inline mr-1" /> Retry
            </button>
          </div>
        )}

        {/* Audit Logs Table */}
        {!loading && !error && (
          <div className="admin-table-card">
            {logs.length === 0 ? (
              <div className="admin-empty-state py-12">
                <FileText size={40} />
                <p>No audit log entries found matching the specified filters.</p>
              </div>
            ) : (
              <>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Administrator</th>
                        <th>Action</th>
                        <th>Entity</th>
                        <th>Entity ID</th>
                        <th>Network / Host</th>
                        <th className="text-right">Inspection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td className="text-sm whitespace-nowrap">
                            <span className="font-mono text-xs text-gray-300">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                                {log.actorName ? log.actorName.charAt(0).toUpperCase() : 'A'}
                              </div>
                              <div>
                                <span className="text-xs font-medium text-white block">
                                  {log.actorName || log.actorEmail || 'System / Service'}
                                </span>
                                {log.actorEmail && log.actorName && (
                                  <span className="text-[10px] text-secondary font-mono">{log.actorEmail}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`admin-action-badge ${getActionBadgeClass(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td>
                            <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs font-mono">
                              {log.entityType}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs font-mono text-secondary truncate max-w-[120px] block" title={log.entityId}>
                              {log.entityId}
                            </span>
                          </td>
                          <td className="text-xs text-gray-400 font-mono">
                            {log.ipAddress || '127.0.0.1'}
                          </td>
                          <td className="text-right">
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye size={13} className="mr-1" /> View Diff
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="admin-pagination flex items-center justify-between p-4 border-t border-gray-800 text-sm">
                  <span className="text-secondary text-xs">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} audit entries
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      className="btn btn-secondary btn-sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchLogs(pagination.page - 1)}
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <span className="text-xs font-mono px-2">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button 
                      className="btn btn-secondary btn-sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchLogs(pagination.page + 1)}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* LOG DETAIL & DIFF MODAL */}
        {selectedLog && (
          <div className="admin-modal-backdrop" onClick={() => setSelectedLog(null)}>
            <div className="admin-modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-accent" />
                  <h3 className="text-base font-semibold">Audit Record #{selectedLog.id.slice(0, 8)}</h3>
                </div>
                <button className="admin-modal-close" onClick={() => setSelectedLog(null)}>✕</button>
              </div>

              <div className="admin-modal-body space-y-4">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-gray-900/60 p-3 rounded border border-gray-800 text-xs">
                  <div>
                    <span className="text-secondary block">Action:</span>
                    <span className={`admin-action-badge mt-1 ${getActionBadgeClass(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary block">Timestamp:</span>
                    <span className="font-mono text-gray-200 mt-1 block">
                      {new Date(selectedLog.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary block">Administrator:</span>
                    <span className="text-white mt-1 block font-medium">
                      {selectedLog.actorName || selectedLog.actorEmail || 'System / Background Service'}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary block">Target Entity:</span>
                    <span className="font-mono text-gray-200 mt-1 block">
                      {selectedLog.entityType} ({selectedLog.entityId})
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary block">Client IP:</span>
                    <span className="font-mono text-gray-400 mt-1 block">
                      {selectedLog.ipAddress || 'Not recorded'}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary block">User Agent:</span>
                    <span className="font-mono text-gray-400 mt-1 block truncate" title={selectedLog.userAgent}>
                      {selectedLog.userAgent || 'Not recorded'}
                    </span>
                  </div>
                </div>

                {/* State Diff */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-secondary uppercase flex items-center gap-1">
                    <Terminal size={14} /> State Transition (Before vs After)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-950 p-3 rounded border border-gray-800">
                      <span className="text-[11px] font-semibold text-red-400 block mb-2">BEFORE DATA:</span>
                      <pre className="text-xs font-mono text-gray-300 overflow-x-auto max-h-48 whitespace-pre-wrap">
                        {selectedLog.beforeData 
                          ? JSON.stringify(selectedLog.beforeData, null, 2)
                          : '<Initial State / Empty>'}
                      </pre>
                    </div>

                    <div className="bg-gray-950 p-3 rounded border border-gray-800">
                      <span className="text-[11px] font-semibold text-green-400 block mb-2">AFTER DATA:</span>
                      <pre className="text-xs font-mono text-gray-300 overflow-x-auto max-h-48 whitespace-pre-wrap">
                        {selectedLog.afterData 
                          ? JSON.stringify(selectedLog.afterData, null, 2)
                          : '<Final State / Empty>'}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedLog(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
