import { notifyError } from '../../services/actionFeedback';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, FolderGit2, BookOpen, Trophy, Bell, 
  Download, History, Shield, ArrowUpRight, Megaphone, 
  RefreshCw, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/admin.api';
import type { AdminDashboardKPIs, DateRangePreset } from '../../types/admin';

export const AdminOverview: React.FC = () => {
  const [range, setRange] = useState<DateRangePreset>('30d');
  const [data, setData] = useState<AdminDashboardKPIs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const fetchDashboard = async (selectedRange: DateRangePreset) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDashboardKPIs(selectedRange);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load dashboard KPIs:', err);
      setError(err.message || 'Failed to connect to Admin Analytics Service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(range);
  }, [range]);

  const handleExport = async (type: 'members' | 'events' | 'attendance' | 'course-enrollments' | 'achievements') => {
    try {
      setExporting(type);
      setExportMessage(null);
      await adminApi.downloadExport(type);
      setExportMessage(`Successfully exported ${type.replace('-', ' ')} CSV.`);
      setTimeout(() => setExportMessage(null), 4000);
    } catch (err: any) {
      notifyError(`Export failed: ${err.message}`);
    } finally {
      setExporting(null);
    }
  };

  const rangeOptions: { label: string; value: DateRangePreset }[] = [
    { label: 'Today', value: 'today' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: 'This Year', value: 'this_year' },
  ];

  return (
    <AdminLayout pageTitle="Club overview">
      {/* Top Controls Toolbar */}
      <div className="admin-toolbar">
        <div className="date-filter-group">
          <span className="text-secondary" style={{ fontSize: '0.8125rem', fontWeight: 600, marginRight: 4 }}>
            TIME RANGE:
          </span>
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              className={`range-btn ${range === opt.value ? 'active' : ''}`}
              onClick={() => setRange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
          <button 
            className="btn-ghost" 
            style={{ padding: '6px 10px', marginLeft: 6 }} 
            onClick={() => fetchDashboard(range)}
            title="Refresh statistics"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary" 
            style={{ fontSize: '0.8125rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => handleExport('members')}
            disabled={!!exporting}
          >
            <Download size={14} />
            <span>{exporting === 'members' ? 'Exporting...' : 'Export Members CSV'}</span>
          </button>

          <Link 
            to="/admin/applications" 
            className="btn-primary"
            style={{ fontSize: '0.8125rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, background: '#2563eb' }}
          >
            <Users size={14} />
            <span>Review Applications</span>
          </Link>

          <Link 
            to="/admin/audit-logs" 
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <History size={14} />
            <span>Audit Trail</span>
          </Link>

          <Link 
            to="/admin/notifications" 
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Megaphone size={14} />
            <span>New Announcement</span>
          </Link>
        </div>
      </div>

      {exportMessage && (
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
          <span>{exportMessage}</span>
        </div>
      )}

      {loading && !data && (
        <div className="admin-loading-container py-16">
          <div className="admin-spinner" />
          <p>Analyzing Platform Telemetry... Aggregating live members, events, LMS, and collaboration metrics.</p>
        </div>
      )}

      {error && !data && (
        <div className="admin-error-box my-6">
          <AlertTriangle size={32} />
          <h3>Telemetry Unavailable</h3>
          <p>{error}</p>
          <button className="btn btn-primary mt-4" onClick={() => fetchDashboard(range)}>
            <RefreshCw size={14} className="inline mr-1" /> Retry Connection
          </button>
        </div>
      )}

      {data && (
        <>
          {/* 6 High-Level Platform Domain KPI Cards */}
          <div className="kpi-grid">
            {/* 1. Members */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Members Directory</span>
                <div className="kpi-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                  <Users size={18} />
                </div>
              </div>
              <div className="kpi-main-stat">{data.members.total.toLocaleString()}</div>
              <div className="kpi-substats">
                <div className="kpi-substat-item">
                  <span>Active:</span>
                  <span className="kpi-substat-value" style={{ color: '#4ade80' }}>{data.members.active}</span>
                </div>
                <div className="kpi-substat-item">
                  <span>New in period:</span>
                  <span className="kpi-substat-value">+{data.members.newInPeriod}</span>
                </div>
                <div className="kpi-substat-item">
                  <span>Profile Completion:</span>
                  <span className="kpi-substat-value">{data.members.completionRate}%</span>
                </div>
              </div>
            </div>

            {/* 2. Events & Attendance */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Events & Operations</span>
                <div className="kpi-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                  <Calendar size={18} />
                </div>
              </div>
              <div className="kpi-main-stat">{data.events.total}</div>
              <div className="kpi-substats">
                <div className="kpi-substat-item">
                  <span>Upcoming:</span>
                  <span className="kpi-substat-value" style={{ color: '#60a5fa' }}>{data.events.upcoming}</span>
                </div>
                <div className="kpi-substat-item">
                  <span>Registrations:</span>
                  <span className="kpi-substat-value">{data.events.registrationsCount}</span>
                </div>
                <div className="kpi-substat-item">
                  <span>Attendance Rate:</span>
                  <span className="kpi-substat-value" style={{ color: '#38bdf8' }}>{data.events.attendanceRate}%</span>
                </div>
              </div>
            </div>

            {/* 3. Projects & Teams */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Projects & Teams</span>
                <div className="kpi-icon-wrapper" style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#fb923c' }}>
                  <FolderGit2 size={18} />
                </div>
              </div>
              <div className="kpi-main-stat">{data.projects.total}</div>
              <div className="kpi-substats">
                <div className="kpi-substat-item">
                  <span>Active:</span>
                  <span className="kpi-substat-value" style={{ color: '#fb923c' }}>{data.projects.active}</span>
                </div>
                <div className="kpi-substat-item">
                  <span>Completed:</span>
                  <span className="kpi-substat-value">{data.projects.completed}</span>
                </div>
                <div className="kpi-substat-item">
                  <span>Active Teams:</span>
                  <span className="kpi-substat-value">{data.projects.activeTeams}</span>
                </div>
              </div>
            </div>

            {/* 4. LMS & Learning */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Courses & LMS</span>
                <div className="kpi-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <BookOpen size={18} />
                </div>
              </div>
              <div className="kpi-main-stat">{data.learning.totalCourses}</div>
              <div className="kpi-substats">
                <div className="kpi-substat-item">
                  <span>Published:</span>
                  <span className="kpi-substat-value">{data.learning.publishedCourses}</span>
                </div>
                <div className="kpi-substat-item">
                  <span>Enrollments:</span>
                  <span className="kpi-substat-value">{data.learning.totalEnrollments}</span>
                </div>
                <div className="kpi-substat-item">
                  <span>Completion Rate:</span>
                  <span className="kpi-substat-value" style={{ color: '#4ade80' }}>{data.learning.completionRate}%</span>
                </div>
              </div>
            </div>

            {/* 5. Achievements */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Recognition & Badges</span>
                <div className="kpi-icon-wrapper" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
                  <Trophy size={18} />
                </div>
              </div>
              <div className="kpi-main-stat">{data.achievements.totalEarned}</div>
              <div className="kpi-substats">
                <div className="kpi-substat-item">
                  <span>Badges Defined:</span>
                  <span className="kpi-substat-value">{data.achievements.totalDefinitions}</span>
                </div>
                <div className="kpi-substat-item">
                  <span>Active:</span>
                  <span className="kpi-substat-value">{data.achievements.activeDefinitions}</span>
                </div>
                <div className="kpi-substat-item">
                  <span>Earners:</span>
                  <span className="kpi-substat-value">{data.achievements.uniqueEarners}</span>
                </div>
              </div>
            </div>

            {/* 6. Notifications */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Notifications & Comms</span>
                <div className="kpi-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                  <Bell size={18} />
                </div>
              </div>
              <div className="kpi-main-stat">{data.notifications.totalSent.toLocaleString()}</div>
              <div className="kpi-substats">
                <div className="kpi-substat-item">
                  <span>Unread:</span>
                  <span className="kpi-substat-value" style={{ color: '#f87171' }}>{data.notifications.unreadCount}</span>
                </div>
                <div className="kpi-substat-item">
                  <span>Announcements:</span>
                  <span className="kpi-substat-value">{data.notifications.recentAnnouncementsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualizations Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(450px, 100%), 1fr))', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
            
            {/* Chart 1: Member Growth */}
            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="chart-title" style={{ margin: 0 }}>Member Growth Velocity</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>New signups in {range}</span>
              </div>
              {data.trends.memberGrowth && data.trends.memberGrowth.length > 0 ? (
                <div style={{ height: 220, position: 'relative' }}>
                  <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
                    <line x1="0" y1="40" x2="500" y2="40" className="chart-grid-line" />
                    <line x1="0" y1="90" x2="500" y2="90" className="chart-grid-line" />
                    <line x1="0" y1="140" x2="500" y2="140" className="chart-grid-line" />
                    <line x1="0" y1="180" x2="500" y2="180" className="chart-grid-line" />
                    {/* Render bars for growth points */}
                    {data.trends.memberGrowth.map((point, idx) => {
                      const totalPoints = data.trends.memberGrowth.length;
                      const barWidth = Math.max(10, Math.min(30, 400 / totalPoints));
                      const x = 30 + idx * ((460 - 30) / Math.max(1, totalPoints - 1));
                      const maxVal = Math.max(...data.trends.memberGrowth.map((p) => p.newMembers), 5);
                      const barHeight = (point.newMembers / maxVal) * 140;
                      const y = 180 - barHeight;
                      return (
                        <g key={point.date}>
                          <rect
                            x={x - barWidth / 2}
                            y={y}
                            width={barWidth}
                            height={Math.max(4, barHeight)}
                            fill="url(#accentGradient)"
                            className="chart-bar-rect"
                          />
                          <text x={x} y="196" textAnchor="middle" className="chart-axis-text">
                            {point.date.slice(5)}
                          </text>
                        </g>
                      );
                    })}
                    <defs>
                      <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  No member registrations recorded for this specific range.
                </div>
              )}
            </div>

            {/* Chart 2: Event Attendance & Activity */}
            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="chart-title" style={{ margin: 0 }}>Event Participation History</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Past 12 Months</span>
              </div>
              {data.trends.eventActivity && data.trends.eventActivity.length > 0 ? (
                <div style={{ height: 220 }}>
                  <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
                    <line x1="0" y1="50" x2="500" y2="50" className="chart-grid-line" />
                    <line x1="0" y1="110" x2="500" y2="110" className="chart-grid-line" />
                    <line x1="0" y1="170" x2="500" y2="170" className="chart-grid-line" />
                    {data.trends.eventActivity.map((item, idx) => {
                      const total = data.trends.eventActivity.length;
                      const x = 35 + idx * ((460 - 35) / Math.max(1, total - 1));
                      const maxEvents = Math.max(...data.trends.eventActivity.map((e) => e.eventsCount), 5);
                      const h = (item.eventsCount / maxEvents) * 130;
                      return (
                        <g key={item.month}>
                          <rect
                            x={x - 12}
                            y={170 - h}
                            width="24"
                            height={Math.max(4, h)}
                            fill="#c084fc"
                            className="chart-bar-rect"
                          />
                          <text x={x} y="190" textAnchor="middle" className="chart-axis-text">
                            {item.month.slice(5)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  No event records found for historical trend.
                </div>
              )}
            </div>

            {/* Chart 3: Learning Engagement */}
            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="chart-title" style={{ margin: 0 }}>Course Enrollments vs Completions</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Monthly Flow</span>
              </div>
              {data.trends.learningEngagement && data.trends.learningEngagement.length > 0 ? (
                <div style={{ height: 220 }}>
                  <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
                    <line x1="0" y1="60" x2="500" y2="60" className="chart-grid-line" />
                    <line x1="0" y1="120" x2="500" y2="120" className="chart-grid-line" />
                    <line x1="0" y1="170" x2="500" y2="170" className="chart-grid-line" />
                    {data.trends.learningEngagement.map((item, idx) => {
                      const total = data.trends.learningEngagement.length;
                      const x = 40 + idx * ((460 - 40) / Math.max(1, total - 1));
                      const maxL = Math.max(...data.trends.learningEngagement.map((e) => Math.max(e.enrollments, e.completions)), 5);
                      const hEn = (item.enrollments / maxL) * 120;
                      const hComp = (item.completions / maxL) * 120;
                      return (
                        <g key={item.month}>
                          {/* Enrollment bar */}
                          <rect x={x - 14} y={170 - hEn} width="12" height={Math.max(2, hEn)} fill="#38bdf8" rx="2" />
                          {/* Completion bar */}
                          <rect x={x + 2} y={170 - hComp} width="12" height={Math.max(2, hComp)} fill="#4ade80" rx="2" />
                          <text x={x} y="190" textAnchor="middle" className="chart-axis-text">
                            {item.month.slice(5)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  No enrollment trends recorded.
                </div>
              )}
            </div>

            {/* Chart 4: Project Portfolio Status */}
            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="chart-title" style={{ margin: 0 }}>Project Portfolio Lifecycle</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total: {data.projects.total}</span>
              </div>
              <div className="simple-bar-chart" style={{ marginTop: '12px' }}>
                {data.trends.projectActivity && data.trends.projectActivity.map((item) => {
                  const maxP = Math.max(...data.trends.projectActivity.map((p) => p.count), 1);
                  const pct = Math.round((item.count / maxP) * 100);
                  return (
                    <div className="bar-row" key={item.status}>
                      <span className="bar-label">{item.status}</span>
                      <div className="bar-track">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${pct}%`,
                            background: item.status === 'COMPLETED' ? '#4ade80' : (item.status === 'OPEN' || item.status === 'ACTIVE' ? '#fb923c' : '#818cf8')
                          }} 
                        />
                      </div>
                      <span className="bar-value">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Audit & System Operations Activity */}
          <div className="admin-section">
            <div className="admin-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={20} color="#818cf8" />
                <h3 className="admin-section-title" style={{ margin: 0 }}>Recent Administrative Activity</h3>
              </div>
              <Link to="/admin/audit-logs" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>View Full Audit Log</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Entity Reference</th>
                    <th>Administrator</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentActivity && data.recentActivity.length > 0 ? (
                    data.recentActivity.map((act) => (
                      <tr key={act.id}>
                        <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                          <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                          {new Date(act.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <span className="badge-role badge-role-admin" style={{ fontSize: '0.7rem' }}>
                            {act.action}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{act.entityType}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {act.entityId}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.875rem' }}>
                            {act.actorEmail || 'System Process'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                        No audit actions logged in this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};
