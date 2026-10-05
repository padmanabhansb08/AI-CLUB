import { pool } from '../db';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  status: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  read?: boolean; // For member specific response
}

function mapRow(row: any): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    priority: row.priority,
    status: row.status,
    publishedAt: row.published_at,
    expiresAt: row.expires_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    read: row.read === true
  };
}

export const announcementRepository = {
  async getVisibleAnnouncements(memberId: string | null, limit: number = 20, offset: number = 0) {
    const query = `
      SELECT 
        a.*,
        ${memberId ? 'EXISTS(SELECT 1 FROM announcement_reads ar WHERE ar.announcement_id = a.id AND ar.member_id = $1)' : 'false'} as read
      FROM announcements a
      WHERE a.status = 'published'
        AND (a.published_at IS NULL OR a.published_at <= NOW())
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
      ORDER BY 
        CASE WHEN a.priority = 'urgent' THEN 1 WHEN a.priority = 'important' THEN 2 ELSE 3 END,
        a.published_at DESC NULLS LAST, 
        a.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const params = memberId ? [memberId, limit, offset] : [limit, offset];
    // If memberId is null, adjust parameters
    const actualQuery = memberId ? query : query.replace('$1', 'NULL').replace('$2', '$1').replace('$3', '$2');
    
    const countQuery = `
      SELECT count(*) 
      FROM announcements a
      WHERE a.status = 'published'
        AND (a.published_at IS NULL OR a.published_at <= NOW())
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
    `;
    
    const [res, countRes] = await Promise.all([
      pool.query(actualQuery, params),
      pool.query(countQuery)
    ]);
    
    return {
      data: res.rows.map(mapRow),
      total: parseInt(countRes.rows[0].count)
    };
  },
  
  async getUnreadCount(memberId: string) {
    const query = `
      SELECT count(*) 
      FROM announcements a
      WHERE a.status = 'published'
        AND (a.published_at IS NULL OR a.published_at <= NOW())
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
        AND NOT EXISTS (
          SELECT 1 FROM announcement_reads ar 
          WHERE ar.announcement_id = a.id AND ar.member_id = $1
        )
    `;
    const res = await pool.query(query, [memberId]);
    return parseInt(res.rows[0].count);
  },
  
  async markAsRead(announcementId: string, memberId: string) {
    const query = `
      INSERT INTO announcement_reads (announcement_id, member_id)
      VALUES ($1, $2)
      ON CONFLICT (announcement_id, member_id) DO NOTHING
    `;
    await pool.query(query, [announcementId, memberId]);
  },
  
  async getById(id: string, memberId: string | null = null) {
    const query = `
      SELECT 
        a.*,
        ${memberId ? 'EXISTS(SELECT 1 FROM announcement_reads ar WHERE ar.announcement_id = a.id AND ar.member_id = $2)' : 'false'} as read
      FROM announcements a
      WHERE a.id = $1
    `;
    const params = memberId ? [id, memberId] : [id];
    const actualQuery = memberId ? query : query.replace('$2', 'NULL');
    const res = await pool.query(actualQuery, params);
    if (res.rowCount === 0) return null;
    return mapRow(res.rows[0]);
  },
  
  async getAllAdmin() {
    const res = await pool.query(`SELECT * FROM announcements ORDER BY created_at DESC`);
    return res.rows.map(mapRow);
  },
  
  async create(data: Partial<Announcement>, userId: string) {
    const query = `
      INSERT INTO announcements (title, body, category, priority, status, published_at, expires_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const res = await pool.query(query, [
      data.title, data.body, data.category, data.priority || 'normal', 
      data.status || 'draft', data.publishedAt || null, data.expiresAt || null, userId
    ]);
    return mapRow(res.rows[0]);
  },
  
  async update(id: string, data: Partial<Announcement>) {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    
    if (data.title !== undefined) { updates.push(`title = $${idx++}`); values.push(data.title); }
    if (data.body !== undefined) { updates.push(`body = $${idx++}`); values.push(data.body); }
    if (data.category !== undefined) { updates.push(`category = $${idx++}`); values.push(data.category); }
    if (data.priority !== undefined) { updates.push(`priority = $${idx++}`); values.push(data.priority); }
    if (data.status !== undefined) { updates.push(`status = $${idx++}`); values.push(data.status); }
    if (data.publishedAt !== undefined) { updates.push(`published_at = $${idx++}`); values.push(data.publishedAt); }
    if (data.expiresAt !== undefined) { updates.push(`expires_at = $${idx++}`); values.push(data.expiresAt); }
    
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE announcements
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    
    const res = await pool.query(query, values);
    if (res.rowCount === 0) return null;
    return mapRow(res.rows[0]);
  },
  
  async delete(id: string) {
    const res = await pool.query(`DELETE FROM announcements WHERE id = $1 RETURNING id`, [id]);
    return (res.rowCount ?? 0) > 0;
  }
};
