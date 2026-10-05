import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { memberService } from '../../services/content/memberService';
import { useRepository } from '../../services/content/useRepository';
import { achievementService } from '../../services/content/achievementService';
import { projectService } from '../../services/content/projectService';
import { courseService } from '../../services/content/courseService';
import { StateView } from '../../components/common/StateView';

export const AdminAnalytics: React.FC = () => {
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

  // Members by Year
  const membersByYear = members.reduce((acc, curr) => {
    acc[curr.year] = (acc[curr.year] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Members by Department
  const membersByDept = members.reduce((acc, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Achievements by Category
  const achByCategory = mockAchievements.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Interests by Project Category
  const projByCategory = mockProjects.reduce((acc, curr: any) => {
    acc[curr.category] = (acc[curr.category] || 0) + (curr.interested_count || curr.interestedCount || 0);
    return acc;
  }, {} as Record<string, number>);

  // Courses by Tracking Method
  const coursesByMethod = mockCourses.reduce((acc, curr: any) => {
    const method = curr.tracking_method || curr.tracking?.method;
    if (method) {
      acc[method] = (acc[method] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Courses by Tracking Status
  const coursesByStatus = mockCourses.reduce((acc, curr: any) => {
    const status = curr.tracking_status || curr.tracking?.status;
    if (status) {
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const renderBarChart = (data: Record<string, number>, maxVal: number) => (
    <div className="simple-bar-chart">
      {Object.entries(data).sort((a,b) => b[1] - a[1]).map(([label, value]) => (
        <div key={label} className="bar-row">
          <span className="bar-label">{label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(value / maxVal) * 100}%` }}></div>
          </div>
          <span className="bar-value">{value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <AdminLayout pageTitle="Analytics">
      <div className="admin-section">
        <p className="text-secondary mb-6">Operational analytics based on platform activity.</p>
        
        <div className="admin-detail-grid">
          
          <div className="chart-card">
            <h3 className="chart-title">Member Distribution by Year</h3>
            {renderBarChart(membersByYear, Math.max(...(Object.values(membersByYear) as number[])) || 1)}
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Member Distribution by Department</h3>
            {renderBarChart(membersByDept, Math.max(...(Object.values(membersByDept) as number[])) || 1)}
          </div>

          <StateView loading={loadingmockAchievements} error={errormockAchievements} retry={retrymockAchievements} empty={mockAchievements.length === 0} emptyMessage="No achievement data available.">
            <div className="chart-card">
              <h3 className="chart-title">Achievements by Category</h3>
              {renderBarChart(achByCategory, Math.max(...(Object.values(achByCategory) as number[])) || 1)}
            </div>
          </StateView>

          <StateView loading={loadingmockProjects} error={errormockProjects} retry={retrymockProjects} empty={mockProjects.length === 0} emptyMessage="No project data available.">
            <div className="chart-card">
              <h3 className="chart-title">Project Interest by Category</h3>
              {renderBarChart(projByCategory, Math.max(...(Object.values(projByCategory) as number[])) || 1)}
            </div>
          </StateView>

          <StateView loading={loadingmockCourses} error={errormockCourses} retry={retrymockCourses} empty={mockCourses.length === 0} emptyMessage="No course data available.">
            <div className="chart-card">
              <h3 className="chart-title">Courses by Tracking Method</h3>
              {renderBarChart(coursesByMethod, Math.max(...(Object.values(coursesByMethod) as number[])) || 1)}
            </div>
          </StateView>

          <StateView loading={loadingmockCourses} error={errormockCourses} retry={retrymockCourses} empty={mockCourses.length === 0} emptyMessage="No course data available.">
            <div className="chart-card">
              <h3 className="chart-title">Courses by Tracking Status</h3>
              {renderBarChart(coursesByStatus, Math.max(...(Object.values(coursesByStatus) as number[])) || 1)}
            </div>
          </StateView>

        </div>
      </div>
    </AdminLayout>
  );
};
