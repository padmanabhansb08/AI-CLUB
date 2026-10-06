import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { updateController, courseController } from '../controllers/contentController';
import { projectController as mainProjectController } from '../controllers/projectController';
import { courseController as mainCourseController } from '../controllers/courseController';
import { adminEventController } from '../controllers/eventController';
import { projectTeamController } from '../controllers/projectTeamController';
import { announcementController } from '../controllers/announcementController';

import { achievementController as sprint6AchievementController } from '../controllers/achievementController';
import { notificationController } from '../controllers/notificationController';

// Sprint 7 Admin & Analytics Controllers
import { adminDashboardController } from '../controllers/adminDashboardController';
import { memberAdminController } from '../controllers/memberAdminController';
import { analyticsController } from '../controllers/analyticsController';
import { auditLogController } from '../controllers/auditLogController';
import { exportController } from '../controllers/exportController';

const router = Router();
router.use(authenticate, requireAdmin);

// Dashboard KPI overview
router.get('/dashboard', adminDashboardController.getDashboard);

// Member Management & Moderation (Sprint 7)
router.get('/members', memberAdminController.getAll);
router.get('/members/:id', memberAdminController.getById);
router.patch('/members/:id/role', memberAdminController.updateRole);
router.patch('/members/:id/status', memberAdminController.updateStatus);

// Domain-Specific Analytics Endpoints (Sprint 7)
router.get('/analytics/overview', adminDashboardController.getDashboard);
router.get('/analytics/members', analyticsController.getMembers);
router.get('/analytics/events', analyticsController.getEvents);
router.get('/analytics/projects', analyticsController.getProjects);
router.get('/analytics/courses', analyticsController.getCourses);
router.get('/analytics/achievements', analyticsController.getAchievements);
router.get('/analytics/engagement', analyticsController.getEngagement);

// Administrative Audit Logs (Sprint 7)
router.get('/audit-logs', auditLogController.getAuditLogs);
router.get('/audit-logs/:id', auditLogController.getAuditLogById);

// Secure Data Exports (Sprint 7)
router.get('/exports/members', exportController.exportMembers);
router.get('/exports/events', exportController.exportEvents);
router.get('/exports/attendance', exportController.exportAttendance);
router.get('/exports/course-enrollments', exportController.exportCourseEnrollments);
router.get('/exports/achievements', exportController.exportAchievements);

// Admin Achievements (Sprint 6)
router.post('/achievements', sprint6AchievementController.create);
router.put('/achievements/:id', sprint6AchievementController.update);
router.patch('/achievements/:id', sprint6AchievementController.update);
router.delete('/achievements/:id', sprint6AchievementController.delete);
router.post('/achievements/:id/activate', sprint6AchievementController.activate);
router.post('/achievements/:id/deactivate', sprint6AchievementController.deactivate);
router.get('/achievements/:id/stats', sprint6AchievementController.getStats);
router.get('/achievements/stats/global', sprint6AchievementController.getGlobalStats);

// Admin Notifications & Announcements (Sprint 6)
router.post('/notifications/announcements', notificationController.sendAnnouncement);
router.get('/notifications/history', notificationController.getAdminHistory);

// AI & Tech Updates
router.post('/updates', updateController.create);
router.put('/updates/:id', updateController.update);
router.delete('/updates/:id', updateController.delete);

// Admin Projects & Teams (Sprint 4)
router.post('/projects', mainProjectController.create);
router.put('/projects/:id', mainProjectController.update);
router.patch('/projects/:id', mainProjectController.update);
router.delete('/projects/:id', mainProjectController.delete);
router.post('/projects/:id/publish', mainProjectController.publish);
router.get('/projects/:id/teams', projectTeamController.getAdminProjectTeams);

// Admin Courses & LMS (Sprint 5)
router.post('/courses', courseController.create);
router.put('/courses/:id', courseController.update);
router.patch('/courses/:id', mainCourseController.update);
router.delete('/courses/:id', courseController.delete);
router.post('/courses/:id/publish', mainCourseController.publish);
router.post('/courses/:id/unpublish', mainCourseController.unpublish);
router.post('/courses/:id/archive', mainCourseController.archive);
router.get('/courses/:id/analytics', mainCourseController.getAnalytics);

// Admin Events & Attendance (Sprint 3)
router.get('/events', adminEventController.getAll);
router.post('/events', adminEventController.create);
router.get('/events/:id', adminEventController.getById);
router.patch('/events/:id', adminEventController.update);
router.delete('/events/:id', adminEventController.delete);
router.post('/events/:id/publish', adminEventController.publish);
router.post('/events/:id/cancel', adminEventController.cancel);
router.post('/events/:id/complete', adminEventController.complete);
router.get('/events/:id/registrations', adminEventController.getRegistrations);
router.get('/events/:id/attendance', adminEventController.getAttendance);
router.put('/events/:id/attendance', adminEventController.markAttendance);
router.post('/events/:id/attendance/bulk', adminEventController.bulkMarkAttendance);
router.post('/events/:id/attendance/check-in', adminEventController.checkIn);

// Admin Announcements
router.get('/announcements', announcementController.getAllAdmin);
router.post('/announcements', announcementController.create);
router.patch('/announcements/:id', announcementController.update);
router.delete('/announcements/:id', announcementController.delete);

export default router;