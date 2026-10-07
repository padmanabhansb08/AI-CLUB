import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Landing & Auth
import { LandingPage } from './pages/LandingPage';
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AccountHelp = lazy(() => import('./pages/AccountHelp').then(module => ({ default: module.AccountHelp })));

import { RoleGuard } from './components/layout/RoleGuard';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));
import { ActionFeedback } from './components/common/ActionFeedback';
import { ConfirmDialog } from './components/common/ConfirmDialog';

// Student Pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Achievements = lazy(() => import('./pages/Achievements').then(module => ({ default: module.Achievements })));
const AchievementDetail = lazy(() => import('./pages/AchievementDetail').then(module => ({ default: module.AchievementDetail })));
const Updates = lazy(() => import('./pages/Updates').then(module => ({ default: module.Updates })));
const UpdateDetail = lazy(() => import('./pages/UpdateDetail').then(module => ({ default: module.UpdateDetail })));
const Projects = lazy(() => import('./pages/Projects').then(module => ({ default: module.Projects })));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail').then(module => ({ default: module.ProjectDetail })));
const MyProjects = lazy(() => import('./pages/MyProjects').then(module => ({ default: module.MyProjects })));
const Courses = lazy(() => import('./pages/Courses').then(module => ({ default: module.Courses })));
const CourseDetail = lazy(() => import('./pages/CourseDetail').then(module => ({ default: module.CourseDetail })));
const CourseLearning = lazy(() => import('./pages/CourseLearning').then(module => ({ default: module.CourseLearning })));
const MyLearning = lazy(() => import('./pages/MyLearning').then(module => ({ default: module.MyLearning })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Members = lazy(() => import('./pages/Members').then(module => ({ default: module.Members })));
const MemberDetail = lazy(() => import('./pages/MemberDetail').then(module => ({ default: module.MemberDetail })));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const MyEvents = lazy(() => import('./pages/MyEvents'));
const Announcements = lazy(() => import('./pages/Announcements').then(module => ({ default: module.Announcements })));
const AnnouncementDetail = lazy(() => import('./pages/AnnouncementDetail').then(module => ({ default: module.AnnouncementDetail })));
const Notifications = lazy(() => import('./pages/Notifications').then(module => ({ default: module.Notifications })));
const AIAssistant = lazy(() => import('./pages/AIAssistant').then(module => ({ default: module.AIAssistant })));
const ApplicationHub = lazy(() => import('./pages/ApplicationHub').then(module => ({ default: module.ApplicationHub })));
const AssessmentTest = lazy(() => import('./pages/AssessmentTest').then(module => ({ default: module.AssessmentTest })));

// Admin Pages
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview').then(module => ({ default: module.AdminOverview })));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications').then(module => ({ default: module.AdminApplications })));
const AdminApplicationDetail = lazy(() => import('./pages/admin/AdminApplicationDetail').then(module => ({ default: module.AdminApplicationDetail })));
const AdminAIInsights = lazy(() => import('./pages/admin/AdminAIInsights').then(module => ({ default: module.AdminAIInsights })));
const AdminMembers = lazy(() => import('./pages/admin/AdminMembers').then(module => ({ default: module.AdminMembers })));
const AdminMemberDetail = lazy(() => import('./pages/admin/AdminMemberDetail').then(module => ({ default: module.AdminMemberDetail })));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics').then(module => ({ default: module.AdminAnalytics })));
const AdminAchievements = lazy(() => import('./pages/admin/AdminAchievements').then(module => ({ default: module.AdminAchievements })));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications').then(module => ({ default: module.AdminNotifications })));
const AdminUpdates = lazy(() => import('./pages/admin/AdminUpdates').then(module => ({ default: module.AdminUpdates })));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects').then(module => ({ default: module.AdminProjects })));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses').then(module => ({ default: module.AdminCourses })));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents').then(module => ({ default: module.AdminEvents })));
const AdminEventDetail = lazy(() => import('./pages/admin/AdminEventDetail').then(module => ({ default: module.AdminEventDetail })));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements').then(module => ({ default: module.AdminAnnouncements })));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs').then(module => ({ default: module.AdminAuditLogs })));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <div className="main-content">
            <Suspense fallback={<div className="route-loading" role="status">Loading AI CLUB…</div>}>
              <Routes>
                {/* Public Landing & Auth Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/forgot-password" element={<AccountHelp mode="forgot" />} />
                <Route path="/reset-password" element={<AccountHelp mode="reset" />} />
                <Route path="/verify-email" element={<AccountHelp mode="verify" />} />
                <Route path="/resend-verification" element={<AccountHelp mode="resend" />} />
                
                {/* Admin Overview & Dashboard */}
                <Route path="/admin" element={
                  <RoleGuard allowedRole="admin" redirectTo="/admin/login">
                    <AdminOverview />
                  </RoleGuard>
                } />
                <Route path="/admin/dashboard" element={
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
                <Route path="/events" element={<RoleGuard allowedRole="student"><DashboardLayout pageTitle="Events"><Events /></DashboardLayout></RoleGuard>} />
                <Route path="/events/my" element={<RoleGuard allowedRole="student"><DashboardLayout pageTitle="Your events"><MyEvents /></DashboardLayout></RoleGuard>} />
                <Route path="/events/:id" element={<RoleGuard allowedRole="student"><DashboardLayout pageTitle="Event details"><EventDetail /></DashboardLayout></RoleGuard>} />
                <Route path="/announcements" element={<RoleGuard allowedRole="student"><Announcements /></RoleGuard>} />
                <Route path="/announcements/:id" element={<RoleGuard allowedRole="student"><AnnouncementDetail /></RoleGuard>} />
                <Route path="/notifications" element={<RoleGuard allowedRole="student"><Notifications /></RoleGuard>} />
                <Route path="/ai-assistant" element={<RoleGuard allowedRole="student"><AIAssistant /></RoleGuard>} />
                <Route path="/settings" element={<RoleGuard allowedRole="student"><Settings /></RoleGuard>} />
                <Route path="/application" element={<RoleGuard allowedRole="student"><ApplicationHub /></RoleGuard>} />
                <Route path="/application/test" element={<RoleGuard allowedRole="student"><AssessmentTest /></RoleGuard>} />
                <Route path="/application/status" element={<RoleGuard allowedRole="student"><ApplicationHub /></RoleGuard>} />

                {/* Protected Admin Routes */}
                <Route path="/admin/applications" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminApplications /></RoleGuard>} />
                <Route path="/admin/applications/:id" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminApplicationDetail /></RoleGuard>} />
                <Route path="/admin/ai-insights" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminAIInsights /></RoleGuard>} />
                <Route path="/admin/members" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminMembers /></RoleGuard>} />
                <Route path="/admin/members/:id" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminMemberDetail /></RoleGuard>} />
                <Route path="/admin/achievements" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminAchievements /></RoleGuard>} />
                <Route path="/admin/notifications" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminNotifications /></RoleGuard>} />
                <Route path="/admin/updates" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminUpdates /></RoleGuard>} />
                <Route path="/admin/projects" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminProjects /></RoleGuard>} />
                <Route path="/admin/courses" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminCourses /></RoleGuard>} />
                <Route path="/admin/events" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminLayout pageTitle="Events"><AdminEvents /></AdminLayout></RoleGuard>} />
                <Route path="/admin/events/:id" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminLayout pageTitle="Event management"><AdminEventDetail /></AdminLayout></RoleGuard>} />
                <Route path="/admin/announcements" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminAnnouncements /></RoleGuard>} />
                <Route path="/admin/analytics" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminAnalytics /></RoleGuard>} />
                <Route path="/admin/audit-logs" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><AdminAuditLogs /></RoleGuard>} />
                <Route path="/admin/settings" element={<RoleGuard allowedRole="admin" redirectTo="/admin/login"><Settings admin /></RoleGuard>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <ActionFeedback />
            <ConfirmDialog />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
