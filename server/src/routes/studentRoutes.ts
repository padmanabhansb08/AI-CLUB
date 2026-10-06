import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { projectController, courseController } from '../controllers/contentController';
import { projectController as mainProjectController } from '../controllers/projectController';
import { studentController } from '../controllers/studentController';
import { dashboardController } from '../controllers/dashboardController';
import { studentEventController } from '../controllers/eventController';
import { projectTeamController } from '../controllers/projectTeamController';
import { announcementController } from '../controllers/announcementController';

const router = Router();
router.use(authenticate);

// Profile routes
router.get('/profile', studentController.getProfile);
router.patch('/profile', studentController.updateProfile);
router.get('/profile/skills', studentController.getSkills);
router.put('/profile/skills', studentController.updateSkills);
router.get('/profile/interests', studentController.getInterests);
router.put('/profile/interests', studentController.updateInterests);

// Dashboard aggregation route
router.get('/dashboard', dashboardController.getDashboard);

// Projects and Courses
router.get('/projects', mainProjectController.getMyProjects);
router.post('/projects/:id/interest', projectController.addInterest);
router.delete('/projects/:id/interest', projectController.removeInterest);
router.get('/courses/progress', courseController.getProgress);

// Events
router.get('/events/registrations', studentEventController.getMyRegistrations);
router.get('/me/events/registrations', studentEventController.getMyRegistrations); // alias for backwards compatibility
router.get('/events/:id/registration', studentEventController.getRegistration);
router.post('/events/:id/register', studentEventController.register);
router.delete('/events/:id/register', studentEventController.cancelRegistration);
router.post('/events/:id/unregister', studentEventController.unregister);

// Team routes
router.get('/project-teams', projectTeamController.getMyTeams);
router.get('/team-invitations', projectTeamController.getMyInvitations);
router.post('/projects/:id/teams', projectTeamController.createTeam);
router.post('/teams/:id/join', projectTeamController.joinTeam);
router.post('/teams/:id/leave', projectTeamController.leaveTeam);

// Announcement routes
router.get('/announcements/unread-count', announcementController.getUnreadCount);
router.post('/announcements/:id/read', announcementController.markAsRead);

export default router;