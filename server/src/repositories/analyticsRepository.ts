import { pool } from '../db';

export interface DateRange {
  from: string;
  to: string;
  range: string;
}

export const analyticsRepository = {
  getPlatformKPIs: async (dr: DateRange) => {
    // 1. Members KPIs
    const membersQuery = `
      SELECT
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'Active' THEN 1 END)::int as active,
        COUNT(CASE WHEN joined_at >= $1 AND joined_at <= $2 THEN 1 END)::int as new_in_period,
        ROUND(AVG(
          (CASE WHEN bio IS NOT NULL AND bio != '' THEN 20 ELSE 0 END) +
          (CASE WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 THEN 20 ELSE 0 END) +
          (CASE WHEN technical_interests IS NOT NULL AND array_length(technical_interests, 1) > 0 THEN 20 ELSE 0 END) +
          (CASE WHEN phone IS NOT NULL AND phone != '' THEN 20 ELSE 0 END) +
          (CASE WHEN github_url IS NOT NULL OR linkedin_url IS NOT NULL THEN 20 ELSE 0 END)
        ), 1)::float as completion_rate
      FROM members
    `;
    const membersRes = await pool.query(membersQuery, [dr.from, dr.to]);
    const mRow = membersRes.rows[0] || {};

    // 2. Events KPIs
    const eventsQuery = `
      SELECT
        COUNT(*)::int as total,
        COUNT(CASE WHEN start_at > NOW() AND LOWER(status) = 'published' THEN 1 END)::int as upcoming,
        COUNT(CASE WHEN start_at >= $1 AND start_at <= $2 THEN 1 END)::int as in_period
      FROM events
    `;
    const eventsRes = await pool.query(eventsQuery, [dr.from, dr.to]);
    const eRow = eventsRes.rows[0] || {};

    const eventRegQuery = `
      SELECT
        COUNT(*)::int as reg_count,
        COUNT(CASE WHEN UPPER(status) = 'ATTENDED' THEN 1 END)::int as attended_count,
        COUNT(CASE WHEN UPPER(status) = 'CONFIRMED' THEN 1 END)::int as confirmed_count
      FROM event_registrations
      WHERE registered_at >= $1 AND registered_at <= $2
    `;
    const eventRegRes = await pool.query(eventRegQuery, [dr.from, dr.to]);
    const erRow = eventRegRes.rows[0] || {};
    const attendanceRate = erRow.reg_count > 0 
      ? Math.round((erRow.attended_count / erRow.reg_count) * 100) 
      : 0;

    // 3. Projects KPIs
    const projectsQuery = `
      SELECT
        COUNT(*)::int as total,
        COUNT(CASE WHEN UPPER(status) IN ('OPEN', 'ACTIVE', 'IN_PROGRESS') THEN 1 END)::int as active,
        COUNT(CASE WHEN UPPER(status) = 'COMPLETED' THEN 1 END)::int as completed
      FROM projects
    `;
    const projectsRes = await pool.query(projectsQuery);
    const pRow = projectsRes.rows[0] || {};

    const teamsQuery = `
      SELECT COUNT(*)::int as active_teams
      FROM project_teams
      WHERE UPPER(status) = 'ACTIVE'
    `;
    const teamsRes = await pool.query(teamsQuery);
    const activeTeams = teamsRes.rows[0]?.active_teams || 0;

    // 4. Learning KPIs
    const coursesQuery = `
      SELECT
        COUNT(*)::int as total_courses,
        COUNT(CASE WHEN UPPER(status) = 'PUBLISHED' THEN 1 END)::int as published_courses
      FROM courses
    `;
    const coursesRes = await pool.query(coursesQuery);
    const cRow = coursesRes.rows[0] || {};

    const enrollmentsQuery = `
      SELECT
        COUNT(*)::int as total_enrollments,
        COUNT(CASE WHEN UPPER(status) = 'COMPLETED' THEN 1 END)::int as completed_count
      FROM course_enrollments
    `;
    const enrollmentsRes = await pool.query(enrollmentsQuery);
    const enRow = enrollmentsRes.rows[0] || {};
    const learningCompletionRate = enRow.total_enrollments > 0
      ? Math.round((enRow.completed_count / enRow.total_enrollments) * 100)
      : 0;

    // 5. Achievements KPIs
    const achievementsQuery = `
      SELECT
        (SELECT COUNT(*)::int FROM achievements) as total_definitions,
        (SELECT COUNT(*)::int FROM achievements WHERE is_active = true) as active_definitions,
        (SELECT COUNT(*)::int FROM member_achievements) as total_earned,
        (SELECT COUNT(DISTINCT member_id)::int FROM member_achievements) as unique_earners
    `;
    const achievementsRes = await pool.query(achievementsQuery);
    const aRow = achievementsRes.rows[0] || {};

    // 6. Notifications KPIs
    const notifQuery = `
      SELECT
        COUNT(*)::int as total_sent,
        COUNT(CASE WHEN read_at IS NULL THEN 1 END)::int as unread_count
      FROM notifications
    `;
    const notifRes = await pool.query(notifQuery);
    const nRow = notifRes.rows[0] || {};

    const annQuery = `
      SELECT COUNT(*)::int as count FROM announcements
    `;
    const annRes = await pool.query(annQuery);
    const annCount = annRes.rows[0]?.count || 0;

    // 7. Trends & Time-series
    const memberGrowthRes = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('day', joined_at), 'YYYY-MM-DD') as date,
        COUNT(*)::int as "newMembers"
      FROM members
      WHERE joined_at >= $1 AND joined_at <= $2
      GROUP BY DATE_TRUNC('day', joined_at)
      ORDER BY date ASC
    `, [dr.from, dr.to]);

    const eventActivityRes = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', start_at), 'YYYY-MM') as month,
        COUNT(*)::int as "eventsCount"
      FROM events
      WHERE start_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', start_at)
      ORDER BY month ASC
    `);

    const learningTrendRes = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', enrolled_at), 'YYYY-MM') as month,
        COUNT(*)::int as enrollments,
        COUNT(CASE WHEN UPPER(status) = 'COMPLETED' THEN 1 END)::int as completions
      FROM course_enrollments
      WHERE enrolled_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', enrolled_at)
      ORDER BY month ASC
    `);

    const projectStatusRes = await pool.query(`
      SELECT status, COUNT(*)::int as count
      FROM projects
      GROUP BY status
      ORDER BY count DESC
    `);

    const achievementTrendRes = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('day', earned_at), 'YYYY-MM-DD') as date,
        COUNT(*)::int as count
      FROM member_achievements
      WHERE earned_at >= $1 AND earned_at <= $2
      GROUP BY DATE_TRUNC('day', earned_at)
      ORDER BY date ASC
    `, [dr.from, dr.to]);

    const recentActivityRes = await pool.query(`
      SELECT 
        al.id,
        al.action,
        al.entity_type as "entityType",
        al.entity_id as "entityId",
        al.created_at as "createdAt",
        u.email as "actorEmail",
        m.full_name as "actorName"
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_id = u.id
      LEFT JOIN members m ON m.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    return {
      period: {
        range: dr.range,
        from: dr.from,
        to: dr.to,
      },
      members: {
        total: mRow.total || 0,
        active: mRow.active || 0,
        newInPeriod: mRow.new_in_period || 0,
        completionRate: mRow.completion_rate || 0,
      },
      events: {
        total: eRow.total || 0,
        upcoming: eRow.upcoming || 0,
        inPeriod: eRow.in_period || 0,
        registrationsCount: erRow.reg_count || 0,
        attendanceRate,
      },
      projects: {
        total: pRow.total || 0,
        active: pRow.active || 0,
        completed: pRow.completed || 0,
        activeTeams,
      },
      learning: {
        totalCourses: cRow.total_courses || 0,
        publishedCourses: cRow.published_courses || 0,
        totalEnrollments: enRow.total_enrollments || 0,
        completionRate: learningCompletionRate,
      },
      achievements: {
        totalDefinitions: aRow.total_definitions || 0,
        activeDefinitions: aRow.active_definitions || 0,
        totalEarned: aRow.total_earned || 0,
        uniqueEarners: aRow.unique_earners || 0,
      },
      notifications: {
        totalSent: nRow.total_sent || 0,
        unreadCount: nRow.unread_count || 0,
        recentAnnouncementsCount: annCount,
      },
      trends: {
        memberGrowth: memberGrowthRes.rows,
        eventActivity: eventActivityRes.rows,
        learningEngagement: learningTrendRes.rows,
        projectActivity: projectStatusRes.rows,
        achievementActivity: achievementTrendRes.rows,
      },
      recentActivity: recentActivityRes.rows,
    };
  },

  getMemberAnalytics: async (dr: DateRange) => {
    const deptRes = await pool.query(`
      SELECT department, COUNT(*)::int as count
      FROM members
      GROUP BY department
      ORDER BY count DESC
    `);

    const yearRes = await pool.query(`
      SELECT year, COUNT(*)::int as count
      FROM members
      GROUP BY year
      ORDER BY year ASC
    `);

    const roleRes = await pool.query(`
      SELECT role, COUNT(*)::int as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);

    const statusRes = await pool.query(`
      SELECT status, COUNT(*)::int as count
      FROM members
      GROUP BY status
      ORDER BY count DESC
    `);

    const growthRes = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('day', joined_at), 'YYYY-MM-DD') as date,
        COUNT(*)::int as count
      FROM members
      WHERE joined_at >= $1 AND joined_at <= $2
      GROUP BY DATE_TRUNC('day', joined_at)
      ORDER BY date ASC
    `, [dr.from, dr.to]);

    const summaryRes = await pool.query(`
      SELECT
        COUNT(*)::int as total_members,
        COUNT(CASE WHEN status = 'Active' THEN 1 END)::int as active_members,
        COUNT(CASE WHEN status = 'Inactive' THEN 1 END)::int as inactive_members,
        COUNT(CASE WHEN status = 'Suspended' THEN 1 END)::int as suspended_members,
        COUNT(CASE WHEN joined_at >= $1 AND joined_at <= $2 THEN 1 END)::int as new_members
      FROM members
    `, [dr.from, dr.to]);

    return {
      period: dr,
      summary: summaryRes.rows[0] || {},
      departmentDistribution: deptRes.rows,
      yearDistribution: yearRes.rows,
      roleDistribution: roleRes.rows,
      statusDistribution: statusRes.rows,
      growthSeries: growthRes.rows,
    };
  },

  getEventAnalytics: async (dr: DateRange) => {
    const summaryRes = await pool.query(`
      SELECT
        COUNT(*)::int as total_events,
        COUNT(CASE WHEN LOWER(status) = 'published' THEN 1 END)::int as published,
        COUNT(CASE WHEN LOWER(status) = 'completed' THEN 1 END)::int as completed,
        COUNT(CASE WHEN LOWER(status) = 'cancelled' THEN 1 END)::int as cancelled,
        COUNT(CASE WHEN LOWER(status) = 'draft' THEN 1 END)::int as draft
      FROM events
      WHERE start_at >= $1 AND start_at <= $2
    `, [dr.from, dr.to]);

    const regRes = await pool.query(`
      SELECT
        COUNT(*)::int as total_registrations,
        COUNT(CASE WHEN UPPER(er.status) = 'CONFIRMED' THEN 1 END)::int as confirmed,
        COUNT(CASE WHEN UPPER(er.status) = 'ATTENDED' THEN 1 END)::int as attended,
        COUNT(CASE WHEN UPPER(er.status) = 'CANCELLED' THEN 1 END)::int as cancelled_reg,
        COUNT(CASE WHEN UPPER(er.status) = 'NO_SHOW' THEN 1 END)::int as no_shows
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE e.start_at >= $1 AND e.start_at <= $2
    `, [dr.from, dr.to]);

    const typeRes = await pool.query(`
      SELECT event_type as "eventType", COUNT(*)::int as count
      FROM events
      GROUP BY event_type
      ORDER BY count DESC
    `);

    const topEventsRes = await pool.query(`
      SELECT 
        e.id, 
        e.title, 
        e.event_type as "eventType", 
        e.start_at as "startAt",
        e.capacity,
        COUNT(er.id)::int as "totalRegistrations",
        COUNT(CASE WHEN UPPER(er.status) = 'ATTENDED' THEN 1 END)::int as "attendedCount",
        ROUND(
          CASE 
            WHEN COUNT(er.id) > 0 
            THEN (COUNT(CASE WHEN UPPER(er.status) = 'ATTENDED' THEN 1 END)::float / COUNT(er.id)::float) * 100 
            ELSE 0 
          END
        )::int as "attendanceRate"
      FROM events e
      LEFT JOIN event_registrations er ON er.event_id = e.id
      WHERE e.start_at >= $1 AND e.start_at <= $2
      GROUP BY e.id, e.title, e.event_type, e.start_at, e.capacity
      ORDER BY "totalRegistrations" DESC
      LIMIT 10
    `, [dr.from, dr.to]);

    return {
      period: dr,
      summary: summaryRes.rows[0] || {},
      registrations: regRes.rows[0] || {},
      eventTypeDistribution: typeRes.rows,
      topEvents: topEventsRes.rows,
    };
  },

  getProjectAnalytics: async (dr: DateRange) => {
    const summaryRes = await pool.query(`
      SELECT
        COUNT(*)::int as total_projects,
        COUNT(CASE WHEN UPPER(status) IN ('OPEN', 'ACTIVE', 'IN_PROGRESS') THEN 1 END)::int as active_projects,
        COUNT(CASE WHEN UPPER(status) = 'COMPLETED' THEN 1 END)::int as completed_projects,
        COUNT(CASE WHEN UPPER(status) = 'DRAFT' THEN 1 END)::int as draft_projects
      FROM projects
    `);

    const domainRes = await pool.query(`
      SELECT domain, COUNT(*)::int as count
      FROM projects
      GROUP BY domain
      ORDER BY count DESC
    `);

    const difficultyRes = await pool.query(`
      SELECT difficulty, COUNT(*)::int as count
      FROM projects
      GROUP BY difficulty
      ORDER BY count DESC
    `);

    const teamsRes = await pool.query(`
      SELECT
        COUNT(DISTINCT pt.id)::int as total_teams,
        ROUND(COALESCE(COUNT(ptm.id)::float / NULLIF(COUNT(DISTINCT pt.id), 0), 0)::numeric, 1)::float as avg_team_size,
        COUNT(DISTINCT CASE WHEN UPPER(pt.status) = 'ACTIVE' THEN pt.id END)::int as active_teams
      FROM project_teams pt
      LEFT JOIN project_team_members ptm ON pt.id = ptm.team_id
    `);

    return {
      period: dr,
      summary: summaryRes.rows[0] || {},
      domainDistribution: domainRes.rows,
      difficultyDistribution: difficultyRes.rows,
      teamStats: teamsRes.rows[0] || {},
    };
  },

  getCourseAnalytics: async (dr: DateRange) => {
    const summaryRes = await pool.query(`
      SELECT
        COUNT(*)::int as total_courses,
        COUNT(CASE WHEN UPPER(status) = 'PUBLISHED' THEN 1 END)::int as published,
        COUNT(CASE WHEN UPPER(status) = 'DRAFT' THEN 1 END)::int as draft,
        COUNT(CASE WHEN UPPER(status) = 'ARCHIVED' THEN 1 END)::int as archived
      FROM courses
    `);

    const enrollmentsRes = await pool.query(`
      SELECT
        COUNT(*)::int as total_enrollments,
        COUNT(CASE WHEN UPPER(status) IN ('ENROLLED', 'ACTIVE', 'IN_PROGRESS') THEN 1 END)::int as active_learners,
        COUNT(CASE WHEN UPPER(status) = 'COMPLETED' THEN 1 END)::int as completed_learners,
        COUNT(CASE WHEN UPPER(status) = 'DROPPED' THEN 1 END)::int as dropped_learners,
        ROUND(COALESCE((COUNT(CASE WHEN UPPER(status) = 'COMPLETED' THEN 1 END)::float / NULLIF(COUNT(*), 0)) * 100, 0)::numeric, 1)::float as avg_progress
      FROM course_enrollments
    `);

    const categoryRes = await pool.query(`
      SELECT category, COUNT(*)::int as count
      FROM courses
      GROUP BY category
      ORDER BY count DESC
    `);

    const topCoursesRes = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.category,
        c.difficulty,
        c.status,
        COUNT(ce.id)::int as "totalEnrollments",
        COUNT(CASE WHEN UPPER(ce.status) = 'COMPLETED' THEN 1 END)::int as "completedCount",
        ROUND(COALESCE((COUNT(CASE WHEN UPPER(ce.status) = 'COMPLETED' THEN 1 END)::float / NULLIF(COUNT(ce.id), 0)) * 100, 0)::numeric, 1)::float as "avgProgress"
      FROM courses c
      LEFT JOIN course_enrollments ce ON ce.course_id = c.id
      GROUP BY c.id, c.title, c.category, c.difficulty, c.status
      ORDER BY "totalEnrollments" DESC
      LIMIT 10
    `);

    return {
      period: dr,
      summary: summaryRes.rows[0] || {},
      learningStats: enrollmentsRes.rows[0] || {},
      categoryDistribution: categoryRes.rows,
      topCourses: topCoursesRes.rows,
    };
  },

  getAchievementAnalytics: async (dr: DateRange) => {
    const summaryRes = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM achievements) as total_achievements,
        (SELECT COUNT(*)::int FROM achievements WHERE is_active = true) as active_definitions,
        (SELECT COUNT(*)::int FROM member_achievements) as total_earned,
        (SELECT COUNT(DISTINCT member_id)::int FROM member_achievements) as unique_earners
    `);

    const categoryRes = await pool.query(`
      SELECT category, COUNT(*)::int as count
      FROM achievements
      GROUP BY category
      ORDER BY count DESC
    `);

    const topAchievementsRes = await pool.query(`
      SELECT 
        a.id,
        a.title,
        a.category,
        a.points,
        COUNT(ma.id)::int as "earnedCount"
      FROM achievements a
      LEFT JOIN member_achievements ma ON ma.achievement_id = a.id
      GROUP BY a.id, a.title, a.category, a.points
      ORDER BY "earnedCount" DESC
      LIMIT 10
    `);

    const earningTrendRes = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('day', earned_at), 'YYYY-MM-DD') as date,
        COUNT(*)::int as count
      FROM member_achievements
      WHERE earned_at >= $1 AND earned_at <= $2
      GROUP BY DATE_TRUNC('day', earned_at)
      ORDER BY date ASC
    `, [dr.from, dr.to]);

    return {
      period: dr,
      summary: summaryRes.rows[0] || {},
      categoryDistribution: categoryRes.rows,
      topAchievements: topAchievementsRes.rows,
      earningTrend: earningTrendRes.rows,
    };
  },

  getEngagementAnalytics: async (dr: DateRange) => {
    const activeMembersRes = await pool.query(`
      WITH active_ids AS (
        SELECT member_id FROM event_registrations WHERE registered_at >= $1 AND registered_at <= $2
        UNION
        SELECT member_id FROM course_enrollments WHERE enrolled_at >= $1 AND enrolled_at <= $2
        UNION
        SELECT member_id FROM member_achievements WHERE earned_at >= $1 AND earned_at <= $2
        UNION
        SELECT member_id FROM project_memberships WHERE joined_at >= $1 AND joined_at <= $2
      )
      SELECT COUNT(DISTINCT member_id)::int as active_count
      FROM active_ids
    `, [dr.from, dr.to]);

    const activityBreakdownRes = await pool.query(`
      SELECT activity_type as "activityType", COUNT(*)::int as count
      FROM member_activity
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY activity_type
      ORDER BY count DESC
    `, [dr.from, dr.to]);

    return {
      period: dr,
      activeMembersCount: activeMembersRes.rows[0]?.active_count || 0,
      activityBreakdown: activityBreakdownRes.rows,
    };
  },
};
