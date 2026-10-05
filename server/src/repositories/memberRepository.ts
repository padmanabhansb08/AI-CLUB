import { query } from '../db';

export const memberRepo = {
  // Public directory query with sanitized fields only
  findPublicMembers: async (
    search?: string,
    department?: string,
    skill?: string,
    page = 1,
    limit = 20
  ) => {
    let whereClause = "WHERE status = 'Active'";
    const params: any[] = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const pIdx = params.length;
      whereClause += ` AND (full_name ILIKE $${pIdx} OR register_number ILIKE $${pIdx} OR array_to_string(skills, ' ') ILIKE $${pIdx} OR array_to_string(technical_interests, ' ') ILIKE $${pIdx})`;
    }

    if (department && department.trim() && department !== 'All') {
      params.push(department.trim());
      whereClause += ` AND department = $${params.length}`;
    }

    if (skill && skill.trim()) {
      params.push(`%${skill.trim()}%`);
      whereClause += ` AND array_to_string(skills, ' ') ILIKE $${params.length}`;
    }

    const countRes = await query(`SELECT COUNT(*) as total FROM members ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].total, 10);

    params.push(limit);
    const limitIdx = params.length;
    params.push((page - 1) * limit);
    const offsetIdx = params.length;

    const sql = `
      SELECT 
        id,
        full_name as "fullName",
        register_number as "registerNumber",
        department,
        class_section as "classSection",
        year,
        bio,
        profile_photo_url as "profilePhotoUrl",
        github_url as "githubUrl",
        linkedin_url as "linkedinUrl",
        portfolio_url as "portfolioUrl",
        skills,
        technical_interests as "technicalInterests",
        joined_at as "joinedAt",
        status
      FROM members
      ${whereClause}
      ORDER BY full_name ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const res = await query(sql, params);
    return { items: res.rows, total, page, limit };
  },

  // Public single member by id
  findPublicById: async (id: string) => {
    const sql = `
      SELECT 
        id,
        full_name as "fullName",
        register_number as "registerNumber",
        department,
        class_section as "classSection",
        year,
        bio,
        profile_photo_url as "profilePhotoUrl",
        github_url as "githubUrl",
        linkedin_url as "linkedinUrl",
        portfolio_url as "portfolioUrl",
        skills,
        technical_interests as "technicalInterests",
        joined_at as "joinedAt",
        status
      FROM members
      WHERE id = $1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  // Admin query
  findAll: async (search?: string, department?: string, page = 1, limit = 20) => {
    let sql = 'SELECT * FROM members WHERE 1=1';
    const params: any[] = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const pIdx = params.length;
      sql += ` AND (full_name ILIKE $${pIdx} OR register_number ILIKE $${pIdx})`;
    }

    if (department && department.trim() && department !== 'All') {
      params.push(department.trim());
      sql += ` AND department = $${params.length}`;
    }

    const countRes = await query(sql.replace('*', 'COUNT(*) as total'), params);
    const total = parseInt(countRes.rows[0].total, 10);

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
    return res.rows[0] || null;
  },

  findByUserId: async (userId: string) => {
    const res = await query('SELECT * FROM members WHERE user_id = $1', [userId]);
    return res.rows[0] || null;
  },
};