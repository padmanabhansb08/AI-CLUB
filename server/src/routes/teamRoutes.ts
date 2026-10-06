import { Router } from 'express';
import { projectTeamController } from '../controllers/projectTeamController';
import { authenticate, authenticateOptional } from '../middleware/auth';

const router = Router();

// Student's personal team invitations & teams
router.get('/my', authenticate, projectTeamController.getMyTeams);
router.get('/invitations/me', authenticate, projectTeamController.getMyInvitations);
router.post('/invitations/:id/respond', authenticate, projectTeamController.respondToInvitation);

// Team details & modifications
router.get('/:id', authenticateOptional, projectTeamController.getTeamById);
router.patch('/:id', authenticate, projectTeamController.updateTeam);
router.delete('/:id', authenticate, projectTeamController.deleteTeam);

// Team membership actions
router.post('/:id/join', authenticate, projectTeamController.joinTeam);
router.post('/:id/leave', authenticate, projectTeamController.leaveTeam);
router.patch('/:id/members/:memberId', authenticate, projectTeamController.updateMemberRole);
router.delete('/:id/members/:memberId', authenticate, projectTeamController.removeMember);

// Team invitations
router.get('/:id/invitations', authenticate, projectTeamController.getTeamInvitations);
router.post('/:id/invitations', authenticate, projectTeamController.inviteMember);

export default router;
