import { pool, query } from '../db';
import { NotFoundError } from '../errors/AppError';
import { calculateProfileCompletion, ProfileCompletionResult } from '../utils/profileCompletion';
import { skillRepository, SkillRow } from '../repositories/skillRepository';
import { interestRepository, InterestRow } from '../repositories/interestRepository';

export interface StudentProfileData {
  id: string;
  userId: string;
  fullName: string;
  registerNumber: string;
  department: string;
  classSection: string;
  year: number;
  collegeEmail: string;
  phone?: string;
  bio?: string;
  profilePhotoUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  normalizedSkills?: SkillRow[];
  technicalInterests: string[];
  normalizedInterests?: InterestRow[];
  status: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  profileCompletion: ProfileCompletionResult;
  member?: any;
}

export const studentService = {
  getMemberByUserId: async (userId: string) => {
    const res = await query('SELECT * FROM members WHERE user_id = $1', [userId]);
    if (res.rowCount === 0) {
      throw new NotFoundError('Student member profile not found');
    }
    return res.rows[0];
  },

  getProfile: async (userId: string): Promise<StudentProfileData> => {
    const res = await query(`
      SELECT 
        m.id, 
        m.user_id as "userId", 
        m.full_name as "fullName", 
        m.register_number as "registerNumber", 
        m.department, 
        m.class_section as "classSection", 
        m.year, 
        m.college_email as "collegeEmail", 
        m.phone, 
        m.bio, 
        m.profile_photo_url as "profilePhotoUrl",
        m.github_url as "githubUrl", 
        m.linkedin_url as "linkedinUrl", 
        m.portfolio_url as "portfolioUrl", 
        m.technical_interests as "technicalInterests", 
        m.skills,
        m.status,
        m.joined_at as "joinedAt",
        m.created_at as "createdAt",
        m.updated_at as "updatedAt"
      FROM members m
      WHERE m.user_id = $1
    `, [userId]);

    if (res.rowCount === 0) {
      throw new NotFoundError('Member profile not found');
    }

    const member = res.rows[0];
    const memberId = member.id;

    // Fetch normalized skills & interests in parallel
    const [normalizedSkills, normalizedInterests] = await Promise.all([
      skillRepository.getMemberSkills(memberId),
      interestRepository.getMemberInterests(memberId),
    ]);

    member.normalizedSkills = normalizedSkills;
    member.normalizedInterests = normalizedInterests;

    // Use normalized names if available, or fall back to array
    if (normalizedSkills.length > 0) {
      member.skills = normalizedSkills.map(s => s.name);
    } else {
      member.skills = member.skills || [];
    }

    if (normalizedInterests.length > 0) {
      member.technicalInterests = normalizedInterests.map(i => i.name);
    } else {
      member.technicalInterests = member.technicalInterests || [];
    }

    const completion = calculateProfileCompletion(member);

    return {
      ...member,
      profileCompletion: completion,
      member: {
        ...member,
        profileCompletion: completion.percentage,
      },
    };
  },

  updateProfile: async (userId: string, data: any): Promise<StudentProfileData> => {
    const member = await studentService.getMemberByUserId(userId);
    const memberId = member.id;

    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    const allowed = [
      { key: 'fullName', col: 'full_name' },
      { key: 'department', col: 'department' },
      { key: 'classSection', col: 'class_section' },
      { key: 'year', col: 'year' },
      { key: 'phone', col: 'phone' },
      { key: 'bio', col: 'bio' },
      { key: 'profilePhotoUrl', col: 'profile_photo_url' },
      { key: 'githubUrl', col: 'github_url' },
      { key: 'linkedinUrl', col: 'linkedin_url' },
      { key: 'portfolioUrl', col: 'portfolio_url' },
    ];

    for (const field of allowed) {
      if (data[field.key] !== undefined) {
        fields.push(`${field.col} = $${i}`);
        values.push(data[field.key]);
        i++;
      }
    }

    // Update skills if provided
    if (data.skills !== undefined && Array.isArray(data.skills)) {
      await skillRepository.setMemberSkills(memberId, data.skills);
    }

    // Update technical interests if provided
    const interestsList = data.interests || data.technicalInterests;
    if (interestsList !== undefined && Array.isArray(interestsList)) {
      await interestRepository.setMemberInterests(memberId, interestsList);
    }

    if (fields.length > 0) {
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);
      const queryText = `
        UPDATE members
        SET ${fields.join(', ')}
        WHERE user_id = $${i}
      `;
      await pool.query(queryText, values);
    }

    return studentService.getProfile(userId);
  },

  getSkills: async (userId: string): Promise<SkillRow[]> => {
    const member = await studentService.getMemberByUserId(userId);
    return skillRepository.getMemberSkills(member.id);
  },

  updateSkills: async (userId: string, skills: any[]): Promise<SkillRow[]> => {
    const member = await studentService.getMemberByUserId(userId);
    return skillRepository.setMemberSkills(member.id, skills);
  },

  getInterests: async (userId: string): Promise<InterestRow[]> => {
    const member = await studentService.getMemberByUserId(userId);
    return interestRepository.getMemberInterests(member.id);
  },

  updateInterests: async (userId: string, interests: any[]): Promise<InterestRow[]> => {
    const member = await studentService.getMemberByUserId(userId);
    return interestRepository.setMemberInterests(member.id, interests);
  },
};
