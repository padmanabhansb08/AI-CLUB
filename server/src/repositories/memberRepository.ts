import { query } from '../db';

export const memberRepo = {
  findAll: async (search?: string, department?: string, page = 1, limit = 20) => {
    let sql = 'SELECT * FROM members WHERE 1=1';
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (full_name ILIKE $${params.length} OR register_number ILIKE $${params.length})`;
    }

    if (department) {
      params.push(department);
      sql += ` AND department = $${params.length}`;
    }

    const countRes = await query(sql.replace('*', 'COUNT(*) as total'), params);
    const total = parseInt(countRes.rows[0].total, 10);

    // Safely parameterize LIMIT and OFFSET to avoid SQL injection
    params.push(limit);
    const limitParamIdx = params.length;

    params.push((page - 1) * limit);
    const offsetParamIdx = params.length;

    sql += ` ORDER BY joined_at DESC LIMIT $${limitParamIdx} OFFSET $${offsetParamIdx}`;

    const res = await query(sql, params);
    return { items: res.rows, total, page, limit };
  },

  findById: async (id: string) => {
    const res = await query('SELECT * FROM members WHERE id = $1', [id]);
    return res.rows[0];
  },
};