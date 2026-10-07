import { query } from '../db';
import { studentService } from './studentService';

export interface DashboardStats {
  projects: number;
  courses: number;
  achievements: number;
  events: number;
  points?: number;
  totalProjects: number;
  totalCourses: number;
  totalEvents: number;
  unreadNotifications?: number;
}

export interface ActivityItem {
  id: string;
  type: 'achievement' | 'course' | 'project' | 'event';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  link?: string;
}

export interface DashboardData {
  profile: any;
  profileCompletion: any;
  stats: DashboardStats;
  announcements: any[];
  recentProjects: any[];
  recentAchievements: any[];
  recentActivity: ActivityItem[];
  upcomingEvents?: any[];
  myProjects?: any[];
  myCourses?: any[];
  continueLearning?: any;
  totalPoints?: number;
  unreadNotificationsCount?: number;
  recentNotifications?: any[];
}

export const dashboardService = {
  getStudentDashboard: async (userId: string): Promise<DashboardData> => {
    // 1. Fetch Student Profile and Completion
    const profileData = await studentService.getProfile(userId);
    const memberId = profileData.id;

    // 2. Parallel queries for stats and content
    const [
      projectInterestsRes,
      courseProgressRes,
      achievementsRes,
      totalPointsRes,
      unreadNotifRes,
      recentNotifRes,
      eventsRes,
      allProjectsCountRes,
      allCoursesCountRes,
      allEventsCountRes,
      announcementsRes,
      recentProjectsRes,
      recentAchievementsRes,
      upcomingEventsRes,
    ] = await Promise.all([
      // Student's projects
      query(`SELECT COUNT(*) as count FROM (
        SELECT project_id FROM project_memberships WHERE member_id = $1 AND status IN ('ACTIVE','PENDING')
        UNION SELECT pi.project_id FROM project_interests pi WHERE pi.member_id = $1
          AND NOT EXISTS (SELECT 1 FROM project_memberships pm WHERE pm.project_id = pi.project_id AND pm.member_id = $1)
        UNION SELECT pt.project_id FROM project_team_members tm JOIN project_teams pt ON pt.id = tm.team_id WHERE tm.member_id = $1
      ) memberships`, [memberId]),
      // Student's courses
      query(`SELECT COUNT(*) as count FROM (
        SELECT course_id FROM course_enrollments WHERE member_id = $1 AND status != 'DROPPED'
        UNION SELECT cp.course_id FROM course_progress cp WHERE cp.member_id = $1
          AND NOT EXISTS (SELECT 1 FROM course_enrollments ce WHERE ce.course_id = cp.course_id AND ce.member_id = $1)
      ) enrollments`, [memberId]),
      // Student's achievements (supports both tables)
      query(`
        SELECT COUNT(DISTINCT achievement_id) as count 
        FROM (
          SELECT achievement_id FROM member_achievements WHERE member_id = $1
          UNION
          SELECT achievement_id FROM achievement_members WHERE member_id = $1
        ) combined
      `, [memberId]),
      // Student's total points
      query(`
        SELECT COALESCE(SUM(a.points), 0) as total_points
        FROM member_achievements ma
        JOIN achievements a ON a.id = ma.achievement_id
        WHERE ma.member_id = $1
      `, [memberId]),
      // Unread notifications
      query('SELECT COUNT(*) as count FROM notifications WHERE recipient_id = $1 AND read_at IS NULL', [memberId]),
      // Recent notifications
      query(`
        SELECT id, type, title, message, data, priority, read_at, created_at
        FROM notifications
        WHERE recipient_id = $1
        ORDER BY created_at DESC
        LIMIT 5
      `, [memberId]),
      // Student's registered events
      query("SELECT COUNT(*) as count FROM event_registrations WHERE member_id = $1 AND UPPER(status) IN ('REGISTERED', 'ATTENDED')", [memberId]),
      // Total counts for context
      query('SELECT COUNT(*) as count FROM projects WHERE status = \'Active\''),
      query('SELECT COUNT(*) as count FROM courses'),
      query('SELECT COUNT(*) as count FROM events'),
      // Top announcements with read receipt
      query(`
        SELECT 
          a.id, 
          a.title, 
          a.body, 
          a.category, 
          a.priority, 
          a.published_at as "publishedAt",
          a.created_at as "createdAt",
          EXISTS(SELECT 1 FROM announcement_reads ar WHERE ar.announcement_id = a.id AND ar.member_id = $1) as "read"
        FROM announcements a
        WHERE a.status = 'published'
          AND (a.published_at IS NULL OR a.published_at <= NOW())
          AND (a.expires_at IS NULL OR a.expires_at > NOW())
        ORDER BY a.published_at DESC
        LIMIT 3
      `, [memberId]),
      // Recent Projects
      query(`
        SELECT 
          p.id, 
          p.title, 
          p.short_description as "shortDescription", 
          p.category, 
          p.difficulty, 
          p.status,
          EXISTS(SELECT 1 FROM project_interests pi WHERE pi.project_id = p.id AND pi.member_id = $1) as "interested"
        FROM projects p
        ORDER BY p.created_at DESC
        LIMIT 3
      `, [memberId]),
      // Recent Achievements
      query(`
        SELECT 
          a.id, 
          COALESCE(a.name, a.title) as title, 
          a.category, 
          a.student_name as "studentName", 
          a.year,
          a.date,
          EXISTS(
            SELECT 1 FROM member_achievements ma WHERE ma.achievement_id = a.id AND ma.member_id = $1
            UNION
            SELECT 1 FROM achievement_members am WHERE am.achievement_id = a.id AND am.member_id = $1
          ) as "isMine"
        FROM achievements a
        ORDER BY a.created_at DESC
        LIMIT 4
      `, [memberId]),
      // Upcoming Events with student registration status
      query(`
        SELECT 
          e.id, 
          e.title, 
          e.event_type as "eventType", 
          e.start_at as "startAt", 
          e.end_at as "endAt", 
          e.location,
          e.meeting_url as "meetingUrl",
          e.capacity,
          (
            SELECT COUNT(*)::int 
            FROM event_registrations er 
            WHERE er.event_id = e.id 
              AND er.status IN ('REGISTERED', 'registered', 'ATTENDED', 'attended')
          ) as "registrationCount",
          EXISTS(
            SELECT 1 FROM event_registrations er 
            WHERE er.event_id = e.id 
              AND er.member_id = $1 
              AND er.status IN ('REGISTERED', 'registered', 'ATTENDED', 'attended')
          ) as "isRegistered"
        FROM events e
        WHERE e.status = 'published' AND e.start_at > CURRENT_TIMESTAMP
        ORDER BY e.start_at ASC
        LIMIT 4
      `, [memberId]),
    ]);

    const myProjectCount = parseInt(projectInterestsRes.rows[0].count, 10);
    const myCourseCount = parseInt(courseProgressRes.rows[0].count, 10);
    const myAchievementCount = parseInt(achievementsRes.rows[0].count, 10);
    const myEventCount = parseInt(eventsRes.rows[0].count, 10);

    const stats: DashboardStats = {
      projects: myProjectCount,
      courses: myCourseCount,
      achievements: myAchievementCount,
      events: myEventCount,
      points: parseInt(totalPointsRes.rows[0]?.total_points || '0', 10),
      unreadNotifications: parseInt(unreadNotifRes.rows[0]?.count || '0', 10),
      totalProjects: parseInt(allProjectsCountRes.rows[0].count, 10),
      totalCourses: parseInt(allCoursesCountRes.rows[0].count, 10),
      totalEvents: parseInt(allEventsCountRes.rows[0].count, 10),
    };

    // 3. Compile Real Chronological Activity Feed
    const [recentAchRows, recentCourseRows, recentProjRows, recentEventRows] = await Promise.all([
      query(`
        SELECT 
          a.id, 
          COALESCE(a.name, a.title) as title, 
          a.category, 
          COALESCE(ma.earned_at::text, a.created_at::text) as timestamp
        FROM member_achievements ma
        JOIN achievements a ON a.id = ma.achievement_id
        WHERE ma.member_id = $1
        ORDER BY ma.earned_at DESC
        LIMIT 3
      `, [memberId]),
      query(`
        SELECT 
          c.id, 
          c.title, 
          ce.status,
          (SELECT CASE WHEN COUNT(cl.id) = 0 THEN 0 ELSE ROUND(100.0 * COUNT(lp.id) FILTER (WHERE lp.status = 'COMPLETED') / COUNT(cl.id))::int END
            FROM course_modules cm JOIN course_lessons cl ON cl.module_id = cm.id
            LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.member_id = $1
            WHERE cm.course_id = c.id) as "progressPercent",
          ce.last_accessed_at::text as timestamp
        FROM course_enrollments ce JOIN courses c ON c.id = ce.course_id
        WHERE ce.member_id = $1 AND ce.status != 'DROPPED'
        UNION ALL
        SELECT c.id, c.title, cp.status, cp.progress_percent, cp.created_at::text
        FROM course_progress cp JOIN courses c ON c.id = cp.course_id
        WHERE cp.member_id = $1 AND NOT EXISTS (SELECT 1 FROM course_enrollments ce WHERE ce.course_id = cp.course_id AND ce.member_id = $1)
        ORDER BY timestamp DESC
        LIMIT 3
      `, [memberId]),
      query(`
        SELECT 
          p.id, 
          p.title, 
          pm.created_at::text as timestamp,
          pm.status
        FROM project_memberships pm JOIN projects p ON p.id = pm.project_id
        WHERE pm.member_id = $1 AND pm.status IN ('ACTIVE','PENDING')
        UNION ALL
        SELECT p.id, p.title, pi.created_at::text, 'INTERESTED' FROM project_interests pi JOIN projects p ON p.id = pi.project_id
        WHERE pi.member_id = $1 AND NOT EXISTS (SELECT 1 FROM project_memberships pm WHERE pm.project_id = pi.project_id AND pm.member_id = $1)
        ORDER BY timestamp DESC
        LIMIT 3
      `, [memberId]),
      query(`
        SELECT 
          e.id, 
          e.title, 
          er.status,
          er.registered_at::text as timestamp
        FROM event_registrations er
        JOIN events e ON e.id = er.event_id
        WHERE er.member_id = $1
        ORDER BY er.registered_at DESC
        LIMIT 3
      `, [memberId]),
    ]);

    const activityList: ActivityItem[] = [];

    recentAchRows.rows.forEach(r => {
      activityList.push({
        id: `ach-${r.id}`,
        type: 'achievement',
        title: 'Achievement Unlocked',
        description: r.title,
        timestamp: r.timestamp,
        icon: '🏆',
        link: '/achievements',
      });
    });

    recentCourseRows.rows.forEach(r => {
      activityList.push({
        id: `course-${r.id}`,
        type: 'course',
        title: r.status === 'COMPLETED' ? 'Course completed' : 'Learning in progress',
        description: `${r.title} (${r.progressPercent || 0}%)`,
        timestamp: r.timestamp,
        icon: '📚',
        link: `/courses/${r.id}`,
      });
    });

    recentProjRows.rows.forEach(r => {
      activityList.push({
        id: `proj-${r.id}`,
        type: 'project',
        title: r.status === 'PENDING' ? 'Project join request submitted' : r.status === 'INTERESTED' ? 'Project interest saved' : 'Project joined',
        description: r.title,
        timestamp: r.timestamp,
        icon: '🚀',
        link: `/projects/${r.id}`,
      });
    });

    recentEventRows.rows.forEach(r => {
      activityList.push({
        id: `event-${r.id}`,
        type: 'event',
        title: r.status?.toUpperCase() === 'CANCELLED' ? 'Event registration cancelled' : 'Event registration',
        description: r.title,
        timestamp: r.timestamp,
        icon: '📅',
        link: `/events/${r.id}`,
      });
    });

    // Sort all real activities by timestamp descending
    activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Student's active / pending projects
    const myProjectsRes = await query(`
      SELECT 
        p.id, 
        p.title, 
        p.slug,
        p.domain,
        p.difficulty,
        p.status,
        p.progress_percentage as "progressPercentage",
        pm.role,
        pm.status as "membershipStatus"
      FROM project_memberships pm
      JOIN projects p ON p.id = pm.project_id
      WHERE pm.member_id = $1 AND pm.status IN ('ACTIVE', 'PENDING')
      ORDER BY pm.updated_at DESC
      LIMIT 5
    `, [memberId]);

    // Student's active enrolled courses / continue learning
    const myCoursesRes = await query(`
      SELECT 
        c.id,
        c.title,
        c.slug,
        c.category,
        c.difficulty,
        c.thumbnail_url as "thumbnailUrl",
        ce.status as "enrollmentStatus",
        ce.last_accessed_at as "lastAccessedAt",
        (
          SELECT 
            CASE 
              WHEN COUNT(cl.id) = 0 THEN 0
              ELSE ROUND((COUNT(lp.id) FILTER (WHERE lp.status = 'COMPLETED')::numeric / COUNT(cl.id)::numeric) * 100)::int
            END
          FROM course_modules cm
          JOIN course_lessons cl ON cl.module_id = cm.id
          LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.member_id = $1
          WHERE cm.course_id = c.id
        ) as "progressPercentage"
      FROM course_enrollments ce
      JOIN courses c ON c.id = ce.course_id
      WHERE ce.member_id = $1 AND ce.status != 'DROPPED'
      ORDER BY ce.last_accessed_at DESC
      LIMIT 4
    `, [memberId]);

    const activeCourse = myCoursesRes.rows.find(c => c.enrollmentStatus === 'ENROLLED') || myCoursesRes.rows[0] || null;

    return {
      profile: profileData,
      profileCompletion: profileData.profileCompletion,
      stats,
      announcements: announcementsRes.rows,
      recentProjects: recentProjectsRes.rows,
      recentAchievements: recentAchievementsRes.rows,
      recentActivity: activityList.slice(0, 5),
      upcomingEvents: upcomingEventsRes.rows,
      myProjects: myProjectsRes.rows,
      myCourses: myCoursesRes.rows,
      continueLearning: activeCourse,
      totalPoints: parseInt(totalPointsRes.rows[0]?.total_points || '0', 10),
      unreadNotificationsCount: parseInt(unreadNotifRes.rows[0]?.count || '0', 10),
      recentNotifications: recentNotifRes.rows,
    };
  },
};
