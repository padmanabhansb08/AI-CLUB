import { pool, query } from '../db';
import { TeamItem, TeamMemberItem, TeamInvitationItem } from '../types/projects';

export const projectTeamRepository = {
  async getTeamsByProject(projectId: string): Promise<TeamItem[]> {
    const res = await query(
      `
      SELECT 
        t.*,
        COALESCE(tl.full_name, 'Lead') as team_lead_name,
        (SELECT COUNT(*)::int FROM project_team_members WHERE team_id = t.id AND status = 'ACTIVE') as member_count
      FROM project_teams t
      LEFT JOIN members tl ON t.team_lead_id = tl.id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
    `,
      [projectId]
    );
    return res.rows;
  },

  async getTeamById(teamId: string): Promise<TeamItem | null> {
    const res = await query(
      `
      SELECT 
        t.*,
        p.title as project_title,
        COALESCE(tl.full_name, 'Lead') as team_lead_name,
        (SELECT COUNT(*)::int FROM project_team_members WHERE team_id = t.id AND status = 'ACTIVE') as member_count
      FROM project_teams t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN members tl ON t.team_lead_id = tl.id
      WHERE t.id = $1
    `,
      [teamId]
    );
    return res.rows[0] || null;
  },

  async getTeamMembers(teamId: string): Promise<TeamMemberItem[]> {
    const res = await query(
      `
      SELECT 
        ptm.id,
        ptm.team_id,
        ptm.member_id,
        ptm.role,
        ptm.status,
        ptm.joined_at,
        m.full_name,
        m.register_number,
        m.department,
        m.class_section,
        m.year,
        m.profile_photo_url
      FROM project_team_members ptm
      JOIN members m ON ptm.member_id = m.id
      WHERE ptm.team_id = $1 AND ptm.status = 'ACTIVE'
      ORDER BY 
        CASE ptm.role
          WHEN 'TEAM_LEAD' THEN 1
          WHEN 'TECH_LEAD' THEN 2
          WHEN 'DEVELOPER' THEN 3
          WHEN 'ML_ENGINEER' THEN 4
          WHEN 'DESIGNER' THEN 5
          ELSE 6
        END,
        ptm.joined_at ASC
    `,
      [teamId]
    );
    return res.rows;
  },

  async createTeam(data: {
    projectId: string;
    name: string;
    description?: string | null;
    maxMembers?: number | null;
    createdBy: string;
    status?: string;
  }): Promise<TeamItem> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const teamRes = await client.query(
        `
        INSERT INTO project_teams (project_id, name, description, max_members, created_by, team_lead_id, status)
        VALUES ($1, $2, $3, $4, $5, $5, $6)
        RETURNING *
      `,
        [
          data.projectId,
          data.name,
          data.description || null,
          data.maxMembers || 5,
          data.createdBy,
          data.status || 'ACTIVE',
        ]
      );

      const team = teamRes.rows[0];

      await client.query(
        `
        INSERT INTO project_team_members (team_id, member_id, role, status, joined_at)
        VALUES ($1, $2, 'TEAM_LEAD', 'ACTIVE', CURRENT_TIMESTAMP)
        ON CONFLICT (team_id, member_id) DO UPDATE SET role = 'TEAM_LEAD', status = 'ACTIVE'
      `,
        [team.id, data.createdBy]
      );

      // Ensure team creator is also active member of the project
      await client.query(
        `
        INSERT INTO project_memberships (project_id, member_id, role, status, joined_at)
        VALUES ($1, $2, 'CONTRIBUTOR', 'ACTIVE', CURRENT_TIMESTAMP)
        ON CONFLICT (project_id, member_id) DO UPDATE SET 
          status = 'ACTIVE',
          joined_at = COALESCE(project_memberships.joined_at, CURRENT_TIMESTAMP)
      `,
        [data.projectId, data.createdBy]
      );

      await client.query('COMMIT');
      return team;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async updateTeam(
    teamId: string,
    data: { name?: string; description?: string | null; status?: string; max_members?: number }
  ) {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      sets.push(`name = $${idx}`);
      values.push(data.name);
      idx++;
    }
    if (data.description !== undefined) {
      sets.push(`description = $${idx}`);
      values.push(data.description);
      idx++;
    }
    if (data.status !== undefined) {
      sets.push(`status = $${idx}`);
      values.push(data.status);
      idx++;
    }
    if (data.max_members !== undefined) {
      sets.push(`max_members = $${idx}`);
      values.push(data.max_members);
      idx++;
    }

    if (sets.length === 0) return projectTeamRepository.getTeamById(teamId);

    sets.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(teamId);

    const res = await query(
      `UPDATE project_teams SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  },

  async deleteTeam(teamId: string) {
    const res = await query(`DELETE FROM project_teams WHERE id = $1 RETURNING *`, [teamId]);
    return res.rowCount && res.rowCount > 0;
  },

  async addMember(teamId: string, memberId: string, role: string = 'MEMBER') {
    const res = await query(
      `
      INSERT INTO project_team_members (team_id, member_id, role, status, joined_at)
      VALUES ($1, $2, $3, 'ACTIVE', CURRENT_TIMESTAMP)
      ON CONFLICT (team_id, member_id) 
      DO UPDATE SET role = EXCLUDED.role, status = 'ACTIVE', joined_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
      [teamId, memberId, role]
    );
    return res.rows[0];
  },

  async removeMember(teamId: string, memberId: string) {
    const res = await query(
      `
      DELETE FROM project_team_members
      WHERE team_id = $1 AND member_id = $2
      RETURNING *
    `,
      [teamId, memberId]
    );
    return res.rowCount && res.rowCount > 0;
  },

  async updateMemberRole(teamId: string, memberId: string, role: string) {
    const res = await query(
      `
      UPDATE project_team_members
      SET role = $3, updated_at = CURRENT_TIMESTAMP
      WHERE team_id = $1 AND member_id = $2
      RETURNING *
    `,
      [teamId, memberId, role]
    );
    return res.rows[0];
  },

  async getMyTeams(memberId: string): Promise<TeamItem[]> {
    const res = await query(
      `
      SELECT 
        t.*, 
        p.title as project_title, 
        ptm.role as current_student_role,
        (SELECT COUNT(*)::int FROM project_team_members WHERE team_id = t.id AND status = 'ACTIVE') as member_count
      FROM project_teams t
      JOIN project_team_members ptm ON t.id = ptm.team_id
      JOIN projects p ON t.project_id = p.id
      WHERE ptm.member_id = $1 AND ptm.status = 'ACTIVE'
      ORDER BY t.created_at DESC
    `,
      [memberId]
    );
    return res.rows;
  },

  async hasInterest(memberId: string, projectId: string) {
    const res = await query(
      `SELECT 1 FROM project_interests WHERE member_id = $1 AND project_id = $2`,
      [memberId, projectId]
    );
    return res.rowCount && res.rowCount > 0;
  },

  // Invitations
  async createInvitation(teamId: string, invitedMemberId: string, invitedBy: string): Promise<TeamInvitationItem> {
    const res = await query(
      `
      INSERT INTO team_invitations (team_id, invited_member_id, invited_by, status, created_at, expires_at)
      VALUES ($1, $2, $3, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '14 days')
      RETURNING *
    `,
      [teamId, invitedMemberId, invitedBy]
    );
    return res.rows[0];
  },

  async getInvitationById(id: string): Promise<TeamInvitationItem | null> {
    const res = await query(
      `
      SELECT 
        ti.*,
        t.name as team_name,
        t.project_id,
        p.title as project_title,
        m.full_name as inviter_name
      FROM team_invitations ti
      JOIN project_teams t ON ti.team_id = t.id
      JOIN projects p ON t.project_id = p.id
      JOIN members m ON ti.invited_by = m.id
      WHERE ti.id = $1
    `,
      [id]
    );
    return res.rows[0] || null;
  },

  async getTeamInvitations(teamId: string): Promise<TeamInvitationItem[]> {
    const res = await query(
      `
      SELECT 
        ti.*,
        m.full_name as invited_member_name,
        m.register_number as invited_register_number,
        m.department as invited_department,
        inv.full_name as inviter_name
      FROM team_invitations ti
      JOIN members m ON ti.invited_member_id = m.id
      JOIN members inv ON ti.invited_by = inv.id
      WHERE ti.team_id = $1
      ORDER BY ti.created_at DESC
    `,
      [teamId]
    );
    return res.rows;
  },

  async getMyInvitations(memberId: string): Promise<TeamInvitationItem[]> {
    const res = await query(
      `
      SELECT 
        ti.*,
        t.name as team_name,
        t.project_id,
        p.title as project_title,
        m.full_name as inviter_name
      FROM team_invitations ti
      JOIN project_teams t ON ti.team_id = t.id
      JOIN projects p ON t.project_id = p.id
      JOIN members m ON ti.invited_by = m.id
      WHERE ti.invited_member_id = $1 AND ti.status = 'PENDING'
      ORDER BY ti.created_at DESC
    `,
      [memberId]
    );
    return res.rows;
  },

  async updateInvitationStatus(id: string, status: string): Promise<TeamInvitationItem | null> {
    const res = await query(
      `
      UPDATE team_invitations
      SET status = $2, responded_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
      [id, status]
    );
    return res.rows[0] || null;
  },
};
