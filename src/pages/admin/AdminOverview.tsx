import React from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { memberService } from '../../services/content/memberService';
import { useRepository } from '../../services/content/useRepository';
import { achievementService } from '../../services/content/achievementService';
import { projectService } from '../../services/content/projectService';
import { courseService } from '../../services/content/courseService';
import { StateView } from '../../components/common/StateView';

export const AdminOverview: React.FC = () => {
  const { data: mockAchievements, loading: loadingmockAchievements, error: errormockAchievements, retry: retrymockAchievements } = useRepository(achievementService);
  const { data: mockProjects, loading: loadingmockProjects, error: errormockProjects, retry: retrymockProjects } = useRepository(projectService);
  const { data: mockCourses, loading: loadingmockCourses, error: errormockCourses, retry: retrymockCourses } = useRepository(courseService);
  
  const [members, setMembers] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    const fetchMembers = async () => {
      const res = await memberService.getMembers(1, 1000);
      if (res && res.data) {
        setMembers(res.data);
      }
    };
    fetchMembers();
  }, []);

  const activeMembers = members.filter(m => m.status === 'Active' || !m.status).length;

  return (
    <AdminLayout pageTitle="Club Overview">
      <div className="admin-section">
        <p className="text-secondary mb-6">Monitor members, achievements, projects, courses and club activity.</p>
        
        <div className="metrics-row">
          <div className="metric-card">
            <span className="metric-value">{members.length}</span>
            <span className="metric-label">Total Members</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{activeMembers}</span>
            <span className="metric-label">Active Members</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{mockAchievements.length}</span>
            <span className="metric-label">Achievements</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{mockProjects.length}</span>
            <span className="metric-label">Projects</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{mockCourses.length}</span>
            <span className="metric-label">Courses</span>
          </div>
        </div>

        {/* SECTION A - Recent Members */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">Recent Members</h3>
            <Link to="/admin/members" className="btn-ghost">View All</Link>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Register Number</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.slice(0, 5).map(member => (
                  <tr key={member.id}>
                    <td>
                      <div className="member-cell">
                        <div className="member-avatar">{member.full_name ? member.full_name.charAt(0) : 'U'}</div>
                        <span>{member.full_name}</span>
                      </div>
                    </td>
                    <td>{member.register_number}</td>
                    <td>{member.department}</td>
                    <td>{member.year}</td>
                    <td>{member.college_email}</td>
                    <td>{member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${member.status === 'Active' || !member.status ? 'status-open' : 'status-completed'}`}>
                        {member.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/members/${member.id}`} className="view-link">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION B - Recent Achievements */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">Recent Achievements</h3>
          </div>
          <div className="admin-table-container">
            <StateView loading={loadingmockAchievements} error={errormockAchievements} retry={retrymockAchievements} empty={mockAchievements.length === 0} emptyMessage="No recent achievements.">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Achievement</th>
                    <th>Student/Team</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Featured</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAchievements.slice(0, 5).map(ach => (
                    <tr key={ach.id}>
                      <td>{ach.title}</td>
                      <td>{ach.type === 'team' ? ach.teamName : ach.studentName}</td>
                      <td>{ach.category}</td>
                      <td>{ach.date ? new Date(ach.date).toLocaleDateString() : 'N/A'}</td>
                      <td>{ach.featured ? 'Yes' : 'No'}</td>
                      <td><span className="view-link">View</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </StateView>
          </div>
        </div>

        {/* SECTION C - Course Tracking Overview */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">Course Tracking Overview</h3>
          </div>
          <div className="admin-table-container">
            <StateView loading={loadingmockCourses} error={errormockCourses} retry={retrymockCourses} empty={mockCourses.length === 0} emptyMessage="No recent courses.">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Provider</th>
                    <th>Tracking Method</th>
                    <th>Tracking Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCourses.slice(0, 5).map((course: any) => (
                    <tr key={course.id}>
                      <td>{course.title}</td>
                      <td>{course.provider}</td>
                      <td><span style={{textTransform: 'uppercase'}}>{course.tracking_method || course.tracking?.method}</span></td>
                      <td>
                        <span className={`status-badge ${course.tracking_status === 'Integration Available' ? 'status-open' : 'status-completed'}`}>
                          {course.tracking_status || course.tracking?.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </StateView>
          </div>
        </div>

        {/* SECTION D - Recent Project Interest */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">Recent Project Interest</h3>
          </div>
          <div className="admin-table-container">
            <StateView loading={loadingmockProjects} error={errormockProjects} retry={retrymockProjects} empty={mockProjects.length === 0} emptyMessage="No recent projects.">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Interested Count (Demo)</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProjects.slice(0, 5).map((proj: any) => (
                    <tr key={proj.id}>
                      <td>{proj.title}</td>
                      <td>{proj.category}</td>
                      <td>{proj.difficulty}</td>
                      <td>{proj.interested_count || proj.interestedCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </StateView>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
