import { projectTeamRepository } from '../repositories/projectTeamRepository';
import { projectRepo } from '../repositories/projectRepository';
import { ApiError } from '../middleware/errorHandler';
import { pool, query } from '../db';

export const projectTeamService = {
  async getProjectTeams(projectId: string, currentMemberId?: string) {
    const teams = await projectTeamRepository.getTeamsByProject(projectId);

    // Enrich teams with their members and current student role
    for (const team of teams) {
      team.members = await projectTeamRepository.getTeamMembers(team.id);
      team.current_student_role = null;

      if (currentMemberId) {
        const membership = team.members.find((m: any) => m.member_id === currentMemberId);
        if (membership) {
          team.current_student_role = membership.role;
        }
      }
    }
    return teams;
  },

  async getTeamById(teamId: string, currentMemberId?: string) {
    const team = await projectTeamRepository.getTeamById(teamId);
    if (!team) {
      throw new ApiError('NOT_FOUND', 'Team not found');
    }
    team.members = await projectTeamRepository.getTeamMembers(team.id);
    if (currentMemberId) {
      const membership = team.members.find((m: any) => m.member_id === currentMemberId);
      if (membership) {
        team.current_student_role = membership.role;
      }
    }
    return team;
  },

  async createTeam(
    data: { projectId: string; name: string; description?: string | null; maxMembers?: number },
    memberId: string
  ) {
    const project = await projectRepo.findById(data.projectId);
    if (!project) {
      throw new ApiError('NOT_FOUND', 'Project not found');
    }

    const closedStatuses = ['COMPLETED', 'ARCHIVED', 'CANCELLED', 'completed', 'archived', 'cancelled'];
    if (closedStatuses.includes(project.status)) {
      throw new ApiError('BAD_REQUEST', 'Project is closed for new teams');
    }

    const team = await projectTeamRepository.createTeam({
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      maxMembers: data.maxMembers || project.max_team_size || 5,
      createdBy: memberId,
      status: 'ACTIVE',
    });

    return team;
  },

  async updateTeam(
    teamId: string,
    data: { name?: string; description?: string | null; status?: string; max_members?: number },
    callerMemberId: string,
    isAdmin = false
  ) {
    const team = await projectTeamRepository.getTeamById(teamId);
    if (!team) {
      throw new ApiError('NOT_FOUND', 'Team not found');
    }

    if (!isAdmin && team.team_lead_id !== callerMemberId) {
      throw new ApiError('FORBIDDEN', 'Only team leads or admins can modify team details');
    }

    return projectTeamRepository.updateTeam(teamId, data);
  },

  async deleteTeam(teamId: string, callerMemberId: string, isAdmin = false) {
    const team = await projectTeamRepository.getTeamById(teamId);
    if (!team) {
      throw new ApiError('NOT_FOUND', 'Team not found');
    }

    if (!isAdmin && team.team_lead_id !== callerMemberId) {
      throw new ApiError('FORBIDDEN', 'Only team leads or admins can disband a team');
    }

    return projectTeamRepository.deleteTeam(teamId);
  },

  async joinTeam(teamId: string, memberId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock the team row to prevent concurrent joins exceeding capacity
      const teamRes = await client.query('SELECT * FROM project_teams WHERE id = $1 FOR UPDATE', [teamId]);
      const team = teamRes.rows[0];

      if (!team) {
        throw new ApiError('NOT_FOUND', 'Team not found');
      }

      if (['FULL', 'COMPLETED', 'ARCHIVED', 'closed'].includes(team.status)) {
        throw new ApiError('BAD_REQUEST', 'Team is not accepting members');
      }

      const project = await projectRepo.findById(team.project_id);
      if (project && ['COMPLETED', 'ARCHIVED', 'CANCELLED', 'completed', 'archived', 'cancelled'].includes(project.status)) {
        throw new ApiError('BAD_REQUEST', 'Project is closed');
      }

      // Check if already active member
      const memberRes = await client.query(
        'SELECT 1 FROM project_team_members WHERE team_id = $1 AND member_id = $2 AND status = \'ACTIVE\'',
        [teamId, memberId]
      );
      if ((memberRes.rowCount ?? 0) > 0) {
        await client.query('COMMIT');
        return { message: 'Already a member' };
      }

      // Check capacity
      if (team.max_members) {
        const countRes = await client.query(
          'SELECT COUNT(*) FROM project_team_members WHERE team_id = $1 AND status = \'ACTIVE\'',
          [teamId]
        );
        const count = parseInt(countRes.rows[0].count, 10);
        if (count >= team.max_members) {
          throw new ApiError('BAD_REQUEST', 'Team is at full capacity');
        }
      }

      await client.query(
        `
        INSERT INTO project_team_members (team_id, member_id, role, status, joined_at)
        VALUES ($1, $2, 'MEMBER', 'ACTIVE', CURRENT_TIMESTAMP)
        ON CONFLICT (team_id, member_id) DO UPDATE SET status = 'ACTIVE', role = 'MEMBER', joined_at = CURRENT_TIMESTAMP
      `,
        [teamId, memberId]
      );

      // Auto-ensure active project membership
      await client.query(
        `
        INSERT INTO project_memberships (project_id, member_id, role, status, joined_at)
        VALUES ($1, $2, 'CONTRIBUTOR', 'ACTIVE', CURRENT_TIMESTAMP)
        ON CONFLICT (project_id, member_id) DO UPDATE SET 
          status = 'ACTIVE',
          joined_at = COALESCE(project_memberships.joined_at, CURRENT_TIMESTAMP)
      `,
        [team.project_id, memberId]
      );

      // Check if team is now full
      if (team.max_members) {
        const countRes = await client.query(
          'SELECT COUNT(*) FROM project_team_members WHERE team_id = $1 AND status = \'ACTIVE\'',
          [teamId]
        );
        const count = parseInt(countRes.rows[0].count, 10);
        if (count >= team.max_members) {
          await client.query('UPDATE project_teams SET status = \'FULL\' WHERE id = $1', [teamId]);
        }
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async leaveTeam(teamId: string, memberId: string) {
    const members = await projectTeamRepository.getTeamMembers(teamId);
    const membership = members.find((m: any) => m.member_id === memberId);

    if (!membership) {
      return { message: 'Not a member' };
    }

    if (membership.role === 'TEAM_LEAD' || membership.role === 'leader') {
      const otherLeaders = members.filter(
        (m: any) => (m.role === 'TEAM_LEAD' || m.role === 'leader') && m.member_id !== memberId
      );
      if (otherLeaders.length === 0 && members.length > 1) {
        throw new ApiError('BAD_REQUEST', 'Cannot leave as the only leader. Promote another leader first.');
      }
    }

    await projectTeamRepository.removeMember(teamId, memberId);

    // If team was FULL, reset status to ACTIVE
    const team = await projectTeamRepository.getTeamById(teamId);
    if (team && team.status === 'FULL') {
      await projectTeamRepository.updateTeam(teamId, { status: 'ACTIVE' });
    }

    return { success: true };
  },

  async updateMemberRole(
    teamId: string,
    targetMemberId: string,
    role: string,
    callerMemberId: string,
    isAdmin = false
  ) {
    const team = await projectTeamRepository.getTeamById(teamId);
    if (!team) {
      throw new ApiError('NOT_FOUND', 'Team not found');
    }

    if (!isAdmin && team.team_lead_id !== callerMemberId) {
      throw new ApiError('FORBIDDEN', 'Only team leads or admins can assign team roles');
    }

    const members = await projectTeamRepository.getTeamMembers(teamId);
    const target = members.find((m) => m.member_id === targetMemberId);
    if (!target) {
      throw new ApiError('NOT_FOUND', 'Member is not in this team');
    }

    // If promoting to TEAM_LEAD, update team's primary team_lead_id
    if (role === 'TEAM_LEAD') {
      await query('UPDATE project_teams SET team_lead_id = $1 WHERE id = $2', [targetMemberId, teamId]);
    }

    return projectTeamRepository.updateMemberRole(teamId, targetMemberId, role);
  },

  async removeMemberFromTeam(
    teamId: string,
    targetMemberId: string,
    callerMemberId: string,
    isAdmin = false
  ) {
    const team = await projectTeamRepository.getTeamById(teamId);
    if (!team) {
      throw new ApiError('NOT_FOUND', 'Team not found');
    }

    if (!isAdmin && team.team_lead_id !== callerMemberId) {
      throw new ApiError('FORBIDDEN', 'Only team leads or admins can remove members');
    }

    if (targetMemberId === team.team_lead_id && !isAdmin) {
      throw new ApiError('BAD_REQUEST', 'Cannot remove team lead without transferring leadership');
    }

    await projectTeamRepository.removeMember(teamId, targetMemberId);
    return { success: true };
  },

  async getMyTeams(memberId: string) {
    const teams = await projectTeamRepository.getMyTeams(memberId);
    for (const team of teams) {
      team.members = await projectTeamRepository.getTeamMembers(team.id);
    }
    return teams;
  },

  // Invitations
  async inviteMember(teamId: string, invitedMemberId: string, callerMemberId: string, isAdmin = false) {
    const team = await projectTeamRepository.getTeamById(teamId);
    if (!team) {
      throw new ApiError('NOT_FOUND', 'Team not found');
    }

    if (!isAdmin && team.team_lead_id !== callerMemberId) {
      throw new ApiError('FORBIDDEN', 'Only team leads can invite members');
    }

    // Check if target member exists
    const memberRes = await query('SELECT id FROM members WHERE id = $1', [invitedMemberId]);
    if (memberRes.rowCount === 0) {
      throw new ApiError('NOT_FOUND', 'Invited student member not found');
    }

    // Check if target is already member
    const members = await projectTeamRepository.getTeamMembers(teamId);
    if (members.some((m) => m.member_id === invitedMemberId)) {
      throw new ApiError('BAD_REQUEST', 'Student is already a member of this team');
    }

    // Check if invitation already pending
    const existing = await query(
      'SELECT id FROM team_invitations WHERE team_id = $1 AND invited_member_id = $2 AND status = \'PENDING\'',
      [teamId, invitedMemberId]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      throw new ApiError('BAD_REQUEST', 'An invitation is already pending for this student');
    }

    return projectTeamRepository.createInvitation(teamId, invitedMemberId, callerMemberId);
  },

  async getMyInvitations(memberId: string) {
    return projectTeamRepository.getMyInvitations(memberId);
  },

  async getTeamInvitations(teamId: string, callerMemberId: string, isAdmin = false) {
    const team = await projectTeamRepository.getTeamById(teamId);
    if (!team) {
      throw new ApiError('NOT_FOUND', 'Team not found');
    }

    if (!isAdmin && team.team_lead_id !== callerMemberId) {
      throw new ApiError('FORBIDDEN', 'Only team leads can view invitations');
    }

    return projectTeamRepository.getTeamInvitations(teamId);
  },

  async respondToInvitation(invitationId: string, action: 'ACCEPT' | 'DECLINE', callerMemberId: string) {
    const invitation = await projectTeamRepository.getInvitationById(invitationId);
    if (!invitation) {
      throw new ApiError('NOT_FOUND', 'Invitation not found');
    }

    if (invitation.invited_member_id !== callerMemberId) {
      throw new ApiError('FORBIDDEN', 'You can only respond to your own invitations');
    }

    if (invitation.status !== 'PENDING') {
      throw new ApiError('BAD_REQUEST', `Invitation has already been ${invitation.status.toLowerCase()}`);
    }

    if (action === 'DECLINE') {
      return projectTeamRepository.updateInvitationStatus(invitationId, 'DECLINED');
    }

    // If accepted: join team atomically
    await projectTeamService.joinTeam(invitation.team_id, callerMemberId);
    return projectTeamRepository.updateInvitationStatus(invitationId, 'ACCEPTED');
  },
};
