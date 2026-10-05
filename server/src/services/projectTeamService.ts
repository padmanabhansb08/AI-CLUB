import { projectTeamRepository } from '../repositories/projectTeamRepository';
import { projectRepo } from '../repositories/projectRepository';
import { ApiError } from '../middleware/errorHandler';
import { pool } from '../db';

export const projectTeamService = {
  async getProjectTeams(projectId: string, currentMemberId?: string) {
    const teams = await projectTeamRepository.getTeamsByProject(projectId);
    
    // Enrich teams with their members
    for (const team of teams) {
      team.members = await projectTeamRepository.getTeamMembers(team.id);
      team.currentStudentMembership = null;
      
      if (currentMemberId) {
        const membership = team.members.find((m: any) => m.member_id === currentMemberId);
        if (membership) {
          team.currentStudentMembership = membership.role;
        }
      }
    }
    return teams;
  },

  async createTeam(data: { projectId: string; name: string; description?: string; maxMembers?: number }, memberId: string) {
    const project = await projectRepo.findById(data.projectId);
    if (!project) {
      throw new ApiError('NOT_FOUND', 'Project not found');
    }
    
    // Assuming open statuses are 'active', 'planning', or 'open'. 'completed'/'archived' are closed.
    if (project.status === 'completed' || project.status === 'archived') {
      throw new ApiError('BAD_REQUEST', 'Project is closed for new teams');
    }

    const hasInterest = await projectTeamRepository.hasInterest(memberId, data.projectId);
    if (!hasInterest) {
      throw new ApiError('BAD_REQUEST', 'Must express interest in the project before creating a team');
    }

    const team = await projectTeamRepository.createTeam({
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      maxMembers: data.maxMembers,
      createdBy: memberId,
      status: 'forming'
    });

    return team;
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

      if (team.status === 'closed' || team.status === 'archived') {
        throw new ApiError('BAD_REQUEST', 'Team is not accepting members');
      }

      const project = await projectRepo.findById(team.project_id);
      if (project && (project.status === 'completed' || project.status === 'archived')) {
        throw new ApiError('BAD_REQUEST', 'Project is closed');
      }

      // Check if already member
      const memberRes = await client.query('SELECT 1 FROM project_team_members WHERE team_id = $1 AND member_id = $2', [teamId, memberId]);
      if ((memberRes.rowCount ?? 0) > 0) {
        await client.query('COMMIT');
        return { message: 'Already a member' }; // Idempotent
      }

      // Check capacity
      if (team.max_members) {
        const countRes = await client.query('SELECT COUNT(*) FROM project_team_members WHERE team_id = $1', [teamId]);
        const count = parseInt(countRes.rows[0].count);
        if (count >= team.max_members) {
          throw new ApiError('BAD_REQUEST', 'Team is at full capacity');
        }
      }

      await client.query(`
        INSERT INTO project_team_members (team_id, member_id, role)
        VALUES ($1, $2, 'member')
      `, [teamId, memberId]);

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

    if (membership.role === 'leader') {
      const otherLeaders = members.filter((m: any) => m.role === 'leader' && m.member_id !== memberId);
      if (otherLeaders.length === 0) {
        throw new ApiError('BAD_REQUEST', 'Cannot leave as the only leader of the team');
      }
    }

    await projectTeamRepository.removeMember(teamId, memberId);
    return { success: true };
  },

  async getMyTeams(memberId: string) {
    const teams = await projectTeamRepository.getMyTeams(memberId);
    for (const team of teams) {
      team.members = await projectTeamRepository.getTeamMembers(team.id);
      team.currentStudentMembership = team.role; // From the JOIN
    }
    return teams;
  }
};
