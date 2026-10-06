import { Router } from 'express';
import { achievementController } from '../controllers/achievementController';
import { authenticate, authenticateOptional } from '../middleware/auth';

const router = Router();

// Student authenticated routes (must precede /:id)
router.get('/me', authenticate, achievementController.getMyAchievements);
router.get('/me/progress', authenticate, achievementController.getMyProgress);
router.get('/me/stats', authenticate, achievementController.getMyStats);
router.post('/me/evaluate', authenticate, achievementController.evaluate);

// Public / Discovery
router.get('/', authenticateOptional, achievementController.getAll);
router.get('/:id', authenticateOptional, achievementController.getById);

export default router;
