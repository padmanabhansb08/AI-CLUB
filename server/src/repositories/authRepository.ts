import { query } from '../db';
export const authRepo = {
  findByEmail: async (email: string) => {
    const res = await query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  },
  findById: async (id: string) => {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }
};