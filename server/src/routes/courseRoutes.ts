import { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { authenticate, authenticateOptional, requireRole } from '../middleware/auth';

const router = Router();

// 1. Discovery & List
router.get('/', authenticateOptional, courseController.getAll);

// 2. Student Enrolled Courses (must precede /:id)
router.get('/me', authenticate, courseController.getMyCourses);

// 3. Create Course (Admin or Lead/Instructor)
router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'admin', 'LEAD', 'lead', 'INSTRUCTOR', 'instructor'),
  courseController.create
);

// 4. Single Course Detail
router.get('/:id', authenticateOptional, courseController.getById);

// 5. Update & Delete Course
router.patch('/:id', authenticate, courseController.update);
router.delete('/:id', authenticate, courseController.delete);

// 6. Course Lifecycle Transitions
router.post('/:id/publish', authenticate, courseController.publish);
router.post('/:id/unpublish', authenticate, courseController.unpublish);
router.post('/:id/archive', authenticate, courseController.archive);

// 7. Curriculum & Modules
router.get('/:id/curriculum', authenticateOptional, courseController.getCurriculum);
router.get('/:id/modules', authenticateOptional, courseController.getCurriculum);
router.post('/:id/modules', authenticate, courseController.createModule);

// 8. Enrollments
router.post('/:id/enroll', authenticate, courseController.enroll);
router.delete('/:id/enroll', authenticate, courseController.dropEnrollment);
router.get('/:id/enrollment', authenticate, courseController.getEnrollment);

// 9. Course Progress & Analytics
router.get('/:id/progress', authenticate, courseController.getCourseProgress);
router.get('/:id/analytics', authenticate, courseController.getAnalytics);

export default router;
