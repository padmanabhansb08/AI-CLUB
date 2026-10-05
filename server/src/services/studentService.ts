import { pool } from '../db';
import { ApiError } from '../middleware/errorHandler';

function calculateCompletion(member: any) {
  let required = 0;
  let requiredTotal = 7; // name, reg_no, dept, class, year, email, phone
  
  if (member.fullName) required++;
  if (member.registerNumber) required++;
  if (member.department) required++;
  if (member.classSection) required++;
  if (member.year) required++;
  if (member.collegeEmail) required++;
  if (member.phone) required++;

  let optional = 0;
  let optionalTotal = 5; // bio, github, linkedin, skills, interests (portfolio merged into linkedin basically or +1)
  optionalTotal = 6; // bio, github, linkedin, portfolio, skills, interests

  if (member.bio) optional++;
  if (member.githubUrl) optional++;
  if (member.linkedinUrl) optional++;
  if (member.portfolioUrl) optional++;
  if (member.skills && member.skills.length > 0) optional++;
  if (member.technicalInterests && member.technicalInterests.length > 0) optional++;

  const totalFields = requiredTotal + optionalTotal;
  const completedFields = required + optional;

  return Math.round((completedFields / totalFields) * 100);
}

export const studentService = {
  getProfile: async (userId: string) => {
    const res = await pool.query(`
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
        m.github_url as "githubUrl", 
        m.linkedin_url as "linkedinUrl", 
        m.portfolio_url as "portfolioUrl", 
        m.technical_interests as "technicalInterests", 
        m.skills,
        m.created_at as "createdAt",
        m.updated_at as "updatedAt"
      FROM members m
      WHERE m.user_id = $1
    `, [userId]);

    if (res.rowCount === 0) {
      throw new ApiError('NOT_FOUND', 'Member profile not found');
    }

    const member = res.rows[0];
    member.profileCompletion = calculateCompletion(member);
    return member;
  },

  updateProfile: async (userId: string, data: any) => {
    const fields = [];
    const values = [];
    let i = 1;
    
    // We only map allowed fields
    const allowed = [
      { key: 'fullName', col: 'full_name' },
      { key: 'department', col: 'department' },
      { key: 'classSection', col: 'class_section' },
      { key: 'year', col: 'year' },
      { key: 'phone', col: 'phone' },
      { key: 'bio', col: 'bio' },
      { key: 'githubUrl', col: 'github_url' },
      { key: 'linkedinUrl', col: 'linkedin_url' },
      { key: 'portfolioUrl', col: 'portfolio_url' },
      { key: 'skills', col: 'skills' },
      { key: 'technicalInterests', col: 'technical_interests' }
    ];

    for (const field of allowed) {
      if (data[field.key] !== undefined) {
        fields.push(`${field.col} = $${i}`);
        values.push(data[field.key]);
        i++;
      }
    }

    if (fields.length === 0) {
      return studentService.getProfile(userId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(userId);
    const query = `
      UPDATE members
      SET ${fields.join(', ')}
      WHERE user_id = $${i}
      RETURNING *
    `;

    const res = await pool.query(query, values);
    
    if (res.rowCount === 0) {
      throw new ApiError('NOT_FOUND', 'Member profile not found');
    }

    return studentService.getProfile(userId);
  }
};
