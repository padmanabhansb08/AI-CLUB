import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// 1. Status (Public / Safe)
router.get('/status', aiController.getStatus);

// 2. Student AI Endpoints (Requires Authenticated Student)
router.use(authenticate);

// Grounded Multi-Domain Search
router.get('/search', aiController.search);

// Recommendations
router.get('/recommendations', aiController.getRecommendations);
router.get('/recommendations/courses', aiController.getCourseRecommendations);
router.get('/recommendations/events', aiController.getEventRecommendations);
router.get('/recommendations/projects', aiController.getProjectRecommendations);

// Skill Gap Analysis & Learning Paths
router.get('/skills/gaps', aiController.getSkillGaps);
router.post('/skills/analyze', aiController.analyzeSkills);
router.post('/learning-path', aiController.generateLearningPath);

// AI Assistant
router.post('/assistant/chat', aiController.chat);
router.get('/assistant/conversations', aiController.listConversations);
router.get('/assistant/conversations/:id', aiController.getConversation);
router.delete('/assistant/conversations/:id', aiController.deleteConversation);

// Dashboard Insights
router.get('/insights', aiController.getInsights);

// AI Preferences
router.get('/preferences', aiController.getPreferences);
router.put('/preferences', aiController.updatePreferences);

// 3. Admin AI Endpoints (Requires Admin Authorization)
router.get('/admin/insights', requireAdmin, aiController.getAdminInsights);
router.get('/admin/analytics', requireAdmin, aiController.getAdminTelemetry);

export default router;
