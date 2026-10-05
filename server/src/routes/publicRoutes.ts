import { Router } from 'express';
import { authenticateOptional } from '../middleware/auth';
import { achievementController, updateController, projectController, courseController } from '../controllers/contentController';
import { publicEventController } from '../controllers/eventController';
import { projectTeamController } from '../controllers/projectTeamController';

const router = Router();
router.get('/achievements', achievementController.getAll);
router.get('/achievements/:id', achievementController.getById);
router.get('/updates', updateController.getAll);
router.get('/updates/:id', updateController.getById);
router.get('/projects', projectController.getAll);
router.get('/projects/:id', projectController.getById);
router.get('/projects/:id/teams', authenticateOptional, projectTeamController.getProjectTeams);
router.get('/courses', courseController.getAll);
router.get('/courses/:id', courseController.getById);

router.get('/events', publicEventController.getAll);
router.get('/events/:id', authenticateOptional, publicEventController.getById);

export default router;