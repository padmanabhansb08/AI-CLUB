import { Router } from 'express';
import { authenticate, authenticateOptional, requireAdmin } from '../middleware/auth';
import { 
  publicEventController, 
  studentEventController, 
  adminEventController 
} from '../controllers/eventController';

const router = Router();

// Student's own registered events (placed before /:id)
router.get('/me/registrations', authenticate, studentEventController.getMyRegistrations);

// Event Discovery & Details
router.get('/', publicEventController.getAll);
router.get('/:id', authenticateOptional, publicEventController.getById);

// Student Registration Endpoints
router.get('/:id/registration', authenticate, studentEventController.getRegistration);
router.post('/:id/register', authenticate, studentEventController.register);
router.delete('/:id/register', authenticate, studentEventController.cancelRegistration);
router.post('/:id/unregister', authenticate, studentEventController.unregister);

// Admin-only Event Management
router.post('/', authenticate, requireAdmin, adminEventController.create);
router.patch('/:id', authenticate, requireAdmin, adminEventController.update);
router.put('/:id', authenticate, requireAdmin, adminEventController.update);
router.delete('/:id', authenticate, requireAdmin, adminEventController.delete);
router.post('/:id/publish', authenticate, requireAdmin, adminEventController.publish);
router.post('/:id/cancel', authenticate, requireAdmin, adminEventController.cancel);
router.post('/:id/complete', authenticate, requireAdmin, adminEventController.complete);
router.get('/:id/registrations', authenticate, requireAdmin, adminEventController.getRegistrations);

// Admin-only Attendance Endpoints
router.get('/:id/attendance', authenticate, requireAdmin, adminEventController.getAttendance);
router.put('/:id/attendance', authenticate, requireAdmin, adminEventController.markAttendance);
router.post('/:id/attendance', authenticate, requireAdmin, adminEventController.markAttendance);
router.post('/:id/attendance/bulk', authenticate, requireAdmin, adminEventController.bulkMarkAttendance);
router.post('/:id/attendance/check-in', authenticate, requireAdmin, adminEventController.checkIn);

export default router;
