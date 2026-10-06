import { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.patch('/:id', authenticate, courseController.updateModule);
router.delete('/:id', authenticate, courseController.deleteModule);
router.post('/:moduleId/lessons', authenticate, courseController.createLesson);

export default router;
