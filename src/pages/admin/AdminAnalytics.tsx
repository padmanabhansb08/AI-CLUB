import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/admin.api';
import type { AnalyticsRange } from '../../types/admin';
import { 
  BarChart3, Users, Calendar, FolderGit2, BookOpen, Trophy, 
  Activity, RefreshCw, AlertTriangle, Filter
} from 'lucide-react';

type AnalyticsTab = 'overview' | 'members' | 'events' | 'projects' | 'courses' | 'achievements' | 'engagement';

export const AdminAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { range };
      if (range === 'custom') {
        if (customFrom) params.from = customFrom;
        if (customTo) params.to = customTo;
      }

      let res: any;
      if (activeTab === 'overview') {
        res = await adminApi.getDashboardKPIs(range, params.from, params.to);
      } else {
        res = await adminApi.getAnalytics(activeTab, params);
      }

      setData(res);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err?.message || 'Failed to fetch platform analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activeTab, range]);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics();
  };

  const renderBarChart = (items: Array<{ label: string; value: number }>, colorClass = 'bar-fill-accent') => {
    if (!items || items.length === 0) {
      return <p className="text-secondary text-sm italic py-4">No data recorded for this dimension.</p>;
    }
    const maxVal = Math.max(...items.map((i) => i.value), 1);

    return (
      <div className="simple-bar-chart">
        {items.map((item, idx) => (
          <div key={idx} className="bar-row">
            <span className="bar-label">{item.label}</span>
            <div className="bar-track">
              <div 
                className={`bar-fill ${colorClass}`} 
                style={{ width: `${(item.value / maxVal) * 100}%` }}
              />
            </div>
            <span className="bar-value">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderTimeSeries = (series: Array<{ date?: string; month?: string; count?: number; value?: number; newMembers?: number }>, title: string) => {
    if (!series || series.length === 0) {
      return <p className="text-secondary text-sm italic py-4">No time-series data available.</p>;
    }

    const dataPoints = series.map((s) => ({
      label: s.date ? s.date.slice(5) : (s.month || '—'),
      val: s.count ?? s.value ?? s.newMembers ?? 0,
    }));
    const maxVal = Math.max(...dataPoints.map((d) => d.val), 1);

    return (
      <div className="admin-timeseries-container">
        <h4 className="text-xs font-semibold text-secondary uppercase mb-3">{title}</h4>
        <div className="flex items-end gap-2 h-36 pt-4 border-b border-gray-800">
          {dataPoints.map((point, idx) => {
            const heightPct = Math.max(Math.round((point.val / maxVal) * 100), 4);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div 
                  className="w-full bg-accent/30 hover:bg-accent rounded-t transition-all"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] text-gray-400 truncate w-full text-center">
                  {point.label}
                </span>
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 border border-gray-700 text-xs px-2 py-0.5 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                  {point.label}: {point.val}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout pageTitle="Platform Analytics">
      <div className="admin-section">
        {/* Header Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <p className="text-secondary text-sm">
              Deterministic, backend-aggregated intelligence across all AI CLUB domains.
            </p>
          </div>

          {/* Time Range Filter Bar */}
          <div className="admin-toolbar-actions flex flex-wrap items-center gap-2">
            <div className="admin-date-filter-group">
              <span className="text-xs text-secondary mr-2 flex items-center gap-1">
                <Filter size={12} /> Range:
              </span>
              {(['today', '7d', '30d', '90d', 'this_year', 'custom'] as AnalyticsRange[]).map((r) => (
                <button
                  key={r}
                  className={`admin-filter-pill ${range === r ? 'active' : ''}`}
                  onClick={() => setRange(r)}
                >
                  {r === 'today' && 'Today'}
                  {r === '7d' && '7 Days'}
                  {r === '30d' && '30 Days'}
                  {r === '90d' && '90 Days'}
                  {r === 'this_year' && 'This Year'}
                  {r === 'custom' && 'Custom'}
                </button>
              ))}
            </div>

            <button className="btn btn-secondary btn-sm" onClick={fetchAnalytics} disabled={loading}>
              <RefreshCw size={14} className={`mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Custom Date Form */}
        {range === 'custom' && (
          <form onSubmit={handleApplyCustom} className="admin-card p-4 mb-6 flex flex-wrap items-center gap-4 bg-gray-900/60 border border-gray-800">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-secondary">From:</span>
              <input 
                type="date" 
                className="admin-input" 
                value={customFrom} 
                onChange={(e) => setCustomFrom(e.target.value)} 
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-secondary">To:</span>
              <input 
                type="date" 
                className="admin-input" 
                value={customTo} 
                onChange={(e) => setCustomTo(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Apply Date Filter
            </button>
          </form>
        )}

        {/* Domain Navigation Tabs */}
        <div className="admin-analytics-tabs mb-6">
          <button 
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={15} className="inline mr-1.5" /> Overview
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={15} className="inline mr-1.5" /> Members
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar size={15} className="inline mr-1.5" /> Events
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <FolderGit2 size={15} className="inline mr-1.5" /> Projects
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen size={15} className="inline mr-1.5" /> Learning
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <Trophy size={15} className="inline mr-1.5" /> Achievements
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'engagement' ? 'active' : ''}`}
            onClick={() => setActiveTab('engagement')}
          >
            <Activity size={15} className="inline mr-1.5" /> Engagement
          </button>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="admin-loading-container py-16">
            <div className="admin-spinner" />
            <p>Aggregating platform data for {activeTab} analytics...</p>
          </div>
        )}

        {error && !loading && (
          <div className="admin-error-box my-6">
            <AlertTriangle size={32} />
            <h3>Failed to load analytics</h3>
            <p>{error}</p>
            <button className="btn btn-primary mt-4" onClick={fetchAnalytics}>
              <RefreshCw size={14} className="inline mr-1" /> Retry
            </button>
          </div>
        )}

        {/* TAB CONTENTS */}
        {!loading && !error && data && (
          <>
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && data.summary && (
              <div className="space-y-6">
                <div className="admin-kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Members</span>
                      <div className="kpi-icon kpi-icon-blue"><Users size={18} /></div>
                    </div>
                    <div className="kpi-value">{data.summary.members?.totalMembers || 0}</div>
                    <div className="kpi-subtext">+{data.summary.members?.newMembersThisMonth || 0} new in period</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Events</span>
                      <div className="kpi-icon kpi-icon-purple"><Calendar size={18} /></div>
                    </div>
                    <div className="kpi-value">{data.summary.events?.totalEvents || 0}</div>
                    <div className="kpi-subtext">{data.summary.events?.registrationCount || 0} registrations ({data.summary.events?.attendanceRate || 0}% att.)</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Projects</span>
                      <div className="kpi-icon kpi-icon-orange"><FolderGit2 size={18} /></div>
                    </div>
                    <div className="kpi-value">{data.summary.projects?.totalProjects || 0}</div>
                    <div className="kpi-subtext">{data.summary.projects?.activeProjects || 0} active ({data.summary.projects?.activeTeams || 0} teams)</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Courses</span>
                      <div className="kpi-icon kpi-icon-green"><BookOpen size={18} /></div>
                    </div>
                    <div className="kpi-value">{data.summary.learning?.totalCourses || 0}</div>
                    <div className="kpi-subtext">{data.summary.learning?.totalEnrollments || 0} enrollments ({data.summary.learning?.completionRate || 0}% comp.)</div>
                  </div>
                </div>

                {data.trends && (
                  <div className="admin-detail-grid">
                    <div className="chart-card">
                      <h3 className="chart-title">Member Growth Velocity</h3>
                      {renderTimeSeries(data.trends.memberGrowth || [], 'New Registrations')}
                    </div>
                    <div className="chart-card">
                      <h3 className="chart-title">Event Activity & Attendance</h3>
                      {renderBarChart(
                        (data.trends.eventActivity || []).map((e: any) => ({
                          label: e.month,
                          value: e.attendance,
                        })),
                        'bar-fill-purple'
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. MEMBERS TAB */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="admin-kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-title">Total Members</div>
                    <div className="kpi-value">{data.summary?.totalMembers || 0}</div>
                    <div className="kpi-subtext">Registered club profiles</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Active Members</div>
                    <div className="kpi-value">{data.summary?.activeMembers || 0}</div>
                    <div className="kpi-subtext">Active account status</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">New Members</div>
                    <div className="kpi-value text-accent">+{data.summary?.newMembers || 0}</div>
                    <div className="kpi-subtext">Joined within selected range</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Avg Profile Completion</div>
                    <div className="kpi-value">{data.summary?.avgProfileCompletion || 0}%</div>
                    <div className="kpi-subtext">{data.summary?.inactiveMembers || 0} inactive accounts</div>
                  </div>
                </div>

                <div className="admin-detail-grid">
                  <div className="chart-card">
                    <h3 className="chart-title">Members by Department</h3>
                    {renderBarChart(
                      (data.byDepartment || []).map((d: any) => ({ label: d.department, value: d.count })),
                      'bar-fill-blue'
                    )}
                  </div>
                  <div className="chart-card">
                    <h3 className="chart-title">Members by Year</h3>
                    {renderBarChart(
                      (data.byYear || []).map((y: any) => ({ label: `Year ${y.year}`, value: y.count })),
                      'bar-fill-cyan'
                    )}
                  </div>
                  <div className="chart-card">
                    <h3 className="chart-title">Role Distribution</h3>
                    {renderBarChart(
                      (data.byRole || []).map((r: any) => ({ label: r.role.toUpperCase(), value: r.count })),
                      'bar-fill-orange'
                    )}
                  </div>
                  <div className="chart-card">
                    <h3 className="chart-title">Member Growth Over Time</h3>
                    {renderTimeSeries(data.growth || [], 'New Members')}
                  </div>
                </div>
              </div>
            )}

            {/* 3. EVENTS TAB */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="admin-kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-title">Total Events</div>
                    <div className="kpi-value">{data.summary?.totalEvents || 0}</div>
                    <div className="kpi-subtext">{data.summary?.publishedEvents || 0} published</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Total Registrations</div>
                    <div className="kpi-value">{data.summary?.totalRegistrations || 0}</div>
                    <div className="kpi-subtext">Across selected date range</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Total Attendance</div>
                    <div className="kpi-value">{data.summary?.totalAttendance || 0}</div>
                    <div className="kpi-subtext">{data.summary?.completedEvents || 0} completed events</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Overall Attendance Rate</div>
                    <div className="kpi-value text-accent">{data.summary?.attendanceRate || 0}%</div>
                    <div className="kpi-subtext">Attended vs Registered</div>
                  </div>
                </div>

                <div className="admin-detail-grid">
                  <div className="chart-card">
                    <h3 className="chart-title">Events by Category / Type</h3>
                    {renderBarChart(
                      (data.byType || []).map((t: any) => ({ label: t.type, value: t.count })),
                      'bar-fill-purple'
                    )}
                  </div>
                  <div className="chart-card">
                    <h3 className="chart-title">Event Activity & Attendance Over Time</h3>
                    {renderTimeSeries(
                      (data.activitySeries || []).map((s: any) => ({ date: s.date, count: s.attendance })),
                      'Daily Attendance'
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="admin-kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-title">Total Projects</div>
                    <div className="kpi-value">{data.summary?.totalProjects || 0}</div>
                    <div className="kpi-subtext">Across club repository</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Active Projects</div>
                    <div className="kpi-value">{data.summary?.activeProjects || 0}</div>
                    <div className="kpi-subtext">Currently in development</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Total Teams</div>
                    <div className="kpi-value">{data.summary?.totalTeams || 0}</div>
                    <div className="kpi-subtext">Avg team size: {data.summary?.avgTeamSize || 0}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Completion Rate</div>
                    <div className="kpi-value text-accent">{data.summary?.completionRate || 0}%</div>
                    <div className="kpi-subtext">{data.summary?.completedProjects || 0} delivered</div>
                  </div>
                </div>

                <div className="admin-detail-grid">
                  <div className="chart-card">
                    <h3 className="chart-title">Projects by Status</h3>
                    {renderBarChart(
                      (data.byStatus || []).map((s: any) => ({ label: s.status, value: s.count })),
                      'bar-fill-orange'
                    )}
                  </div>
                  <div className="chart-card">
                    <h3 className="chart-title">Project Creation Velocity</h3>
                    {renderTimeSeries(data.activitySeries || [], 'New Projects')}
                  </div>
                </div>
              </div>
            )}

            {/* 5. COURSES TAB */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="admin-kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-title">Total Courses</div>
                    <div className="kpi-value">{data.summary?.totalCourses || 0}</div>
                    <div className="kpi-subtext">{data.summary?.publishedCourses || 0} published</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Total Enrollments</div>
                    <div className="kpi-value">{data.summary?.totalEnrollments || 0}</div>
                    <div className="kpi-subtext">{data.summary?.activeLearners || 0} active learners</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Completions</div>
                    <div className="kpi-value">{data.summary?.completedLearners || 0}</div>
                    <div className="kpi-subtext">Fully finished courses</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Overall Completion Rate</div>
                    <div className="kpi-value text-accent">{data.summary?.overallCompletionRate || 0}%</div>
                    <div className="kpi-subtext">Course completion efficiency</div>
                  </div>
                </div>

                <div className="admin-detail-grid">
                  <div className="chart-card">
                    <h3 className="chart-title">Courses by Category</h3>
                    {renderBarChart(
                      (data.byCategory || []).map((c: any) => ({ label: c.category, value: c.count })),
                      'bar-fill-green'
                    )}
                  </div>
                  <div className="chart-card">
                    <h3 className="chart-title">Courses by Difficulty</h3>
                    {renderBarChart(
                      (data.byDifficulty || []).map((d: any) => ({ label: d.difficulty.toUpperCase(), value: d.count })),
                      'bar-fill-cyan'
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 6. ACHIEVEMENTS TAB */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div className="admin-kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-title">Active Badges</div>
                    <div className="kpi-value">{data.summary?.activeDefinitions || 0}</div>
                    <div className="kpi-subtext">Out of {data.summary?.totalDefinitions || 0} definitions</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Total Awarded</div>
                    <div className="kpi-value">{data.summary?.totalEarned || 0}</div>
                    <div className="kpi-subtext">Achievements earned</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Unique Earners</div>
                    <div className="kpi-value text-accent">{data.summary?.uniqueEarners || 0}</div>
                    <div className="kpi-subtext">Distinct students</div>
                  </div>
                </div>

                <div className="admin-detail-grid">
                  <div className="chart-card">
                    <h3 className="chart-title">Achievements by Category</h3>
                    {renderBarChart(
                      (data.byCategory || []).map((c: any) => ({ label: c.category, value: c.count })),
                      'bar-fill-accent'
                    )}
                  </div>

                  <div className="chart-card">
                    <h3 className="chart-title">Top Most Earned Achievements</h3>
                    {data.mostEarned && data.mostEarned.length > 0 ? (
                      <div className="space-y-3 pt-2">
                        {data.mostEarned.map((ach: any) => (
                          <div key={ach.id} className="flex items-center justify-between p-2.5 bg-gray-900/60 rounded border border-gray-800">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{ach.icon || '🏆'}</span>
                              <div>
                                <h4 className="text-sm font-semibold text-white">{ach.title}</h4>
                                <span className="text-xs text-secondary">{ach.category} • +{ach.points} pts</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-accent">{ach.count}</span>
                              <span className="text-xs text-secondary block">earned</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-secondary text-sm italic py-4">No achievement awards yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 7. ENGAGEMENT TAB */}
            {activeTab === 'engagement' && (
              <div className="space-y-6">
                <div className="admin-kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-title">Active Members in Range</div>
                    <div className="kpi-value">{data.summary?.activeMembers || 0}</div>
                    <div className="kpi-subtext">Recorded active interactions</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Total Platform Activities</div>
                    <div className="kpi-value">{data.summary?.totalActivities || 0}</div>
                    <div className="kpi-subtext">Across all member actions</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Event Participations</div>
                    <div className="kpi-value">{data.summary?.eventsAttended || 0}</div>
                    <div className="kpi-subtext">Check-ins confirmed</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-title">Lessons Completed</div>
                    <div className="kpi-value text-accent">{data.summary?.lessonsCompleted || 0}</div>
                    <div className="kpi-subtext">{data.summary?.achievementsEarned || 0} achievements unlocked</div>
                  </div>
                </div>

                <div className="admin-detail-grid">
                  <div className="chart-card">
                    <h3 className="chart-title">Activity by Type</h3>
                    {renderBarChart(
                      (data.byActivityType || []).map((a: any) => ({ label: a.type, value: a.count })),
                      'bar-fill-cyan'
                    )}
                  </div>
                  <div className="chart-card">
                    <h3 className="chart-title">Engagement Activity Stream Over Time</h3>
                    {renderTimeSeries(data.activitySeries || [], 'Daily Engagement Events')}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};
