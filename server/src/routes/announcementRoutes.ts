import { Router } from 'express';
import { announcementController } from '../controllers/announcementController';
import { authenticate } from '../middleware/auth';

export const router = Router();

router.get('/unread-count', authenticate, announcementController.getUnreadCount);
router.get('/', authenticate, announcementController.getVisibleAnnouncements);
router.post('/:id/read', authenticate, announcementController.markAsRead);
router.get('/:id', authenticate, announcementController.getById);
