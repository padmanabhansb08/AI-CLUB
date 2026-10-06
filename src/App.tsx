import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Auth & Setup
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminLogin } from './pages/AdminLogin';
import { RoleGuard } from './components/layout/RoleGuard';

// Student Pages
import { Dashboard } from './pages/Dashboard';
import { PlaceholderPage } from './pages/Placeholder';
import { Achievements } from './pages/Achievements';
import { AchievementDetail } from './pages/AchievementDetail';
import { Updates } from './pages/Updates';
import { UpdateDetail } from './pages/UpdateDetail';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { MyProjects } from './pages/MyProjects';
import { Courses } from './pages/Courses';
import { CourseDetail } from './pages/CourseDetail';
import { CourseLearning } from './pages/CourseLearning';
import { MyLearning } from './pages/MyLearning';
import { Profile } from './pages/Profile';
import { Members } from './pages/Members';
import { MemberDetail } from './pages/MemberDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import MyEvents from './pages/MyEvents';
import { Announcements } from './pages/Announcements';
import { AnnouncementDetail } from './pages/AnnouncementDetail';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminMembers } from './pages/admin/AdminMembers';
import { AdminMemberDetail } from './pages/admin/AdminMemberDetail';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminPlaceholder } from './pages/admin/AdminPlaceholder';
import { AdminAchievements } from './pages/admin/AdminAchievements';
import { AdminUpdates } from './pages/admin/AdminUpdates';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminEventDetail } from './pages/admin/AdminEventDetail';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <main className="main-content">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Redirect /admin directly to /admin (which will be guarded and either allow or redirect to /admin/login) */}
              <Route path="/admin" element={
                <RoleGuard allowedRole="admin" redirectTo="/admin/login">
                  <AdminOverview />
                </RoleGuard>
              } />

              {/* Protected Student Routes */}
              <Route path="/dashboard" element={<RoleGuard allowedRole="student"><Dashboard /></RoleGuard>} />
              <Route path="/achievements" element={<RoleGuard allowedRole="student"><Achievements /></RoleGuard>} />
              <Route path="/achievements/:id" element={<RoleGuard allowedRole="student"><AchievementDetail /></RoleGuard>} />
              <Route path="/updates" element={<RoleGuard allowedRole="student"><Updates /></RoleGuard>} />
              <Route path="/updates/:id" element={<RoleGuard allowedRole="student"><UpdateDetail /></RoleGuard>} />
              <Route path="/projects" element={<RoleGuard allowedRole="student"><Projects /></RoleGuard>} />
              <Route path="/projects/my" element={<RoleGuard allowedRole="student"><MyProjects /></RoleGuard>} />
              <Route path="/my-projects" element={<RoleGuard allowedRole="student"><MyProjects /></RoleGuard>} />
              <Route path="/projects/:id" element={<RoleGuard allowedRole="student"><ProjectDetail /></RoleGuard>} />
              <Route path="/projects/:id/workspace" element={<RoleGuard allowedRole="student"><ProjectDetail /></RoleGuard>} />
              <Route path="/courses" element={<RoleGuard allowedRole="student"><Courses /></RoleGuard>} />
              <Route path="/courses/my" element={<RoleGuard allowedRole="student"><MyLearning /></RoleGuard>} />
              <Route path="/my-learning" element={<RoleGuard allowedRole="student"><MyLearning /></RoleGuard>} />
              <Route path="/courses/:id" element={<RoleGuard allowedRole="student"><CourseDetail /></RoleGuard>} />
              <Route path="/courses/:id/learn" element={<RoleGuard allowedRole="student"><CourseLearning /></RoleGuard>} />
              <Route path="/profile" element={<RoleGuard allowedRole="student"><Profile /></RoleGuard>} />
              <Route path="/members" element={<RoleGuard allowedRole="student"><Members /></RoleGuard>} />
              <Route path="/members/:id" element={<RoleGuard allowedRole="student"><MemberDetail /></RoleGuard>} />
              <Route path="/events" element={<RoleGuard allowedRole="student"><Events /></RoleGuard>} />
              <Route path="/events/my" element={<RoleGuard allowedRole="student"><MyEvents /></RoleGuard>} />
              <Route path="/events/:id" element={<RoleGuard allowedRole="student"><EventDetail /></RoleGuard>} />
              <Route path="/announcements" element={<RoleGuard allowedRole="student"><Announcements /></RoleGuard>} />
              <Route path="/announcements/:id" element={<RoleGuard allowedRole="student"><AnnouncementDetail /></RoleGuard>} />
              <Route path="/settings" element={<RoleGuard allowedRole="student"><PlaceholderPage title="Settings" /></RoleGuard>} />

              {/* Protected Admin Routes */}
              <Route path="/admin/members" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminMembers /></RoleGuard>} />
              <Route path="/admin/members/:id" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminMemberDetail /></RoleGuard>} />
              <Route path="/admin/achievements" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminAchievements /></RoleGuard>} />
              <Route path="/admin/updates" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminUpdates /></RoleGuard>} />
              <Route path="/admin/projects" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminProjects /></RoleGuard>} />
              <Route path="/admin/courses" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminCourses /></RoleGuard>} />
              <Route path="/admin/events" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminEvents /></RoleGuard>} />
              <Route path="/admin/events/:id" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminEventDetail /></RoleGuard>} />
              <Route path="/admin/announcements" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminAnnouncements /></RoleGuard>} />
              <Route path="/admin/analytics" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminAnalytics /></RoleGuard>} />
              <Route path="/admin/settings" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminPlaceholder title="Settings" /></RoleGuard>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
