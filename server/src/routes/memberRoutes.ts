import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { studentController } from '../controllers/studentController';
import { memberDirectoryController } from '../controllers/memberDirectoryController';

const router = Router();

// Authenticated current member self-management
router.get('/me', authenticate, studentController.getProfile);
router.patch('/me', authenticate, studentController.updateProfile);
router.get('/me/skills', authenticate, studentController.getSkills);
router.put('/me/skills', authenticate, studentController.updateSkills);
router.get('/me/interests', authenticate, studentController.getInterests);
router.put('/me/interests', authenticate, studentController.updateInterests);

// Public directory and individual member profiles
router.get('/', memberDirectoryController.getMembers);
router.get('/:id', memberDirectoryController.getMemberById);

export default router;
