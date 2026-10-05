import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { memberService } from '../../services/content/memberService';
import { ArrowLeft } from 'lucide-react';

export const AdminMemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMember = async () => {
      try {
        if (!id) return;
        const data = await memberService.getMemberById(id);
        setMember(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout pageTitle="Member Details">
        <div className="empty-state">
          <h3>Loading member...</h3>
        </div>
      </AdminLayout>
    );
  }

  if (!member) {
    return (
      <AdminLayout pageTitle="Member Not Found">
        <div className="empty-state">
          <h3>Member not found</h3>
          <p>The member you're looking for doesn't exist.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/admin/members')}>
            Back to Members
          </button>
        </div>
      </AdminLayout>
    );
  }



  return (
    <AdminLayout pageTitle="Member Details">
      <div className="admin-section">
        <button className="back-btn" onClick={() => navigate('/admin/members')}>
          <ArrowLeft size={16} /> Back to Members
        </button>

        <div className="admin-section-header mt-4">
          <div className="flex items-center gap-4">
            <h2 className="admin-section-title" style={{fontSize: '2rem'}}>{member.full_name}</h2>
            <span className={`status-badge ${member.status === 'Active' || !member.status ? 'status-open' : 'status-completed'}`}>
              {member.status || 'Active'}
            </span>
          </div>
          <span className="text-secondary">{member.register_number}</span>
        </div>

        <div className="admin-detail-grid">
          {/* Main Info Column */}
          <div className="detail-column">
            
            <div className="detail-card">
              <h3>SECTION 1 — Student Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{member.full_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Register Number</span>
                  <span className="info-value">{member.register_number}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{member.department}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Class / Section</span>
                  <span className="info-value">{member.class_section}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Year</span>
                  <span className="info-value">{member.year}</span>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>SECTION 2 — Contact Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">College Email</span>
                  <span className="info-value">{member.college_email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{member.phone}</span>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>SECTION 3 — Club Profile</h3>
              <div className="space-y-4">
                <div>
                  <span className="info-label block mb-1">Short Bio</span>
                  <p className="text-gray-300 bg-dark-bg p-3 rounded border border-gray-800 text-sm">
                    {member.bio || 'Not provided'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="info-label block mb-1">Technical Interests</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.technical_interests?.length ? member.technical_interests.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">{t}</span>
                      )) : <span className="text-gray-500 text-xs">None</span>}
                    </div>
                  </div>
                  <div>
                    <span className="info-label block mb-1">Skills</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.skills?.length ? member.skills.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs">{s}</span>
                      )) : <span className="text-gray-500 text-xs">None</span>}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-800">
                  <span className="info-label block mb-2">Professional Links</span>
                  <div className="flex flex-col gap-2">
                    {member.github_url && <a href={member.github_url} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm">GitHub Profile</a>}
                    {member.linkedin_url && <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm">LinkedIn Profile</a>}
                    {member.portfolio_url && <a href={member.portfolio_url} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm">Portfolio Website</a>}
                    {!member.github_url && !member.linkedin_url && !member.portfolio_url && <span className="text-gray-500 text-sm">No links provided</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>SECTION 4 — Achievements</h3>
              {!member.achievements || member.achievements.length === 0 ? (
                <p className="text-tertiary">Not available</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {member.achievements.map((ach: any) => (
                        <tr key={ach.id}>
                          <td>{ach.title}</td>
                          <td>{ach.category}</td>
                          <td>{new Date(ach.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="detail-card">
              <h3>SECTION 5 — Course Activity</h3>
              {!member.courses || member.courses.length === 0 ? (
                <p className="text-tertiary">Not available</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Provider</th>
                        <th>Tracking Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {member.courses.map((course: any) => (
                        <tr key={course.id}>
                          <td>{course.title}</td>
                          <td>{course.provider}</td>
                          <td>
                            {course.tracking_method === 'none' ? 'Progress unavailable' : 'Enrolled'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="detail-card">
              <h3>SECTION 6 — Project Interests</h3>
              {!member.project_interests || member.project_interests.length === 0 ? (
                <p className="text-tertiary">Not available</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Category</th>
                        <th>Difficulty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {member.project_interests.map((proj: any) => (
                        <tr key={proj.id}>
                          <td>{proj.title}</td>
                          <td>{proj.category}</td>
                          <td>{proj.difficulty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="detail-column">
            <div className="detail-card">
              <h3>SECTION 3 — Club Activity</h3>
              <div className="info-grid" style={{gridTemplateColumns: '1fr'}}>
                <div className="info-item">
                  <span className="info-label">Achievements Count</span>
                  <span className="info-value">{member.achievements?.length || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Projects Interested</span>
                  <span className="info-value">{member.project_interests?.length || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Courses Enrolled</span>
                  <span className="info-value">{member.courses?.length || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Courses Completed</span>
                  <span className="info-value">Not available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
