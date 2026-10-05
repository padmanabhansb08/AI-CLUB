import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { query, pool } from '../db';
import { authRepo } from '../repositories/authRepository';

export const authService = {
  register: async (data: any) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const hash = await bcrypt.hash(data.password, 10);
      const userRes = await client.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
        [data.email, hash, 'student']
      );
      const user = userRes.rows[0];

      await client.query(
        'INSERT INTO members (user_id, full_name, register_number, department, class_section, year, college_email, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [user.id, data.fullName, data.registerNumber, data.department, data.classSection, data.year, data.collegeEmail, data.phone]
      );
      
      await client.query('COMMIT');
      return user;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
  login: async (email: string, pass: string) => {
    const user = await authRepo.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(pass, user.password_hash);
    if (!valid) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN as any });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }
};