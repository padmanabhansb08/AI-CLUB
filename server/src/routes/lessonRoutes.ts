import { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { authenticate, authenticateOptional } from '../middleware/auth';

const router = Router();

router.get('/:id', authenticateOptional, courseController.getLesson);
router.patch('/:id', authenticate, courseController.updateLesson);
router.delete('/:id', authenticate, courseController.deleteLesson);

// Progress endpoints
router.post('/:id/start', authenticate, courseController.startLesson);
router.patch('/:id/progress', authenticate, courseController.updateProgress);
router.post('/:id/complete', authenticate, courseController.completeLesson);
router.get('/:id/progress', authenticate, courseController.getLessonProgress);

export default router;
