import { query, pool } from '../db';
import type { NotificationItem, NotificationPreferences, MemberActivityItem } from '../types/notifications';

export const notificationRepo = {
  create: async (data: {
    recipient_id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    priority?: string;
    expires_at?: any;
  }): Promise<NotificationItem> => {
    const res = await query(
      `INSERT INTO notifications (recipient_id, type, title, message, data, priority, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.recipient_id,
        data.type,
        data.title,
        data.message,
        JSON.stringify(data.data || {}),
        data.priority || 'NORMAL',
        data.expires_at || null,
      ]
    );
    return res.rows[0];
  },

  createBulk: async (
    notifications: Array<{
      recipient_id: string;
      type: string;
      title: string;
      message: string;
      data?: any;
      priority?: string;
    }>
  ) => {
    if (notifications.length === 0) return [];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const results: any[] = [];
      for (const n of notifications) {
        const res = await client.query(
          `INSERT INTO notifications (recipient_id, type, title, message, data, priority)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            n.recipient_id,
            n.type,
            n.title,
            n.message,
            JSON.stringify(n.data || {}),
            n.priority || 'NORMAL',
          ]
        );
        results.push(res.rows[0]);
      }
      await client.query('COMMIT');
      return results;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  findUserNotifications: async (
    memberId: string,
    params: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ) => {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = ['recipient_id = $1'];
    const values: any[] = [memberId];
    let idx = 2;

    if (params.unreadOnly) {
      conditions.push('read_at IS NULL');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countRes = await query(`SELECT COUNT(*) FROM notifications ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const unreadCountRes = await query(
      `SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND read_at IS NULL`,
      [memberId]
    );
    const unreadCount = parseInt(unreadCountRes.rows[0].count, 10);

    const listRes = await query(
      `SELECT * FROM notifications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    return {
      items: listRes.rows as NotificationItem[],
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  countUnread: async (memberId: string): Promise<number> => {
    const res = await query(
      `SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND read_at IS NULL`,
      [memberId]
    );
    return parseInt(res.rows[0]?.count || '0', 10);
  },

  findById: async (id: string): Promise<NotificationItem | null> => {
    const res = await query(`SELECT * FROM notifications WHERE id = $1`, [id]);
    return res.rows[0] || null;
  },

  markAsRead: async (id: string, memberId: string): Promise<NotificationItem | null> => {
    const res = await query(
      `UPDATE notifications
       SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
       WHERE id = $1 AND recipient_id = $2
       RETURNING *`,
      [id, memberId]
    );
    return res.rows[0] || null;
  },

  markAllAsRead: async (memberId: string): Promise<number> => {
    const res = await query(
      `UPDATE notifications
       SET read_at = CURRENT_TIMESTAMP
       WHERE recipient_id = $1 AND read_at IS NULL`,
      [memberId]
    );
    return res.rowCount || 0;
  },

  getPreferences: async (memberId: string): Promise<NotificationPreferences> => {
    const res = await query(
      `SELECT * FROM notification_preferences WHERE member_id = $1`,
      [memberId]
    );
    if (res.rows[0]) return res.rows[0];

    // Create default preferences row
    const insertRes = await query(
      `INSERT INTO notification_preferences (member_id)
       VALUES ($1)
       ON CONFLICT (member_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [memberId]
    );
    return insertRes.rows[0];
  },

  updatePreferences: async (
    memberId: string,
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    // Ensure exists
    await notificationRepo.getPreferences(memberId);

    const keys = Object.keys(prefs).filter((k) =>
      [
        'event_notifications',
        'project_notifications',
        'team_notifications',
        'course_notifications',
        'achievement_notifications',
        'system_notifications',
      ].includes(k)
    );

    if (keys.length === 0) {
      return await notificationRepo.getPreferences(memberId);
    }

    const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const vals = keys.map((k) => (prefs as any)[k]);

    const res = await query(
      `UPDATE notification_preferences
       SET ${sets}, updated_at = CURRENT_TIMESTAMP
       WHERE member_id = $1
       RETURNING *`,
      [memberId, ...vals]
    );
    return res.rows[0];
  },

  recordActivity: async (data: {
    member_id: string;
    activity_type: string;
    entity_type: string;
    entity_id?: string;
    metadata?: any;
  }): Promise<MemberActivityItem> => {
    const res = await query(
      `INSERT INTO member_activity (member_id, activity_type, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.member_id,
        data.activity_type,
        data.entity_type,
        data.entity_id || null,
        JSON.stringify(data.metadata || {}),
      ]
    );
    return res.rows[0];
  },

  getMemberActivity: async (memberId: string, limit = 15): Promise<MemberActivityItem[]> => {
    const res = await query(
      `SELECT * FROM member_activity
       WHERE member_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [memberId, limit]
    );
    return res.rows;
  },

  getAdminHistory: async (params: { page?: number; limit?: number } = {}) => {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const countRes = await query(`SELECT COUNT(*) FROM notifications`);
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await query(
      `SELECT n.*, m.full_name as recipient_name, m.college_email as recipient_email
       FROM notifications n
       JOIN members m ON m.id = n.recipient_id
       ORDER BY n.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const statsRes = await query(
      `SELECT
         COUNT(*) as total_sent,
         COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END) as total_read,
         COUNT(DISTINCT recipient_id) as unique_recipients
       FROM notifications`
    );

    return {
      items: res.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      stats: {
        totalSent: parseInt(statsRes.rows[0]?.total_sent || '0', 10),
        totalRead: parseInt(statsRes.rows[0]?.total_read || '0', 10),
        uniqueRecipients: parseInt(statsRes.rows[0]?.unique_recipients || '0', 10),
      },
    };
  },
};
