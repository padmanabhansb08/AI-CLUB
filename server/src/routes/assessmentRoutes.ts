import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { assessmentController } from '../controllers/assessmentController';

const router = Router();

// All assessment actions require authenticated student
router.use(authenticate);

// 1. Start a new or resume active assessment attempt
router.post('/start', assessmentController.startAssessment);

// 2. Get active assessment questions and state (NEVER returns answers)
router.get('/:attemptId', assessmentController.getAssessment);

// 3. Auto-save student's answer for a question
router.put('/:attemptId/questions/:questionId', assessmentController.saveAnswer);

// 4. Submit assessment for server-side evaluation & score calculation
router.post('/:attemptId/submit', assessmentController.submitAssessment);

export default router;
