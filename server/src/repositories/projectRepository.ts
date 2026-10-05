import { query } from '../db';
export const projectRepo = {
  findAll: async (page = 1, limit = 20) => {
    const res = await query(`
      SELECT p.*, COUNT(pi.member_id) as interested_count 
      FROM projects p 
      LEFT JOIN project_interests pi ON p.id = pi.project_id 
      GROUP BY p.id 
      LIMIT $1 OFFSET $2
    `, [limit, (page - 1) * limit]);
    const count = await query('SELECT COUNT(*) FROM projects');
    return { items: res.rows, total: parseInt(count.rows[0].count), page, limit };
  },
  findById: async (id: string) => {
    const res = await query('SELECT * FROM projects WHERE id = $1', [id]);
    return res.rows[0];
  },
  create: async (data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const res = await query(`INSERT INTO projects (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`, vals);
    return res.rows[0];
  },
  update: async (id: string, data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    vals.push(id);
    const res = await query(`UPDATE projects SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = $${vals.length} RETURNING *`, vals);
    return res.rows[0];
  },
  delete: async (id: string) => {
    await query('DELETE FROM projects WHERE id = $1', [id]);
  },
  addInterest: async (userId: string, projectId: string) => {
    await query(`
      INSERT INTO project_interests (member_id, project_id) 
      SELECT id, $2 FROM members WHERE user_id = $1
      ON CONFLICT DO NOTHING
    `, [userId, projectId]);
  },
  removeInterest: async (userId: string, projectId: string) => {
    await query(`
      DELETE FROM project_interests 
      WHERE member_id = (SELECT id FROM members WHERE user_id = $1) AND project_id = $2
    `, [userId, projectId]);
  }
};