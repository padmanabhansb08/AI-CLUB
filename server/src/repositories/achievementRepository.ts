import { query } from '../db';
export const achievementRepo = {
  findAll: async (page = 1, limit = 20) => {
    const res = await query(`SELECT * FROM achievements LIMIT $1 OFFSET $2`, [limit, (page - 1) * limit]);
    const count = await query('SELECT COUNT(*) FROM achievements');
    return { items: res.rows, total: parseInt(count.rows[0].count), page, limit };
  },
  findById: async (id: string) => {
    const res = await query('SELECT * FROM achievements WHERE id = $1', [id]);
    return res.rows[0];
  },
  create: async (data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const res = await query(`INSERT INTO achievements (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`, vals);
    return res.rows[0];
  },
  update: async (id: string, data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    vals.push(id);
    const res = await query(`UPDATE achievements SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = $${vals.length} RETURNING *`, vals);
    return res.rows[0];
  },
  delete: async (id: string) => {
    await query('DELETE FROM achievements WHERE id = $1', [id]);
  }
};