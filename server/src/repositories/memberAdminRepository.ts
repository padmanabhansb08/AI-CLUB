import { pool } from '../db';
import { AdminMemberFilter } from '../types/admin';

export const memberAdminRepository = {
  findMembers: async (filter: AdminMemberFilter = {}) => {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filter.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];
    let paramIdx = 1;

    if (filter.search && filter.search.trim()) {
      conditions.push(`(
        m.full_name ILIKE $${paramIdx} OR 
        m.register_number ILIKE $${paramIdx} OR 
        m.college_email ILIKE $${paramIdx} OR 
        u.email ILIKE $${paramIdx}
      )`);
      values.push(`%${filter.search.trim()}%`);
      paramIdx++;
    }

    if (filter.department && filter.department !== 'All') {
      conditions.push(`m.department = $${paramIdx++}`);
      values.push(filter.department);
    }

    if (filter.year) {
      conditions.push(`m.year = $${paramIdx++}`);
      values.push(Number(filter.year));
    }

    if (filter.classSection && filter.classSection !== 'All') {
      conditions.push(`m.class_section = $${paramIdx++}`);
      values.push(filter.classSection);
    }

    if (filter.role && filter.role !== 'All') {
      conditions.push(`LOWER(u.role) = LOWER($${paramIdx++})`);
      values.push(filter.role);
    }

    if (filter.status && filter.status !== 'All') {
      conditions.push(`LOWER(m.status) = LOWER($${paramIdx++})`);
      values.push(filter.status);
    }

    const whereClause = conditions.join(' AND ');

    // Sorting
    let sortColumn = 'm.joined_at';
    if (filter.sortBy === 'full_name') sortColumn = 'm.full_name';
    if (filter.sortBy === 'register_number') sortColumn = 'm.register_number';
    if (filter.sortBy === 'status') sortColumn = 'm.status';
    if (filter.sortBy === 'year') sortColumn = 'm.year';
    const sortOrder = filter.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Count
    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE ${whereClause}
    `;
    const countRes = await pool.query(countQuery, values);
    const total = countRes.rows[0]?.total || 0;

    // Items with completion calculation and aggregated activity counts
    const itemsQuery = `
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
        m.status,
        u.role,
        u.email as "userEmail",
        m.joined_at as "joinedAt",
        ROUND(
          (CASE WHEN m.bio IS NOT NULL AND m.bio != '' THEN 20 ELSE 0 END) +
          (CASE WHEN m.skills IS NOT NULL AND array_length(m.skills, 1) > 0 THEN 20 ELSE 0 END) +
          (CASE WHEN m.technical_interests IS NOT NULL AND array_length(m.technical_interests, 1) > 0 THEN 20 ELSE 0 END) +
          (CASE WHEN m.phone IS NOT NULL AND m.phone != '' THEN 20 ELSE 0 END) +
          (CASE WHEN m.github_url IS NOT NULL OR m.linkedin_url IS NOT NULL THEN 20 ELSE 0 END)
        )::int as "profileCompletionPercentage",
        (SELECT COUNT(*)::int FROM event_registrations er WHERE er.member_id = m.id) as "eventsRegistered",
        (SELECT COUNT(*)::int FROM event_registrations er WHERE er.member_id = m.id AND er.status = 'ATTENDED') as "eventsAttended",
        (SELECT COUNT(*)::int FROM course_enrollments ce WHERE ce.member_id = m.id) as "coursesEnrolled",
        (SELECT COUNT(*)::int FROM course_enrollments ce WHERE ce.member_id = m.id AND UPPER(ce.status) = 'COMPLETED') as "coursesCompleted",
        (SELECT COUNT(*)::int FROM project_memberships pm WHERE pm.member_id = m.id) as "projectsJoined",
        (SELECT COUNT(*)::int FROM member_achievements ma WHERE ma.member_id = m.id) as "achievementsEarned"
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;

    const itemsRes = await pool.query(itemsQuery, [...values, limit, offset]);

    return {
      items: itemsRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  getMemberDetail: async (id: string) => {
    // 1. Member profile & user
    const memberRes = await pool.query(`
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
        m.skills,
        m.technical_interests as "technicalInterests",
        m.github_url as "githubUrl",
        m.linkedin_url as "linkedinUrl",
        m.portfolio_url as "portfolioUrl",
        m.status,
        u.role,
        u.email as "userEmail",
        u.status as "userStatus",
        m.joined_at as "joinedAt",
        m.created_at as "createdAt",
        m.updated_at as "updatedAt",
        ROUND(
          (CASE WHEN m.bio IS NOT NULL AND m.bio != '' THEN 20 ELSE 0 END) +
          (CASE WHEN m.skills IS NOT NULL AND array_length(m.skills, 1) > 0 THEN 20 ELSE 0 END) +
          (CASE WHEN m.technical_interests IS NOT NULL AND array_length(m.technical_interests, 1) > 0 THEN 20 ELSE 0 END) +
          (CASE WHEN m.phone IS NOT NULL AND m.phone != '' THEN 20 ELSE 0 END) +
          (CASE WHEN m.github_url IS NOT NULL OR m.linkedin_url IS NOT NULL THEN 20 ELSE 0 END)
        )::int as "profileCompletionPercentage"
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
    `, [id]);

    const member = memberRes.rows[0];
    if (!member) return null;

    // 2. Events activity
    const eventsRes = await pool.query(`
      SELECT 
        er.id as "registrationId",
        er.status as "registrationStatus",
        er.registered_at as "registeredAt",
        e.id as "eventId",
        e.title as "eventTitle",
        e.event_type as "eventType",
        e.start_at as "startAt",
        e.location
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE er.member_id = $1
      ORDER BY e.start_at DESC
    `, [id]);

    // 3. Courses activity
    const coursesRes = await pool.query(`
      SELECT 
        ce.id as "enrollmentId",
        ce.status as "enrollmentStatus",
        (CASE WHEN UPPER(ce.status) = 'COMPLETED' THEN 100 ELSE 0 END) as "progressPercentage",
        ce.enrolled_at as "enrolledAt",
        ce.completed_at as "completedAt",
        c.id as "courseId",
        c.title as "courseTitle",
        c.category,
        c.difficulty
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      WHERE ce.member_id = $1
      ORDER BY ce.enrolled_at DESC
    `, [id]);

    // 4. Projects & Teams activity
    const projectsRes = await pool.query(`
      SELECT 
        p.id as "projectId",
        p.title as "projectTitle",
        p.status as "projectStatus",
        pm.role as "projectRole",
        pm.status as "memberStatus",
        pm.joined_at as "joinedAt"
      FROM project_memberships pm
      JOIN projects p ON pm.project_id = p.id
      WHERE pm.member_id = $1
      ORDER BY pm.joined_at DESC NULLS LAST
    `, [id]);

    const teamsRes = await pool.query(`
      SELECT 
        pt.id as "teamId",
        pt.name as "teamName",
        pt.status as "teamStatus",
        ptm.role as "teamRole",
        p.id as "projectId",
        p.title as "projectTitle"
      FROM project_team_members ptm
      JOIN project_teams pt ON ptm.team_id = pt.id
      JOIN projects p ON pt.project_id = p.id
      WHERE ptm.member_id = $1
    `, [id]);

    // 5. Achievements
    const achievementsRes = await pool.query(`
      SELECT 
        a.id as "achievementId",
        a.title,
        a.description,
        a.category,
        a.points,
        a.icon,
        ma.earned_at as "earnedAt"
      FROM member_achievements ma
      JOIN achievements a ON ma.achievement_id = a.id
      WHERE ma.member_id = $1
      ORDER BY ma.earned_at DESC
    `, [id]);

    // 6. Recent Member Activities
    const activityRes = await pool.query(`
      SELECT 
        id,
        activity_type as "activityType",
        entity_type as "entityType",
        entity_id as "entityId",
        metadata,
        created_at as "createdAt"
      FROM member_activity
      WHERE member_id = $1
      ORDER BY created_at DESC
      LIMIT 15
    `, [id]);

    return {
      profile: member,
      events: eventsRes.rows,
      courses: coursesRes.rows,
      projects: projectsRes.rows,
      teams: teamsRes.rows,
      achievements: achievementsRes.rows,
      recentActivity: activityRes.rows,
      stats: {
        eventsRegistered: eventsRes.rows.length,
        eventsAttended: eventsRes.rows.filter((e: any) => e.registrationStatus === 'ATTENDED').length,
        coursesEnrolled: coursesRes.rows.length,
        coursesCompleted: coursesRes.rows.filter((c: any) => c.enrollmentStatus === 'COMPLETED').length,
        projectsCount: projectsRes.rows.length,
        teamsCount: teamsRes.rows.length,
        achievementsCount: achievementsRes.rows.length,
        activityScore: 
          eventsRes.rows.filter((e: any) => e.registrationStatus === 'ATTENDED').length * 20 +
          coursesRes.rows.filter((c: any) => c.enrollmentStatus === 'COMPLETED').length * 30 +
          projectsRes.rows.length * 25 +
          achievementsRes.rows.length * 15,
      },
    };
  },

  updateRole: async (userId: string, newRole: string) => {
    const res = await pool.query(`
      UPDATE users
      SET role = LOWER($1), updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, role, updated_at as "updatedAt"
    `, [newRole, userId]);
    return res.rows[0] || null;
  },

  updateStatus: async (memberId: string, newStatus: string) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const memRes = await client.query(`
        UPDATE members
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, user_id, status, updated_at as "updatedAt"
      `, [newStatus, memberId]);

      if (memRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const member = memRes.rows[0];
      await client.query(`
        UPDATE users
        SET status = UPPER($1), updated_at = NOW()
        WHERE id = $2
      `, [newStatus, member.user_id]);

      await client.query('COMMIT');
      return member;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};
