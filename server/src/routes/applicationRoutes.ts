import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { applicationController } from '../controllers/applicationController';

const router = Router();

// Student-accessible routes
router.get('/me', authenticate, applicationController.getMyApplication);
router.put('/profile', authenticate, applicationController.updateProfile);
router.post('/apply', authenticate, applicationController.updateProfile);

// Admin-accessible routes (strictly protected by requireAdmin)
router.get('/', authenticate, requireAdmin, applicationController.listApplications);
router.get('/counts', authenticate, requireAdmin, applicationController.getCounts);
router.get('/analytics', authenticate, requireAdmin, applicationController.getAnalytics);
router.get('/:id', authenticate, requireAdmin, applicationController.getApplicationById);
router.post('/:id/review', authenticate, requireAdmin, applicationController.reviewApplication);

export default router;
