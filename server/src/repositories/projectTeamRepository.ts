import { pool } from '../db';

export const projectTeamRepository = {
  async getTeamsByProject(projectId: string) {
    const res = await pool.query(`
      SELECT t.*,
             (SELECT COUNT(*) FROM project_team_members WHERE team_id = t.id) as member_count
      FROM project_teams t
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
    `, [projectId]);
    return res.rows;
  },

  async getTeamById(teamId: string) {
    const res = await pool.query(`
      SELECT t.*,
             (SELECT COUNT(*) FROM project_team_members WHERE team_id = t.id) as member_count
      FROM project_teams t
      WHERE t.id = $1
    `, [teamId]);
    return res.rows[0];
  },

  async getTeamMembers(teamId: string) {
    const res = await pool.query(`
      SELECT m.id as member_id, m.full_name, m.register_number, m.department, m.class_section, m.year, ptm.role, ptm.joined_at
      FROM project_team_members ptm
      JOIN members m ON ptm.member_id = m.id
      WHERE ptm.team_id = $1
      ORDER BY ptm.joined_at ASC
    `, [teamId]);
    return res.rows;
  },

  async createTeam(data: { projectId: string; name: string; description?: string; maxMembers?: number; createdBy: string; status: string }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const teamRes = await client.query(`
        INSERT INTO project_teams (project_id, name, description, max_members, created_by, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [data.projectId, data.name, data.description || null, data.maxMembers || null, data.createdBy, data.status]);
      
      const team = teamRes.rows[0];

      await client.query(`
        INSERT INTO project_team_members (team_id, member_id, role)
        VALUES ($1, $2, 'leader')
      `, [team.id, data.createdBy]);

      await client.query('COMMIT');
      return team;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async addMember(teamId: string, memberId: string, role: string = 'member') {
    const res = await pool.query(`
      INSERT INTO project_team_members (team_id, member_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (team_id, member_id) DO NOTHING
      RETURNING *
    `, [teamId, memberId, role]);
    return res.rowCount && res.rowCount > 0;
  },

  async removeMember(teamId: string, memberId: string) {
    const res = await pool.query(`
      DELETE FROM project_team_members
      WHERE team_id = $1 AND member_id = $2
    `, [teamId, memberId]);
    return res.rowCount && res.rowCount > 0;
  },

  async getMyTeams(memberId: string) {
    const res = await pool.query(`
      SELECT t.*, p.title as project_title, ptm.role,
             (SELECT COUNT(*) FROM project_team_members WHERE team_id = t.id) as member_count
      FROM project_teams t
      JOIN project_team_members ptm ON t.id = ptm.team_id
      JOIN projects p ON t.project_id = p.id
      WHERE ptm.member_id = $1
      ORDER BY t.created_at DESC
    `, [memberId]);
    return res.rows;
  },
  
  async hasInterest(memberId: string, projectId: string) {
    const res = await pool.query(`
      SELECT 1 FROM project_interests WHERE member_id = $1 AND project_id = $2
    `, [memberId, projectId]);
    return res.rowCount && res.rowCount > 0;
  }
};
