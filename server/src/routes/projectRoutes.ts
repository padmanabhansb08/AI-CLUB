import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { projectTeamController } from '../controllers/projectTeamController';
import { authenticate, authenticateOptional, requireAdmin } from '../middleware/auth';

const router = Router();

// Student's projects
router.get('/my', authenticate, projectController.getMyProjects);

// Milestone modifications directly by ID
router.patch('/milestones/:milestoneId', authenticate, projectController.updateMilestone);
router.delete('/milestones/:milestoneId', authenticate, projectController.deleteMilestone);

// Public / Authenticated Project Discovery
router.get('/', authenticateOptional, projectController.getAll);
router.get('/:id', authenticateOptional, projectController.getById);

// Admin / Lead Project Management
router.post('/', authenticate, requireAdmin, projectController.create);
router.put('/:id', authenticate, projectController.update);
router.patch('/:id', authenticate, projectController.update);
router.delete('/:id', authenticate, projectController.delete);
router.post('/:id/publish', authenticate, requireAdmin, projectController.publish);

// Project Memberships
router.get('/:id/members', authenticateOptional, projectController.getMembers);
router.post('/:id/join', authenticate, projectController.requestJoin);
router.post('/:id/members', authenticate, projectController.requestJoin);
router.delete('/:id/leave', authenticate, projectController.leave);
router.delete('/:id/members/me', authenticate, projectController.leave);
router.patch('/:id/members/:memberId', authenticate, projectController.updateMembership);
router.delete('/:id/members/:memberId', authenticate, projectController.removeMember);

// Project Teams
router.get('/:id/teams', authenticateOptional, projectTeamController.getProjectTeams);
router.post('/:id/teams', authenticate, projectTeamController.createTeam);

// Project Milestones
router.get('/:id/milestones', authenticateOptional, projectController.getMilestones);
router.post('/:id/milestones', authenticate, projectController.createMilestone);

export default router;
