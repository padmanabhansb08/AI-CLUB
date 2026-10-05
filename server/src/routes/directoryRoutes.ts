import { Router } from 'express';
import { directoryController } from '../controllers/directoryController';
import { authenticate } from '../middleware/auth';

export const router = Router();

router.use(authenticate);

router.get('/', directoryController.getMembers);
router.get('/:id', directoryController.getMemberById);
