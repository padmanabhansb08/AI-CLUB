import { Request, Response, NextFunction } from 'express';
import { projectTeamService } from '../services/projectTeamService';
import { AuthRequest } from '../middleware/auth';
import {
  teamCreateSchema,
  teamUpdateSchema,
  teamMemberRoleSchema,
  teamInvitationCreateSchema,
  teamInvitationRespondSchema,
} from '../validators/schemas';
import { sendSuccess } from '../utils/response';
import { pool } from '../db';
import { ApiError } from '../middleware/errorHandler';

async function getMemberIdFromUser(userId?: string): Promise<string> {
  if (!userId) {
    throw new ApiError('UNAUTHORIZED', 'Authentication required');
  }
  const memberRes = await pool.query('SELECT id FROM members WHERE user_id = $1', [userId]);
  if ((memberRes.rowCount ?? 0) === 0) {
    throw new ApiError('NOT_FOUND', 'Member profile not found');
  }
  return memberRes.rows[0].id;
}

export const projectTeamController = {
  async getProjectTeams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: projectId } = req.params;
      let memberId: string | undefined;

      if (req.user && req.user.role === 'student') {
        const memberRes = await pool.query('SELECT id FROM members WHERE user_id = $1', [
          req.user.id || req.user.userId,
        ]);
        if ((memberRes.rowCount ?? 0) > 0) {
          memberId = memberRes.rows[0].id;
        }
      }

      const teams = await projectTeamService.getProjectTeams(projectId as string, memberId);
      return sendSuccess(res, teams, 'Project teams retrieved');
    } catch (e) {
      next(e);
    }
  },

  async getTeamById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: teamId } = req.params;
      let memberId: string | undefined;
      if (req.user) {
        const memberRes = await pool.query('SELECT id FROM members WHERE user_id = $1', [
          req.user.id || req.user.userId,
        ]);
        if ((memberRes.rowCount ?? 0) > 0) {
          memberId = memberRes.rows[0].id;
        }
      }

      const team = await projectTeamService.getTeamById(teamId as string, memberId);
      return sendSuccess(res, team, 'Team retrieved');
    } catch (e) {
      next(e);
    }
  },

  async createTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: projectId } = req.params;
      const data = teamCreateSchema.parse(req.body);
      const memberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);

      const team = await projectTeamService.createTeam(
        {
          projectId: projectId as string,
          name: data.name,
          description: data.description,
          maxMembers: data.max_members,
        },
        memberId
      );
      return sendSuccess(res, team, 'Team created successfully', 201);
    } catch (e) {
      next(e);
    }
  },

  async updateTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: teamId } = req.params;
      const data = teamUpdateSchema.parse(req.body);
      const memberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      const team = await projectTeamService.updateTeam(teamId as string, data, memberId, isAdmin);
      return sendSuccess(res, team, 'Team updated successfully');
    } catch (e) {
      next(e);
    }
  },

  async deleteTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: teamId } = req.params;
      const memberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      await projectTeamService.deleteTeam(teamId as string, memberId, isAdmin);
      return sendSuccess(res, {}, 'Team disbanded successfully');
    } catch (e) {
      next(e);
    }
  },

  async joinTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: teamId } = req.params;
      const memberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);

      const result = await projectTeamService.joinTeam(teamId as string, memberId);
      return sendSuccess(res, result, 'Joined team successfully');
    } catch (e) {
      next(e);
    }
  },

  async leaveTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: teamId } = req.params;
      const memberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);

      const result = await projectTeamService.leaveTeam(teamId as string, memberId);
      return sendSuccess(res, result, 'Left team successfully');
    } catch (e) {
      next(e);
    }
  },

  async updateMemberRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: teamId, memberId: targetMemberId } = req.params;
      const { role } = teamMemberRoleSchema.parse(req.body);
      const callerMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      const result = await projectTeamService.updateMemberRole(
        teamId as string,
        targetMemberId as string,
        role,
        callerMemberId,
        isAdmin
      );
      return sendSuccess(res, result, 'Team member role updated');
    } catch (e) {
      next(e);
    }
  },

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: teamId, memberId: targetMemberId } = req.params;
      const callerMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      await projectTeamService.removeMemberFromTeam(
        teamId as string,
        targetMemberId as string,
        callerMemberId,
        isAdmin
      );
      return sendSuccess(res, {}, 'Member removed from team');
    } catch (e) {
      next(e);
    }
  },

  async getMyTeams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const memberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const teams = await projectTeamService.getMyTeams(memberId);
      return sendSuccess(res, teams, 'My teams retrieved');
    } catch (e) {
      next(e);
    }
  },

  // Invitations
  async inviteMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: teamId } = req.params;
      const body = teamInvitationCreateSchema.parse(req.body);
      const callerMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      const invitation = await projectTeamService.inviteMember(
        teamId as string,
        body.invited_member_id,
        callerMemberId,
        isAdmin
      );
      return sendSuccess(res, invitation, 'Team invitation sent successfully', 201);
    } catch (e) {
      next(e);
    }
  },

  async getTeamInvitations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: teamId } = req.params;
      const callerMemberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const isAdmin = req.user?.role === 'admin';

      const invitations = await projectTeamService.getTeamInvitations(
        teamId as string,
        callerMemberId,
        isAdmin
      );
      return sendSuccess(res, invitations, 'Team invitations retrieved');
    } catch (e) {
      next(e);
    }
  },

  async getMyInvitations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const memberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);
      const invitations = await projectTeamService.getMyInvitations(memberId);
      return sendSuccess(res, invitations, 'Invitations retrieved');
    } catch (e) {
      next(e);
    }
  },

  async respondToInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: invitationId } = req.params;
      const { action } = teamInvitationRespondSchema.parse(req.body);
      const memberId = await getMemberIdFromUser(req.user?.id || req.user?.userId);

      const result = await projectTeamService.respondToInvitation(
        invitationId as string,
        action,
        memberId
      );
      return sendSuccess(res, result, `Invitation ${action.toLowerCase()}ed`);
    } catch (e) {
      next(e);
    }
  },

  async getAdminProjectTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: projectId } = req.params;
      const teams = await projectTeamService.getProjectTeams(projectId as string);
      return sendSuccess(res, teams, 'Admin project teams retrieved');
    } catch (e) {
      next(e);
    }
  },
};
