import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { memberController, achievementController, updateController, projectController, courseController } from '../controllers/contentController';
import { adminEventController } from '../controllers/eventController';
import { projectTeamController } from '../controllers/projectTeamController';
import { announcementController } from '../controllers/announcementController';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/members', memberController.getAll);
router.get('/members/:id', memberController.getById);

router.post('/achievements', achievementController.create);
router.put('/achievements/:id', achievementController.update);
router.delete('/achievements/:id', achievementController.delete);

router.post('/updates', updateController.create);
router.put('/updates/:id', updateController.update);
router.delete('/updates/:id', updateController.delete);

router.post('/projects', projectController.create);
router.put('/projects/:id', projectController.update);
router.delete('/projects/:id', projectController.delete);
router.get('/projects/:id/teams', projectTeamController.getAdminProjectTeams);

router.post('/courses', courseController.create);
router.put('/courses/:id', courseController.update);
router.delete('/courses/:id', courseController.delete);

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

router.get('/announcements', announcementController.getAllAdmin);
router.post('/announcements', announcementController.create);
router.patch('/announcements/:id', announcementController.update);
router.delete('/announcements/:id', announcementController.delete);

export default router;