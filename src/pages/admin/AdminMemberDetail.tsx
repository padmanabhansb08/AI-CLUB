import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/admin.api';
import type { MemberDetailView, UserRole } from '../../types/admin';
import { 
  ArrowLeft, Shield, Award, BookOpen, Calendar, FolderGit2, 
  CheckCircle2, Clock, AlertTriangle, Mail, Phone, ExternalLink, 
  Activity, UserCheck, UserX, UserMinus, RefreshCw
} from 'lucide-react';

export const AdminMemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<MemberDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'events' | 'courses' | 'projects' | 'achievements' | 'activity'>('profile');

  // Role Modal state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>('student');
  const [roleReason, setRoleReason] = useState('');
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  // Status Modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>('Active');
  const [statusReason, setStatusReason] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchMemberDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getMemberDetail(id);
      if (res && res.profile) {
        setDetail(res as any);
      } else {
        setError('Failed to load member profile');
      }
    } catch (err: any) {
      setError(err?.message || 'Error loading member details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberDetail();
  }, [id]);

  const handleRoleChange = async () => {
    if (!id || !targetRole) return;
    try {
      setRoleSubmitting(true);
      setActionError(null);
      await adminApi.updateMemberRole(id, targetRole);
      setActionSuccess(`Role successfully updated to ${targetRole.toUpperCase()}`);
      setRoleModalOpen(false);
      setRoleReason('');
      await fetchMemberDetail();
    } catch (err: any) {
      setActionError(err?.message || 'Role change failed');
    } finally {
      setRoleSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!id || !targetStatus) return;
    try {
      setStatusSubmitting(true);
      setActionError(null);
      await adminApi.updateMemberStatus(id, targetStatus);
      setActionSuccess(`Status successfully changed to ${targetStatus}`);
      setStatusModalOpen(false);
      setStatusReason('');
      await fetchMemberDetail();
    } catch (err: any) {
      setActionError(err?.message || 'Status change failed');
    } finally {
      setStatusSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Member Profile">
        <div className="admin-loading-container">
          <div className="admin-spinner" />
          <p>Loading member details and activity history...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !detail) {
    return (
      <AdminLayout pageTitle="Member Not Found">
        <div className="admin-error-box">
          <AlertTriangle size={32} />
          <h3>Unable to Load Member</h3>
          <p>{error || "The requested member profile could not be found."}</p>
          <div className="flex gap-3 justify-center mt-4">
            <button className="btn btn-secondary" onClick={() => navigate('/admin/members')}>
              Back to Members Directory
            </button>
            <button className="btn btn-primary" onClick={fetchMemberDetail}>
              <RefreshCw size={14} className="inline mr-1" /> Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { profile, stats, events, courses, projects, teams, achievements, recentActivity } = detail;

  const getStatusBadge = (status: string) => {
    const s = (status || 'ACTIVE').toUpperCase();
    if (s === 'ACTIVE') return <span className="status-badge status-open"><CheckCircle2 size={12} className="inline mr-1" /> Active</span>;
    if (s === 'SUSPENDED') return <span className="status-badge status-cancelled"><UserX size={12} className="inline mr-1" /> Suspended</span>;
    return <span className="status-badge status-draft"><UserMinus size={12} className="inline mr-1" /> Inactive</span>;
  };

  const getRoleBadge = (role: string) => {
    const r = (role || 'STUDENT').toUpperCase();
    if (r === 'SUPER_ADMIN') return <span className="admin-role-badge role-super-admin">Super Admin</span>;
    if (r === 'ADMIN') return <span className="admin-role-badge role-admin">Admin</span>;
    if (r === 'INSTRUCTOR') return <span className="admin-role-badge role-instructor">Instructor</span>;
    return <span className="admin-role-badge role-student">Student</span>;
  };

  return (
    <AdminLayout pageTitle={`${profile.fullName} — Member Details`}>
      <div className="admin-section">
        {/* Navigation back */}
        <div className="flex justify-between items-center mb-4">
          <button className="back-btn" onClick={() => navigate('/admin/members')}>
            <ArrowLeft size={16} /> Back to Members
          </button>
          <button className="btn btn-secondary btn-sm" onClick={fetchMemberDetail}>
            <RefreshCw size={14} className="inline mr-1" /> Refresh
          </button>
        </div>

        {/* Action feedback */}
        {actionSuccess && (
          <div className="admin-feedback admin-feedback-success mb-4" onClick={() => setActionSuccess(null)}>
            <span>{actionSuccess}</span>
            <span className="text-xs cursor-pointer ml-4">✕</span>
          </div>
        )}
        {actionError && (
          <div className="admin-feedback admin-feedback-error mb-4" onClick={() => setActionError(null)}>
            <span>{actionError}</span>
            <span className="text-xs cursor-pointer ml-4">✕</span>
          </div>
        )}

        {/* Member Header Card */}
        <div className="admin-member-header-card">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="admin-member-avatar-large">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="admin-member-name">{profile.fullName}</h1>
                  {getRoleBadge(profile.role)}
                  {getStatusBadge(profile.status)}
                </div>
                <div className="admin-member-submeta flex flex-wrap gap-4 mt-1 text-sm text-secondary">
                  <span>Reg No: <strong>{profile.registerNumber}</strong></span>
                  <span>Dept: <strong>{profile.department}</strong></span>
                  <span>Year: <strong>{profile.year}</strong> (Sec: {profile.classSection || 'N/A'})</span>
                  <span>Member Since: <strong>{new Date(profile.joinedAt).toLocaleDateString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Moderation Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setTargetRole(profile.role);
                  setRoleModalOpen(true);
                }}
              >
                <Shield size={14} className="inline mr-1" /> Change Role
              </button>
              <button 
                className={`btn btn-sm ${profile.status?.toUpperCase() === 'SUSPENDED' ? 'btn-primary' : 'btn-danger'}`}
                onClick={() => {
                  setTargetStatus(profile.status?.toUpperCase() === 'SUSPENDED' ? 'Active' : 'Suspended');
                  setStatusModalOpen(true);
                }}
              >
                {profile.status?.toUpperCase() === 'SUSPENDED' ? (
                  <><UserCheck size={14} className="inline mr-1" /> Restore</>
                ) : (
                  <><UserX size={14} className="inline mr-1" /> Moderate Status</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Platform Statistics KPI row */}
        <div className="admin-kpi-grid mt-6">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Events Attended</span>
              <div className="kpi-icon kpi-icon-purple"><Calendar size={20} /></div>
            </div>
            <div className="kpi-value">{stats.eventsAttended} <span className="text-xs text-secondary font-normal">/ {stats.eventsRegistered} reg</span></div>
            <div className="kpi-subtext">
              {stats.eventsRegistered > 0 
                ? `${Math.round((stats.eventsAttended / stats.eventsRegistered) * 100)}% attendance rate` 
                : 'No event registrations yet'}
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Courses Completed</span>
              <div className="kpi-icon kpi-icon-green"><BookOpen size={20} /></div>
            </div>
            <div className="kpi-value">{stats.coursesCompleted} <span className="text-xs text-secondary font-normal">/ {stats.coursesEnrolled} enrolled</span></div>
            <div className="kpi-subtext">
              {stats.coursesEnrolled > 0
                ? `${Math.round((stats.coursesCompleted / stats.coursesEnrolled) * 100)}% completion rate`
                : 'No course enrollments'}
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Projects & Teams</span>
              <div className="kpi-icon kpi-icon-orange"><FolderGit2 size={20} /></div>
            </div>
            <div className="kpi-value">{stats.projectsCount} <span className="text-xs text-secondary font-normal">({stats.teamsCount} teams)</span></div>
            <div className="kpi-subtext">Active project collaborator</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Achievements & Score</span>
              <div className="kpi-icon kpi-icon-cyan"><Award size={20} /></div>
            </div>
            <div className="kpi-value">{stats.achievementsCount} <span className="text-xs text-secondary font-normal">({stats.activityScore} pts)</span></div>
            <div className="kpi-subtext">Profile {profile.profileCompletionPercentage}% complete</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-analytics-tabs mt-8">
          <button 
            className={`admin-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile & Contact
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events ({events.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Courses ({courses.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects ({projects.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements ({achievements.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity Stream ({recentActivity.length})
          </button>
        </div>

        {/* TAB 1: Profile & Contact */}
        {activeTab === 'profile' && (
          <div className="admin-detail-grid mt-6">
            <div className="detail-column">
              <div className="detail-card">
                <h3>Academic & Personal Info</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{profile.fullName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Register Number</span>
                    <span className="info-value">{profile.registerNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Department</span>
                    <span className="info-value">{profile.department}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Class Section</span>
                    <span className="info-value">{profile.classSection || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Current Year</span>
                    <span className="info-value">{profile.year}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Account Status</span>
                    <span className="info-value">{profile.status}</span>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h3>Contact & Online Accounts</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">College Email</span>
                    <span className="info-value flex items-center gap-1">
                      <Mail size={14} className="text-secondary" /> {profile.collegeEmail}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">User Account Email</span>
                    <span className="info-value flex items-center gap-1">
                      <Mail size={14} className="text-secondary" /> {profile.userEmail}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value flex items-center gap-1">
                      <Phone size={14} className="text-secondary" /> {profile.phone || 'Not provided'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Profile Completion</span>
                    <span className="info-value">{profile.profileCompletionPercentage}%</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800">
                  <span className="info-label block mb-2">Professional Profiles</span>
                  <div className="flex flex-col gap-2">
                    {profile.githubUrl ? (
                      <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm flex items-center gap-1">
                        <ExternalLink size={12} /> GitHub Profile ({profile.githubUrl})
                      </a>
                    ) : <span className="text-gray-500 text-sm">GitHub: Not connected</span>}
                    {profile.linkedinUrl ? (
                      <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm flex items-center gap-1">
                        <ExternalLink size={12} /> LinkedIn Profile ({profile.linkedinUrl})
                      </a>
                    ) : <span className="text-gray-500 text-sm">LinkedIn: Not connected</span>}
                    {profile.portfolioUrl ? (
                      <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm flex items-center gap-1">
                        <ExternalLink size={12} /> Portfolio Website ({profile.portfolioUrl})
                      </a>
                    ) : <span className="text-gray-500 text-sm">Portfolio: Not provided</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-column">
              <div className="detail-card">
                <h3>Bio & Technical Summary</h3>
                <div className="space-y-4">
                  <div>
                    <span className="info-label block mb-1">About Member</span>
                    <p className="text-gray-300 bg-dark-bg p-3 rounded border border-gray-800 text-sm leading-relaxed">
                      {profile.bio || 'No biography written by member.'}
                    </p>
                  </div>
                  <div>
                    <span className="info-label block mb-1">Technical Skills</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-800 text-gray-200 rounded text-xs">{skill}</span>
                        ))
                      ) : <span className="text-gray-500 text-xs">No skills listed</span>}
                    </div>
                  </div>
                  <div>
                    <span className="info-label block mb-1">Technical Interests</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.technicalInterests && profile.technicalInterests.length > 0 ? (
                        profile.technicalInterests.map((interest: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-accent/15 text-accent rounded text-xs">{interest}</span>
                        ))
                      ) : <span className="text-gray-500 text-xs">No interests listed</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Events */}
        {activeTab === 'events' && (
          <div className="admin-table-card mt-6">
            <h3 className="text-base font-semibold mb-3">Event Registration & Attendance History</h3>
            {events.length === 0 ? (
              <div className="admin-empty-state">
                <Calendar size={32} />
                <p>This member has not registered for any events yet.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Type</th>
                      <th>Event Date</th>
                      <th>Location</th>
                      <th>Registered On</th>
                      <th>Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e: any) => (
                      <tr key={e.registrationId}>
                        <td className="font-medium text-white">{e.eventTitle}</td>
                        <td><span className="px-2 py-0.5 bg-gray-800 rounded text-xs">{e.eventType}</span></td>
                        <td>{new Date(e.startAt).toLocaleString()}</td>
                        <td>{e.location || 'Online'}</td>
                        <td>{new Date(e.registeredAt).toLocaleDateString()}</td>
                        <td>
                          {e.registrationStatus === 'ATTENDED' ? (
                            <span className="status-badge status-open"><CheckCircle2 size={12} className="inline mr-1" /> Attended</span>
                          ) : e.registrationStatus === 'CANCELLED' ? (
                            <span className="status-badge status-cancelled">Cancelled</span>
                          ) : (
                            <span className="status-badge status-draft"><Clock size={12} className="inline mr-1" /> Registered</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Courses */}
        {activeTab === 'courses' && (
          <div className="admin-table-card mt-6">
            <h3 className="text-base font-semibold mb-3">Course Learning & Enrollments</h3>
            {courses.length === 0 ? (
              <div className="admin-empty-state">
                <BookOpen size={32} />
                <p>No course enrollments found for this member.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Category</th>
                      <th>Difficulty</th>
                      <th>Enrollment Status</th>
                      <th>Progress</th>
                      <th>Enrolled On</th>
                      <th>Completed On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c: any) => (
                      <tr key={c.enrollmentId}>
                        <td className="font-medium text-white">{c.courseTitle}</td>
                        <td><span className="px-2 py-0.5 bg-gray-800 rounded text-xs">{c.category}</span></td>
                        <td><span className="text-xs uppercase text-secondary">{c.difficulty}</span></td>
                        <td>
                          {c.enrollmentStatus.toUpperCase() === 'COMPLETED' ? (
                            <span className="status-badge status-open">Completed</span>
                          ) : (
                            <span className="status-badge status-draft">In Progress</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${c.progressPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs">{c.progressPercentage}%</span>
                          </div>
                        </td>
                        <td>{new Date(c.enrolledAt).toLocaleDateString()}</td>
                        <td>{c.completedAt ? new Date(c.completedAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Projects & Teams */}
        {activeTab === 'projects' && (
          <div className="space-y-6 mt-6">
            <div className="admin-table-card">
              <h3 className="text-base font-semibold mb-3">Project Memberships</h3>
              {projects.length === 0 ? (
                <div className="admin-empty-state">
                  <FolderGit2 size={32} />
                  <p>No project memberships found.</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Project Status</th>
                        <th>Role in Project</th>
                        <th>Membership Status</th>
                        <th>Joined At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p: any, idx: number) => (
                        <tr key={idx}>
                          <td className="font-medium text-white">{p.projectTitle}</td>
                          <td><span className="status-badge status-open">{p.projectStatus}</span></td>
                          <td><span className="px-2 py-0.5 bg-gray-800 rounded text-xs">{p.projectRole}</span></td>
                          <td>{p.memberStatus}</td>
                          <td>{p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-table-card">
              <h3 className="text-base font-semibold mb-3">Collaborative Teams</h3>
              {teams.length === 0 ? (
                <div className="admin-empty-state">
                  <FolderGit2 size={32} />
                  <p>Member does not belong to any project teams yet.</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Team Name</th>
                        <th>Project</th>
                        <th>Team Role</th>
                        <th>Team Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((t: any, idx: number) => (
                        <tr key={idx}>
                          <td className="font-medium text-white">{t.teamName}</td>
                          <td>{t.projectTitle}</td>
                          <td><span className="px-2 py-0.5 bg-gray-800 rounded text-xs">{t.teamRole}</span></td>
                          <td><span className="status-badge status-draft">{t.teamStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Achievements */}
        {activeTab === 'achievements' && (
          <div className="admin-table-card mt-6">
            <h3 className="text-base font-semibold mb-3">Earned Achievements</h3>
            {achievements.length === 0 ? (
              <div className="admin-empty-state">
                <Award size={32} />
                <p>No achievements earned by this member yet.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Badge</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Points</th>
                      <th>Description</th>
                      <th>Earned Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievements.map((a: any) => (
                      <tr key={a.achievementId}>
                        <td>
                          <span className="text-xl" role="img" aria-label="achievement-icon">
                            {a.icon || '🏆'}
                          </span>
                        </td>
                        <td className="font-medium text-white">{a.title}</td>
                        <td><span className="px-2 py-0.5 bg-gray-800 rounded text-xs">{a.category}</span></td>
                        <td className="font-bold text-accent">+{a.points}</td>
                        <td className="text-sm text-secondary">{a.description}</td>
                        <td>{new Date(a.earnedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Activity Stream */}
        {activeTab === 'activity' && (
          <div className="admin-table-card mt-6">
            <h3 className="text-base font-semibold mb-3">Platform Activity Log</h3>
            {recentActivity.length === 0 ? (
              <div className="admin-empty-state">
                <Activity size={32} />
                <p>No recent activity recorded for this member.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Entity Type</th>
                      <th>Entity ID</th>
                      <th>Timestamp</th>
                      <th>Metadata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((act: any) => (
                      <tr key={act.id}>
                        <td>
                          <span className="admin-action-badge action-info">
                            {act.activityType}
                          </span>
                        </td>
                        <td className="text-secondary">{act.entityType}</td>
                        <td className="text-xs font-mono text-gray-400">{act.entityId}</td>
                        <td className="text-sm">{new Date(act.createdAt).toLocaleString()}</td>
                        <td className="text-xs text-gray-400 font-mono">
                          {act.metadata ? JSON.stringify(act.metadata) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ROLE MODAL */}
        {roleModalOpen && (
          <div className="admin-modal-backdrop" onClick={() => !roleSubmitting && setRoleModalOpen(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Change Member Role</h3>
                <button className="admin-modal-close" onClick={() => setRoleModalOpen(false)}>✕</button>
              </div>
              <div className="admin-modal-body">
                <p className="text-sm text-secondary mb-4">
                  Modify the platform permissions for <strong>{profile.fullName}</strong> ({profile.registerNumber}).
                </p>
                <div className="admin-form-group mb-4">
                  <label>Select Role</label>
                  <select 
                    className="admin-select"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as UserRole)}
                  >
                    <option value="student">Student (Standard Member)</option>
                    <option value="instructor">Instructor (Course / Lab Lead)</option>
                    <option value="admin">Admin (Club Operations)</option>
                    <option value="super_admin">Super Admin (Platform Overseer)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Reason for Role Change (Audit Trail)</label>
                  <textarea 
                    className="admin-input" 
                    rows={3} 
                    placeholder="Provide justification for security & compliance audit..."
                    value={roleReason}
                    onChange={(e) => setRoleReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button 
                  className="btn btn-secondary" 
                  disabled={roleSubmitting} 
                  onClick={() => setRoleModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  disabled={roleSubmitting}
                  onClick={handleRoleChange}
                >
                  {roleSubmitting ? 'Saving...' : 'Confirm Role Change'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATUS MODAL */}
        {statusModalOpen && (
          <div className="admin-modal-backdrop" onClick={() => !statusSubmitting && setStatusModalOpen(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Moderate Account Status</h3>
                <button className="admin-modal-close" onClick={() => setStatusModalOpen(false)}>✕</button>
              </div>
              <div className="admin-modal-body">
                <p className="text-sm text-secondary mb-4">
                  Adjust access status for <strong>{profile.fullName}</strong>.
                </p>
                <div className="admin-form-group mb-4">
                  <label>Select Account Status</label>
                  <select 
                    className="admin-select"
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                  >
                    <option value="ACTIVE">ACTIVE (Full access granted)</option>
                    <option value="INACTIVE">INACTIVE (Dormant profile)</option>
                    <option value="SUSPENDED">SUSPENDED (Locked out of all club services)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Audit Justification / Note</label>
                  <textarea 
                    className="admin-input" 
                    rows={3} 
                    placeholder="State reason for suspension, reactivation, or deactivation..."
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button 
                  className="btn btn-secondary" 
                  disabled={statusSubmitting} 
                  onClick={() => setStatusModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className={`btn ${targetStatus.toUpperCase() === 'SUSPENDED' ? 'btn-danger' : 'btn-primary'}`}
                  disabled={statusSubmitting}
                  onClick={handleStatusChange}
                >
                  {statusSubmitting ? 'Processing...' : `Apply Status: ${targetStatus}`}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
