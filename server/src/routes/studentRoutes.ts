import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { projectController, courseController } from '../controllers/contentController';
import { studentController } from '../controllers/studentController';
import { studentEventController } from '../controllers/eventController';
import { projectTeamController } from '../controllers/projectTeamController';
import { announcementController } from '../controllers/announcementController';

const router = Router();
router.use(authenticate);

router.get('/profile', studentController.getProfile);
router.patch('/profile', studentController.updateProfile);

router.post('/projects/:id/interest', projectController.addInterest);
router.delete('/projects/:id/interest', projectController.removeInterest);
router.get('/courses/progress', courseController.getProgress);

router.get('/me/events/registrations', studentEventController.getMyRegistrations);
router.post('/events/:id/register', studentEventController.register);
router.post('/events/:id/unregister', studentEventController.unregister);

// Team routes
router.get('/project-teams', projectTeamController.getMyTeams);
router.post('/projects/:id/teams', projectTeamController.createTeam);
router.post('/teams/:id/join', projectTeamController.joinTeam);
router.post('/teams/:id/leave', projectTeamController.leaveTeam);

// Announcement routes
router.get('/announcements/unread-count', announcementController.getUnreadCount);
router.post('/announcements/:id/read', announcementController.markAsRead);

export default router;