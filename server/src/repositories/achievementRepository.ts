import { query, pool } from '../db';
import type { AchievementItem, MemberAchievementItem } from '../types/achievements';

export const achievementRepo = {
  // Legacy & discovery
  findAll: async (page = 1, limit = 20, filters: { category?: string; search?: string; is_active?: boolean } = {}) => {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (filters.category && filters.category !== 'All' && filters.category !== 'ALL') {
      conditions.push(`category = $${idx++}`);
      values.push(filters.category);
    }

    if (filters.search) {
      conditions.push(`(name ILIKE $${idx} OR title ILIKE $${idx} OR description ILIKE $${idx})`);
      values.push(`%${filters.search}%`);
      idx++;
    }

    if (filters.is_active !== undefined) {
      conditions.push(`is_active = $${idx++}`);
      values.push(filters.is_active);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const countRes = await query(`SELECT COUNT(*) FROM achievements ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const listQuery = `
      SELECT *, COALESCE(name, title) as name, COALESCE(title, name) as title
      FROM achievements
      ${whereClause}
      ORDER BY points DESC, created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    const res = await query(listQuery, [...values, limit, offset]);

    return { items: res.rows as AchievementItem[], total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  },

  findById: async (id: string): Promise<AchievementItem | null> => {
    const res = await query(
      `SELECT *, COALESCE(name, title) as name, COALESCE(title, name) as title
       FROM achievements
       WHERE id::text = $1 OR slug = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  findBySlug: async (slug: string): Promise<AchievementItem | null> => {
    const res = await query(
      `SELECT *, COALESCE(name, title) as name, COALESCE(title, name) as title
       FROM achievements
       WHERE slug = $1`,
      [slug]
    );
    return res.rows[0] || null;
  },

  create: async (data: any): Promise<AchievementItem> => {
    const name = data.name || data.title || 'Untitled Achievement';
    const title = data.title || data.name || 'Untitled Achievement';
    const slug = data.slug || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const cleanedData = {
      ...data,
      name,
      title,
      slug,
      points: data.points !== undefined ? data.points : 10,
      is_active: data.is_active !== undefined ? data.is_active : true,
      criteria_type: data.criteria_type || 'SPECIAL',
      criteria_config: typeof data.criteria_config === 'string' ? data.criteria_config : JSON.stringify(data.criteria_config || { target: 1 }),
      icon: data.icon || 'Award',
      category: data.category || 'SPECIAL',
    };

    const keys = Object.keys(cleanedData);
    const vals = Object.values(cleanedData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const res = await query(
      `INSERT INTO achievements (${keys.join(', ')})
       VALUES (${placeholders})
       RETURNING *, COALESCE(name, title) as name, COALESCE(title, name) as title`,
      vals
    );
    return res.rows[0];
  },

  update: async (id: string, data: any): Promise<AchievementItem> => {
    if (data.name && !data.title) data.title = data.name;
    if (data.title && !data.name) data.name = data.title;
    if (data.criteria_config && typeof data.criteria_config !== 'string') {
      data.criteria_config = JSON.stringify(data.criteria_config);
    }

    const keys = Object.keys(data);
    const vals = Object.values(data);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    vals.push(id);
    const res = await query(
      `UPDATE achievements
       SET ${sets}, updated_at = CURRENT_TIMESTAMP
       WHERE id::text = $${vals.length} OR slug = $${vals.length}
       RETURNING *, COALESCE(name, title) as name, COALESCE(title, name) as title`,
      vals
    );
    return res.rows[0];
  },

  setActiveStatus: async (id: string, isActive: boolean): Promise<AchievementItem> => {
    const res = await query(
      `UPDATE achievements
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id::text = $2 OR slug = $2
       RETURNING *, COALESCE(name, title) as name, COALESCE(title, name) as title`,
      [isActive, id]
    );
    return res.rows[0];
  },

  delete: async (id: string): Promise<boolean> => {
    const res = await query('DELETE FROM achievements WHERE id::text = $1 OR slug = $1', [id]);
    return (res.rowCount || 0) > 0;
  },

  // Member Achievements (Unlocked)
  getMemberAchievements: async (memberId: string): Promise<MemberAchievementItem[]> => {
    const res = await query(
      `SELECT ma.id, ma.member_id, ma.achievement_id, ma.earned_at, ma.metadata,
              a.id as "ach_id", COALESCE(a.name, a.title) as "ach_name", a.slug as "ach_slug",
              a.description as "ach_description", a.icon as "ach_icon", a.category as "ach_category",
              a.points as "ach_points", a.criteria_type as "ach_criteria_type", a.criteria_config as "ach_criteria_config"
       FROM member_achievements ma
       JOIN achievements a ON a.id = ma.achievement_id
       WHERE ma.member_id = $1
       ORDER BY ma.earned_at DESC`,
      [memberId]
    );

    return res.rows.map((row) => ({
      id: row.id,
      member_id: row.member_id,
      achievement_id: row.achievement_id,
      earned_at: row.earned_at,
      metadata: row.metadata,
      achievement: {
        id: row.ach_id,
        name: row.ach_name,
        title: row.ach_name,
        slug: row.ach_slug,
        description: row.ach_description,
        icon: row.ach_icon,
        category: row.ach_category,
        points: row.ach_points,
        criteria_type: row.ach_criteria_type,
        criteria_config: row.ach_criteria_config,
        is_active: true,
        created_at: '',
        updated_at: '',
        earned: true,
        earned_at: row.earned_at,
      },
    }));
  },

  getMemberAchievement: async (memberId: string, achievementId: string): Promise<MemberAchievementItem | null> => {
    const res = await query(
      `SELECT * FROM member_achievements
       WHERE member_id = $1 AND achievement_id = $2`,
      [memberId, achievementId]
    );
    return res.rows[0] || null;
  },

  awardAchievementTransactional: async (memberId: string, achievementId: string, metadata: any = {}) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertRes = await client.query(
        `INSERT INTO member_achievements (member_id, achievement_id, earned_at, metadata)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
         ON CONFLICT (member_id, achievement_id) DO NOTHING
         RETURNING *`,
        [memberId, achievementId, JSON.stringify(metadata)]
      );

      let newlyAwarded = false;
      let record = insertRes.rows[0];

      if (insertRes.rowCount && insertRes.rowCount > 0) {
        newlyAwarded = true;
        // Also record in member_activity
        await client.query(
          `INSERT INTO member_activity (member_id, activity_type, entity_type, entity_id, metadata)
           VALUES ($1, 'ACHIEVEMENT_EARNED', 'ACHIEVEMENT', $2, $3)`,
          [memberId, achievementId, JSON.stringify(metadata)]
        );
      } else {
        const existing = await client.query(
          `SELECT * FROM member_achievements WHERE member_id = $1 AND achievement_id = $2`,
          [memberId, achievementId]
        );
        record = existing.rows[0];
      }

      await client.query('COMMIT');
      return { record, newlyAwarded };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Member Aggregate Stats
  getMemberStats: async (memberId: string) => {
    const res = await query(
      `SELECT
         COUNT(ma.id) as total_earned,
         COALESCE(SUM(a.points), 0) as total_points
       FROM member_achievements ma
       JOIN achievements a ON a.id = ma.achievement_id
       WHERE ma.member_id = $1`,
      [memberId]
    );

    const totalEarned = parseInt(res.rows[0]?.total_earned || '0', 10);
    const totalPoints = parseInt(res.rows[0]?.total_points || '0', 10);

    const activeCountRes = await query(`SELECT COUNT(*) FROM achievements WHERE is_active = true`);
    const totalActiveAchievements = parseInt(activeCountRes.rows[0]?.count || '0', 10);
    const inProgressCount = Math.max(0, totalActiveAchievements - totalEarned);

    return {
      totalEarned,
      totalPoints,
      totalActiveAchievements,
      inProgressCount,
    };
  },

  // Admin Single Achievement Stats
  getAchievementStats: async (achievementId: string) => {
    const res = await query(
      `SELECT
         COUNT(ma.id) as total_earned,
         COUNT(DISTINCT ma.member_id) as unique_members
       FROM member_achievements ma
       WHERE ma.achievement_id = $1`,
      [achievementId]
    );

    const recentRes = await query(
      `SELECT ma.earned_at, m.id as member_id, m.full_name, m.profile_photo_url, m.department
       FROM member_achievements ma
       JOIN members m ON m.id = ma.member_id
       WHERE ma.achievement_id = $1
       ORDER BY ma.earned_at DESC
       LIMIT 10`,
      [achievementId]
    );

    return {
      totalEarned: parseInt(res.rows[0]?.total_earned || '0', 10),
      uniqueMembers: parseInt(res.rows[0]?.unique_members || '0', 10),
      recentAwards: recentRes.rows,
    };
  },

  // Admin Global Achievement Stats
  getGlobalStats: async () => {
    const totalAwardsRes = await query(`SELECT COUNT(*) FROM member_achievements`);
    const uniqueStudentsRes = await query(`SELECT COUNT(DISTINCT member_id) FROM member_achievements`);
    const totalPointsRes = await query(
      `SELECT COALESCE(SUM(a.points), 0) as total_points
       FROM member_achievements ma
       JOIN achievements a ON a.id = ma.achievement_id`
    );

    const topAchievementsRes = await query(
      `SELECT a.id, COALESCE(a.name, a.title) as name, a.icon, a.category, a.points, COUNT(ma.id) as count
       FROM achievements a
       LEFT JOIN member_achievements ma ON ma.achievement_id = a.id
       GROUP BY a.id
       ORDER BY count DESC
       LIMIT 5`
    );

    return {
      totalAwards: parseInt(totalAwardsRes.rows[0]?.count || '0', 10),
      uniqueStudents: parseInt(uniqueStudentsRes.rows[0]?.count || '0', 10),
      totalPointsAwarded: parseInt(totalPointsRes.rows[0]?.total_points || '0', 10),
      mostEarned: topAchievementsRes.rows,
    };
  },
};