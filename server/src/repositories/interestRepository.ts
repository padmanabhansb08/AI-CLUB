import { pool, query } from '../db';

export interface InterestRow {
  id: string;
  name: string;
  category: string;
  createdAt?: string;
}

export const interestRepository = {
  getAll: async (): Promise<InterestRow[]> => {
    const res = await query('SELECT id, name, category, created_at as "createdAt" FROM interests ORDER BY category ASC, name ASC');
    return res.rows;
  },

  getMemberInterests: async (memberId: string): Promise<InterestRow[]> => {
    const res = await query(`
      SELECT 
        i.id, 
        i.name, 
        i.category, 
        mi.created_at as "createdAt"
      FROM member_interests mi
      JOIN interests i ON i.id = mi.interest_id
      WHERE mi.member_id = $1
      ORDER BY i.name ASC
    `, [memberId]);
    return res.rows;
  },

  setMemberInterests: async (
    memberId: string,
    interests: Array<{ name: string } | string>
  ): Promise<InterestRow[]> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing member interests
      await client.query('DELETE FROM member_interests WHERE member_id = $1', [memberId]);

      const interestNames: string[] = [];

      for (const item of interests) {
        const name = (typeof item === 'string' ? item : item.name).trim();
        if (!name) continue;

        interestNames.push(name);

        // Ensure interest exists in catalog
        const iRes = await client.query(
          `INSERT INTO interests (name, category) 
           VALUES ($1, 'Technical') 
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
           RETURNING id`,
          [name]
        );
        const interestId = iRes.rows[0].id;

        await client.query(
          `INSERT INTO member_interests (member_id, interest_id) 
           VALUES ($1, $2) 
           ON CONFLICT (member_id, interest_id) DO NOTHING`,
          [memberId, interestId]
        );
      }

      // Sync members.technical_interests TEXT[] column
      await client.query(
        'UPDATE members SET technical_interests = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [interestNames, memberId]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return interestRepository.getMemberInterests(memberId);
  },
};
