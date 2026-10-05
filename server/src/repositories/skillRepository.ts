import { pool, query } from '../db';

export interface SkillRow {
  id: string;
  name: string;
  category: string;
  proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  createdAt?: string;
}

export const skillRepository = {
  getAll: async (): Promise<SkillRow[]> => {
    const res = await query('SELECT id, name, category, created_at as "createdAt" FROM skills ORDER BY category ASC, name ASC');
    return res.rows;
  },

  getMemberSkills: async (memberId: string): Promise<SkillRow[]> => {
    const res = await query(`
      SELECT 
        s.id, 
        s.name, 
        s.category, 
        ms.proficiency,
        ms.created_at as "createdAt"
      FROM member_skills ms
      JOIN skills s ON s.id = ms.skill_id
      WHERE ms.member_id = $1
      ORDER BY s.name ASC
    `, [memberId]);
    return res.rows;
  },

  setMemberSkills: async (
    memberId: string,
    skills: Array<{ name: string; proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' } | string>
  ): Promise<SkillRow[]> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing member skills
      await client.query('DELETE FROM member_skills WHERE member_id = $1', [memberId]);

      const skillNames: string[] = [];

      for (const item of skills) {
        const name = (typeof item === 'string' ? item : item.name).trim();
        const proficiency = (typeof item === 'object' && item.proficiency) || 'INTERMEDIATE';
        if (!name) continue;

        skillNames.push(name);

        // Ensure skill exists in catalog
        const sRes = await client.query(
          `INSERT INTO skills (name, category) 
           VALUES ($1, 'General') 
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
           RETURNING id`,
          [name]
        );
        const skillId = sRes.rows[0].id;

        await client.query(
          `INSERT INTO member_skills (member_id, skill_id, proficiency) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (member_id, skill_id) DO UPDATE SET proficiency = EXCLUDED.proficiency`,
          [memberId, skillId, proficiency]
        );
      }

      // Sync members.skills TEXT[] column for fast text queries
      await client.query(
        'UPDATE members SET skills = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [skillNames, memberId]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return skillRepository.getMemberSkills(memberId);
  },
};
