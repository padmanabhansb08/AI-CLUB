import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { pool } from '../db';
import { authRepo } from '../repositories/authRepository';
import { UnauthorizedError, ConflictError, NotFoundError } from '../errors/AppError';

export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
  registerNumber: string;
  department: string;
  classSection: string;
  year: number;
  collegeEmail?: string;
  phone?: string;
}

export const authService = {
  register: async (data: RegisterDTO) => {
    // 1. Check existing email
    const existingUser = await authRepo.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists');
    }

    const collegeEmail = data.collegeEmail || data.email;

    // 2. Check existing register number or college email
    const existingMember = await pool.query(
      'SELECT id FROM members WHERE register_number = $1 OR college_email = $2',
      [data.registerNumber, collegeEmail]
    );
    if (existingMember.rowCount && existingMember.rowCount > 0) {
      throw new ConflictError('A member profile with this register number or college email already exists');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const hash = await bcrypt.hash(data.password, 10);
      const userRes = await client.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at as "createdAt"',
        [data.email, hash, 'student']
      );
      const user = userRes.rows[0];

      const memRes = await client.query(
        `INSERT INTO members (
          user_id, full_name, register_number, department, class_section, year, college_email, phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, full_name as "fullName", register_number as "registerNumber", department, class_section as "classSection", year, college_email as "collegeEmail", phone, status`,
        [user.id, data.fullName, data.registerNumber, data.department, data.classSection, data.year, collegeEmail, data.phone || null]
      );
      const member = memRes.rows[0];

      await client.query('COMMIT');

      const token = jwt.sign(
        { userId: user.id, role: user.role, sessionVersion: 0 },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN as any }
      );

      return {
        token,
        user: {
          id: user.id,
          userId: user.id,
          email: user.email,
          role: user.role,
          memberId: member.id,
          fullName: member.fullName,
          registerNumber: member.registerNumber,
          department: member.department,
          classSection: member.classSection,
          year: member.year,
          collegeEmail: member.collegeEmail,
          phone: member.phone,
          status: member.status,
        },
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  login: async (email: string, pass: string) => {
    const user = await authRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await bcrypt.compare(pass, user.password_hash);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, sessionVersion: user.session_version || 0 },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN as any }
    );

    // Fetch member details if student
    let memberData: any = {};
    if (user.role === 'student') {
      const memRes = await pool.query(
        `SELECT id, full_name as "fullName", register_number as "registerNumber", 
                department, class_section as "classSection", year, college_email as "collegeEmail", 
                phone, status, bio, skills, technical_interests as "technicalInterests"
         FROM members WHERE user_id = $1`,
        [user.id]
      );
      if (memRes.rowCount && memRes.rowCount > 0) {
        memberData = memRes.rows[0];
      }
    }

    return {
      token,
      user: {
        ...memberData,
        memberId: memberData.id,
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role,
      },
    };
  },

  getMe: async (userId: string) => {
    const user = await authRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let memberData: any = {};
    if (user.role === 'student') {
      const memRes = await pool.query(
        `SELECT id, full_name as "fullName", register_number as "registerNumber", 
                department, class_section as "classSection", year, college_email as "collegeEmail", 
                phone, status, bio, skills, technical_interests as "technicalInterests"
         FROM members WHERE user_id = $1`,
        [user.id]
      );
      if (memRes.rowCount && memRes.rowCount > 0) {
        memberData = memRes.rows[0];
      }
    }

    return {
      ...memberData,
      memberId: memberData.id,
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  },
};
