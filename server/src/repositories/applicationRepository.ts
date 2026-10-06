import { pool, query } from '../db';

export interface MembershipApplicationRow {
  id: string;
  user_id: string;
  member_id: string | null;
  application_number: string;
  status:
    | 'DRAFT'
    | 'TEST_REQUIRED'
    | 'TEST_IN_PROGRESS'
    | 'TEST_COMPLETED'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'WAITLISTED'
    | 'REJECTED'
    | 'WITHDRAWN';
  test_attempt_id: string | null;
  final_score: number | null;
  score_percentage: number | null;
  passed: boolean | null;
  submitted_at: Date | null;
  reviewed_at: Date | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  rejection_reason: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  fullName?: string;
  email?: string;
  registerNumber?: string;
  department?: string;
  year?: number;
  classSection?: string;
  phone?: string;
  skills?: string[];
  technicalInterests?: string[];
  memberNumber?: string;
}

export const applicationRepo = {
  // 1. Create a new membership application
  create: async (data: {
    userId: string;
    memberId?: string | null;
    applicationNumber: string;
    status?: string;
  }): Promise<MembershipApplicationRow> => {
    const res = await query(
      `INSERT INTO membership_applications (
        user_id, member_id, application_number, status
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        data.userId,
        data.memberId || null,
        data.applicationNumber,
        data.status || 'TEST_REQUIRED',
      ]
    );
    return res.rows[0];
  },

  // 2. Find active application by user ID with member info
  findByUserId: async (userId: string): Promise<MembershipApplicationRow | null> => {
    const res = await query(
      `SELECT 
        a.*,
        m.full_name as "fullName",
        u.email,
        m.register_number as "registerNumber",
        m.department,
        m.year,
        m.class_section as "classSection",
        m.phone,
        m.skills,
        m.technical_interests as "technicalInterests",
        cm.member_number as "memberNumber",
        cm.status as "membershipStatus"
       FROM membership_applications a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN members m ON m.user_id = a.user_id
       LEFT JOIN club_memberships cm ON cm.user_id = a.user_id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC
       LIMIT 1`,
      [userId]
    );
    return res.rows[0] || null;
  },

  // 3. Find application by ID
  findById: async (id: string): Promise<MembershipApplicationRow | null> => {
    const res = await query(
      `SELECT 
        a.*,
        m.full_name as "fullName",
        u.email,
        m.register_number as "registerNumber",
        m.department,
        m.year,
        m.class_section as "classSection",
        m.phone,
        m.skills,
        m.technical_interests as "technicalInterests",
        m.bio,
        m.github_url as "githubUrl",
        m.linkedin_url as "linkedinUrl",
        m.portfolio_url as "portfolioUrl",
        cm.member_number as "memberNumber",
        cm.status as "membershipStatus",
        reviewer.email as "reviewerEmail"
       FROM membership_applications a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN members m ON m.user_id = a.user_id
       LEFT JOIN club_memberships cm ON cm.user_id = a.user_id
       LEFT JOIN users reviewer ON reviewer.id = a.reviewed_by
       WHERE a.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  // 4. Update application status and assessment results
  updateStatus: async (
    id: string,
    updates: {
      status: string;
      testAttemptId?: string;
      finalScore?: number;
      scorePercentage?: number;
      passed?: boolean;
      submittedAt?: Date;
      reviewedAt?: Date;
      reviewedBy?: string;
      adminNotes?: string;
      rejectionReason?: string;
    }
  ): Promise<MembershipApplicationRow> => {
    const fields: string[] = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [id, updates.status];
    let idx = 3;

    if (updates.testAttemptId !== undefined) {
      fields.push(`test_attempt_id = $${idx++}`);
      values.push(updates.testAttemptId);
    }
    if (updates.finalScore !== undefined) {
      fields.push(`final_score = $${idx++}`);
      values.push(updates.finalScore);
    }
    if (updates.scorePercentage !== undefined) {
      fields.push(`score_percentage = $${idx++}`);
      values.push(updates.scorePercentage);
    }
    if (updates.passed !== undefined) {
      fields.push(`passed = $${idx++}`);
      values.push(updates.passed);
    }
    if (updates.submittedAt !== undefined) {
      fields.push(`submitted_at = $${idx++}`);
      values.push(updates.submittedAt);
    }
    if (updates.reviewedAt !== undefined) {
      fields.push(`reviewed_at = $${idx++}`);
      values.push(updates.reviewedAt);
    }
    if (updates.reviewedBy !== undefined) {
      fields.push(`reviewed_by = $${idx++}`);
      values.push(updates.reviewedBy);
    }
    if (updates.adminNotes !== undefined) {
      fields.push(`admin_notes = $${idx++}`);
      values.push(updates.adminNotes);
    }
    if (updates.rejectionReason !== undefined) {
      fields.push(`rejection_reason = $${idx++}`);
      values.push(updates.rejectionReason);
    }

    const res = await query(
      `UPDATE membership_applications
       SET ${fields.join(', ')}
       WHERE id = $1
       RETURNING *`,
      values
    );
    return res.rows[0];
  },

  // 5. Admin List Applications with server-side pagination, filters & search
  listApplications: async (params: {
    search?: string;
    status?: string;
    passed?: string;
    department?: string;
    year?: number;
    minScore?: number;
    maxScore?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }) => {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];
    let idx = 1;

    if (params.search) {
      conditions.push(
        `(m.full_name ILIKE $${idx} OR m.register_number ILIKE $${idx} OR u.email ILIKE $${idx} OR a.application_number ILIKE $${idx})`
      );
      values.push(`%${params.search}%`);
      idx++;
    }

    if (params.status && params.status !== 'ALL') {
      conditions.push(`a.status = $${idx++}`);
      values.push(params.status);
    }

    if (params.passed !== undefined && params.passed !== '') {
      if (params.passed === 'true') {
        conditions.push(`a.passed = true`);
      } else if (params.passed === 'false') {
        conditions.push(`a.passed = false`);
      }
    }

    if (params.department && params.department !== 'ALL') {
      conditions.push(`m.department = $${idx++}`);
      values.push(params.department);
    }

    if (params.year) {
      conditions.push(`m.year = $${idx++}`);
      values.push(params.year);
    }

    if (params.minScore !== undefined) {
      conditions.push(`a.final_score >= $${idx++}`);
      values.push(params.minScore);
    }

    if (params.maxScore !== undefined) {
      conditions.push(`a.final_score <= $${idx++}`);
      values.push(params.maxScore);
    }

    // Sorting
    let sortColumn = 'a.created_at';
    if (params.sortBy === 'score') sortColumn = 'a.final_score';
    if (params.sortBy === 'name') sortColumn = 'm.full_name';
    if (params.sortBy === 'department') sortColumn = 'm.department';
    if (params.sortBy === 'submitted_at') sortColumn = 'a.submitted_at';

    const order = params.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const whereClause = conditions.join(' AND ');

    // Count
    const countRes = await query(
      `SELECT COUNT(*) as total
       FROM membership_applications a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN members m ON m.user_id = a.user_id
       WHERE ${whereClause}`,
      values
    );
    const total = parseInt(countRes.rows[0].total, 10);

    // Data
    const dataRes = await query(
      `SELECT 
        a.id,
        a.application_number as "applicationNumber",
        a.status,
        a.final_score as "finalScore",
        a.score_percentage as "scorePercentage",
        a.passed,
        a.submitted_at as "submittedAt",
        a.reviewed_at as "reviewedAt",
        a.created_at as "createdAt",
        m.full_name as "fullName",
        m.register_number as "registerNumber",
        m.department,
        m.year,
        m.class_section as "classSection",
        u.email,
        cm.member_number as "memberNumber"
       FROM membership_applications a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN members m ON m.user_id = a.user_id
       LEFT JOIN club_memberships cm ON cm.user_id = a.user_id
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${order} NULLS LAST
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    return {
      applications: dataRes.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // 6. Application metrics count
  getCounts: async () => {
    const res = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'UNDER_REVIEW' OR status = 'TEST_COMPLETED' THEN 1 END) as pending,
        COUNT(CASE WHEN passed = true THEN 1 END) as passed,
        COUNT(CASE WHEN passed = false THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'WAITLISTED' THEN 1 END) as waitlisted,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected
      FROM membership_applications
    `);
    const row = res.rows[0];
    return {
      total: parseInt(row.total, 10) || 0,
      pending: parseInt(row.pending, 10) || 0,
      passed: parseInt(row.passed, 10) || 0,
      failed: parseInt(row.failed, 10) || 0,
      approved: parseInt(row.approved, 10) || 0,
      waitlisted: parseInt(row.waitlisted, 10) || 0,
      rejected: parseInt(row.rejected, 10) || 0,
    };
  },

  // 7. Selection analytics
  getAnalytics: async () => {
    // 1. Overall summary
    const summaryRes = await query(`
      SELECT 
        COUNT(*) as "totalApplications",
        ROUND(AVG(final_score)::numeric, 1) as "avgScore",
        MAX(final_score) as "highestScore",
        MIN(final_score) as "lowestScore",
        ROUND((COUNT(CASE WHEN passed = true THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN final_score IS NOT NULL THEN 1 END), 0) * 100)::numeric, 1) as "passRate",
        ROUND((COUNT(CASE WHEN status = 'APPROVED' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100)::numeric, 1) as "approvalRate"
      FROM membership_applications
    `);

    // 2. By Department
    const deptRes = await query(`
      SELECT 
        COALESCE(m.department, 'Unknown') as department,
        COUNT(*) as count,
        COUNT(CASE WHEN a.status = 'APPROVED' THEN 1 END) as approved
      FROM membership_applications a
      LEFT JOIN members m ON m.user_id = a.user_id
      GROUP BY m.department
      ORDER BY count DESC
    `);

    // 3. By Year
    const yearRes = await query(`
      SELECT 
        COALESCE(m.year, 0) as year,
        COUNT(*) as count,
        COUNT(CASE WHEN a.status = 'APPROVED' THEN 1 END) as approved
      FROM membership_applications a
      LEFT JOIN members m ON m.user_id = a.user_id
      GROUP BY m.year
      ORDER BY year ASC
    `);

    // 4. Score Distribution buckets
    const distRes = await query(`
      SELECT 
        CASE 
          WHEN final_score >= 21 THEN '21-25 (Top)'
          WHEN final_score >= 15 THEN '15-20 (Pass)'
          WHEN final_score >= 10 THEN '10-14 (Borderline)'
          ELSE '0-9 (Fail)'
        END as range,
        COUNT(*) as count
      FROM membership_applications
      WHERE final_score IS NOT NULL
      GROUP BY range
      ORDER BY range DESC
    `);

    return {
      summary: summaryRes.rows[0] || {},
      byDepartment: deptRes.rows,
      byYear: yearRes.rows,
      scoreDistribution: distRes.rows,
    };
  },

  // 8. Create or activate membership record upon approval
  activateClubMembership: async (params: {
    userId: string;
    memberId: string | null;
    memberNumber: string;
    applicationId: string;
    approvedBy: string;
  }) => {
    const res = await query(
      `INSERT INTO club_memberships (
        user_id, member_id, member_number, status, joined_at, approved_by, application_id
      )
      VALUES ($1, $2, $3, 'ACTIVE', CURRENT_TIMESTAMP, $4, $5)
      ON CONFLICT (user_id) 
      DO UPDATE SET status = 'ACTIVE', approved_by = EXCLUDED.approved_by, application_id = EXCLUDED.application_id, updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        params.userId,
        params.memberId,
        params.memberNumber,
        params.approvedBy,
        params.applicationId,
      ]
    );
    // Also sync members table status to Active
    await query(`UPDATE members SET status = 'Active', updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`, [
      params.userId,
    ]);
    return res.rows[0];
  },

  // 9. Get club membership status for a user
  getMembershipByUserId: async (userId: string) => {
    const res = await query(
      `SELECT * FROM club_memberships WHERE user_id = $1`,
      [userId]
    );
    return res.rows[0] || null;
  },
};
