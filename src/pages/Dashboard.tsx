import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useRepository } from '../services/content/useRepository';
import { updateService } from '../services/content/updateService';
import { projectService } from '../services/content/projectService';
import { announcementService } from '../services/content/announcementService';
import type { Announcement } from '../services/content/announcementService';
import { courseService } from '../services/content/courseService';
import { achievementService } from '../services/content/achievementService';
import { profileService } from '../services/profileService';
import { authService } from '../services/authService';
import { ArrowRight, Trophy } from 'lucide-react';
import { StateView } from '../components/common/StateView';
import { DashboardProjectTeams } from '../components/DashboardProjectTeams';
import type { Member } from '../data/members';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [profile, setProfile] = React.useState<Member | null>(null);

  React.useEffect(() => {
    if (user) {
      profileService.getProfile().then(setProfile).catch(console.error);
    }
  }, [user]);

  const { data: mockUpdates, loading: loadingmockUpdates, error: errormockUpdates, retry: retrymockUpdates } = useRepository(updateService);
  const { data: mockProjects, loading: loadingmockProjects, error: errormockProjects, retry: retrymockProjects } = useRepository(projectService);
  const { data: mockCourses, loading: loadingmockCourses, error: errormockCourses, retry: retrymockCourses } = useRepository(courseService);
  const { data: mockAchievements, loading: loadingmockAchievements, error: errormockAchievements, retry: retrymockAchievements } = useRepository(achievementService);

  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = React.useState(true);

  React.useEffect(() => {
    announcementService.getVisibleAnnouncements(1, 3)
      .then(res => setAnnouncements(res.data))
      .catch(console.error)
      .finally(() => setLoadingAnnouncements(false));
  }, []);

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="dashboard-intro flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2>Good evening, {profile?.fullName || user?.email?.split('@')[0] || 'Member'}</h2>
          <p>Learn. Build. Research. Innovate.</p>
        </div>
        
        {profile && profile.profileCompletion !== undefined && profile.profileCompletion < 100 && (
          <div className="bg-dark-card border border-gray-800 p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:border-accent transition-colors" onClick={() => navigate('/profile')}>
            <div className="flex-1">
              <div className="text-sm text-gray-300 font-medium mb-1">Profile {profile.profileCompletion}% complete</div>
              <div className="text-xs text-gray-500">
                Missing: {
                  [
                    !profile.bio && 'Bio',
                    !profile.githubUrl && 'GitHub',
                    (!profile.skills || profile.skills.length === 0) && 'Skills'
                  ].filter(Boolean).slice(0, 2).join(', ')
                }
              </div>
            </div>
            <div className="bg-accent/10 text-accent px-3 py-1.5 rounded text-sm whitespace-nowrap">
              Complete Profile
            </div>
          </div>
        )}
      </div>
      <DashboardProjectTeams />

      <section className="dashboard-section mt-6 border border-gray-800 bg-gray-900 rounded-lg overflow-hidden">
        <div className="section-header p-5 border-b border-gray-800 bg-gray-800/30 m-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
              <span className="text-blue-500">📣</span> Announcements
            </h3>
            <p className="section-subtitle mt-1">Important operational updates.</p>
          </div>
          <Link to="/announcements" className="view-all-link">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        
        <StateView loading={loadingAnnouncements} error={null} empty={announcements.length === 0} emptyMessage="No announcements right now.">
          <div className="divide-y divide-gray-800">
            {announcements.map(a => (
              <div 
                key={a.id} 
                className={`p-4 cursor-pointer hover:bg-gray-800/50 transition-colors flex items-center justify-between ${!a.read ? 'bg-blue-900/10' : ''}`}
                onClick={() => navigate(`/announcements/${a.id}`)}
              >
                <div className="flex items-center gap-4">
                  {!a.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>}
                  <div className={a.read ? '' : 'pl-0'}>
                    <h4 className={`text-base font-medium ${a.read ? 'text-gray-300' : 'text-gray-100'}`}>{a.title}</h4>
                    <span className="text-xs font-mono text-gray-500">{new Date(a.publishedAt || a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs rounded border text-gray-400 bg-gray-800 border-gray-700 uppercase tracking-wider">
                  {a.category}
                </span>
              </div>
            ))}
          </div>
        </StateView>
      </section>

      <div className="dashboard-grid mt-6">
        {/* Achievements Section */}
        <section className="dashboard-section section-achievements">
          <div className="section-header">
            <div>
              <h3>Achievements</h3>
              <p className="section-subtitle">Celebrating what AI Club members are building and accomplishing.</p>
            </div>
            <Link to="/achievements" className="view-all-link">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          
          <StateView loading={loadingmockAchievements} error={errormockAchievements} retry={retrymockAchievements} empty={mockAchievements.length === 0} emptyMessage="No achievements yet.">
            <div className="achievements-list">
              {mockAchievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className="achievement-card"
                  onClick={() => navigate('/achievements')}
                >
                  <div className="achievement-icon">
                    <Trophy size={20} />
                  </div>
                  <div className="achievement-content">
                    <span className="achievement-type">{achievement.category}</span>
                    <h4>{achievement.title}</h4>
                    <p>{achievement.studentName || 'Team'} &middot; {achievement.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </StateView>
        </section>

        {/* AI & Tech Updates Section */}
        <section className="dashboard-section section-updates">
          <div className="section-header">
            <div>
              <h3>AI & Tech Updates</h3>
              <p className="section-subtitle">What's happening across AI, research, and technology.</p>
            </div>
            <Link to="/updates" className="view-all-link">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          
          <StateView loading={loadingmockUpdates} error={errormockUpdates} retry={retrymockUpdates} empty={mockUpdates.length === 0} emptyMessage="No updates available.">
            <div className="updates-list">
              {mockUpdates.slice(0, 3).map(update => (
                <div 
                  key={update.id} 
                  className="update-item"
                  onClick={() => navigate(`/updates/${update.id}`)}
                >
                  <div className="update-meta">
                    <span className="update-category">{update.category}</span>
                    <span className="update-time">{update.publishedAt}</span>
                  </div>
                  <h4>{update.title}</h4>
                  <p className="update-summary">{update.summary}</p>
                  <div className="update-source">Source: {update.source}</div>
                </div>
              ))}
            </div>
          </StateView>
        </section>
      </div>

      {/* Project Ideas Section */}
      <section className="dashboard-section mt-6">
        <div className="section-header">
          <div>
            <h3>Project Ideas</h3>
            <p className="section-subtitle">Ideas from the AI Club worth building.</p>
          </div>
          <Link to="/projects" className="view-all-link">
            Explore projects <ArrowRight size={16} />
          </Link>
        </div>
        
        <StateView loading={loadingmockProjects} error={errormockProjects} retry={retrymockProjects} empty={mockProjects.length === 0} emptyMessage="No projects available.">
          <div className="projects-grid">
            {mockProjects.slice(0, 3).map(project => (
              <div 
                key={project.id} 
                className="project-card"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="project-header">
                  <h4>{project.title}</h4>
                  <span className={`difficulty-badge diff-${project.difficulty.toLowerCase()}`}>
                    {project.difficulty}
                  </span>
                </div>
                <p className="project-desc">{project.shortDescription}</p>
              </div>
            ))}
          </div>
        </StateView>
      </section>

      {/* External Courses Section */}
      <section className="dashboard-section mt-6 mb-6">
        <div className="section-header">
          <div>
            <h3>External Courses</h3>
            <p className="section-subtitle">Learning opportunities selected for AI Club members.</p>
          </div>
          <Link to="/courses" className="view-all-link">
            Explore courses <ArrowRight size={16} />
          </Link>
        </div>
        
        <StateView loading={loadingmockCourses} error={errormockCourses} retry={retrymockCourses} empty={mockCourses.length === 0} emptyMessage="No courses available.">
          <div className="courses-list">
            {mockCourses.slice(0, 3).map(course => (
              <div 
                key={course.id} 
                className="course-item"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="course-icon">🎓</div>
                <div className="course-details">
                  <h4>{course.title}</h4>
                  <p>{course.provider} &middot; {course.difficulty}</p>
                </div>
              </div>
            ))}
          </div>
        </StateView>
      </section>
    </DashboardLayout>
  );
};

