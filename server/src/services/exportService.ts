import { pool } from '../db';
import { auditService } from './auditService';
import { AdminActor } from './memberAdminService';

/**
 * Sanitizes a field for CSV output:
 * - Prevents CSV Formula Injection (=, +, -, @)
 * - Properly quotes fields containing commas, quotes, or newlines
 */
export function sanitizeCsvCell(val: any): string {
  if (val === null || val === undefined) {
    return '';
  }
  let str = String(val);
  // Neutralize CSV injection formula characters
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Double quotes inside string
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function formatCsv(headers: string[], rows: any[][]): string {
  const headerLine = headers.map(sanitizeCsvCell).join(',');
  const rowLines = rows.map((row) => row.map(sanitizeCsvCell).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

export const exportService = {
  exportMembers: async (actor: AdminActor): Promise<string> => {
    const res = await pool.query(`
      SELECT 
        m.id,
        m.full_name,
        m.register_number,
        m.department,
        m.class_section,
        m.year,
        m.college_email,
        m.phone,
        m.status,
        u.role,
        m.joined_at
      FROM members m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.joined_at DESC
    `);

    const headers = [
      'Member ID',
      'Full Name',
      'Register Number',
      'Department',
      'Section',
      'Year',
      'Email',
      'Phone',
      'Status',
      'Role',
      'Joined Date',
    ];

    const rows = res.rows.map((r) => [
      r.id,
      r.full_name,
      r.register_number,
      r.department,
      r.class_section,
      r.year,
      r.college_email,
      r.phone || '',
      r.status,
      r.role,
      r.joined_at ? new Date(r.joined_at).toISOString() : '',
    ]);

    // Log export
    await auditService.logAction({
      actorId: actor.userId,
      action: 'DATA_EXPORT',
      entityType: 'MEMBER',
      entityId: 'ALL',
      afterData: { exportType: 'members_csv', recordCount: rows.length },
      ipAddress: actor.ip,
      userAgent: actor.userAgent,
    });

    return formatCsv(headers, rows);
  },

  exportEvents: async (actor: AdminActor): Promise<string> => {
    const res = await pool.query(`
      SELECT 
        e.id,
        e.title,
        e.event_type,
        e.start_at,
        e.end_at,
        e.location,
        e.capacity,
        e.status,
        COUNT(er.id)::int as registrations_count,
        COUNT(CASE WHEN er.status = 'ATTENDED' THEN 1 END)::int as attended_count
      FROM events e
      LEFT JOIN event_registrations er ON er.event_id = e.id
      GROUP BY e.id, e.title, e.event_type, e.start_at, e.end_at, e.location, e.capacity, e.status
      ORDER BY e.start_at DESC
    `);

    const headers = [
      'Event ID',
      'Title',
      'Type',
      'Start Time',
      'End Time',
      'Location',
      'Capacity',
      'Status',
      'Total Registrations',
      'Total Attended',
    ];

    const rows = res.rows.map((r) => [
      r.id,
      r.title,
      r.event_type,
      r.start_at ? new Date(r.start_at).toISOString() : '',
      r.end_at ? new Date(r.end_at).toISOString() : '',
      r.location || '',
      r.capacity,
      r.status,
      r.registrations_count,
      r.attended_count,
    ]);

    await auditService.logAction({
      actorId: actor.userId,
      action: 'DATA_EXPORT',
      entityType: 'EVENT',
      entityId: 'ALL',
      afterData: { exportType: 'events_csv', recordCount: rows.length },
      ipAddress: actor.ip,
      userAgent: actor.userAgent,
    });

    return formatCsv(headers, rows);
  },

  exportAttendance: async (actor: AdminActor, eventId?: string): Promise<string> => {
    const conditions = ['1=1'];
    const params: any[] = [];
    if (eventId) {
      conditions.push(`e.id = $1`);
      params.push(eventId);
    }

    const res = await pool.query(`
      SELECT 
        er.id as registration_id,
        e.title as event_title,
        e.start_at as event_date,
        m.full_name as member_name,
        m.register_number,
        m.department,
        m.college_email,
        COALESCE(ea.status, er.status) as attendance_status,
        er.registered_at,
        ea.checked_in_at as attended_at
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      JOIN members m ON er.member_id = m.id
      LEFT JOIN event_attendance ea ON (ea.event_id = e.id AND ea.member_id = m.id)
      WHERE ${conditions.join(' AND ')}
      ORDER BY e.start_at DESC, m.full_name ASC
    `, params);

    const headers = [
      'Registration ID',
      'Event Title',
      'Event Date',
      'Member Name',
      'Register Number',
      'Department',
      'Email',
      'Attendance Status',
      'Registered At',
      'Attended At',
    ];

    const rows = res.rows.map((r) => [
      r.registration_id,
      r.event_title,
      r.event_date ? new Date(r.event_date).toISOString() : '',
      r.member_name,
      r.register_number,
      r.department,
      r.college_email,
      r.attendance_status,
      r.registered_at ? new Date(r.registered_at).toISOString() : '',
      r.attended_at ? new Date(r.attended_at).toISOString() : '',
    ]);

    await auditService.logAction({
      actorId: actor.userId,
      action: 'DATA_EXPORT',
      entityType: 'ATTENDANCE',
      entityId: eventId || 'ALL',
      afterData: { exportType: 'attendance_csv', recordCount: rows.length },
      ipAddress: actor.ip,
      userAgent: actor.userAgent,
    });

    return formatCsv(headers, rows);
  },

  exportCourseEnrollments: async (actor: AdminActor): Promise<string> => {
    const res = await pool.query(`
      SELECT 
        ce.id as enrollment_id,
        c.title as course_title,
        c.category,
        m.full_name as member_name,
        m.register_number,
        m.department,
        ce.status,
        (CASE WHEN UPPER(ce.status) = 'COMPLETED' THEN 100 ELSE 0 END) as progress_percentage,
        ce.enrolled_at,
        ce.completed_at
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      JOIN members m ON ce.member_id = m.id
      ORDER BY ce.enrolled_at DESC
    `);

    const headers = [
      'Enrollment ID',
      'Course Title',
      'Category',
      'Member Name',
      'Register Number',
      'Department',
      'Status',
      'Progress %',
      'Enrolled At',
      'Completed At',
    ];

    const rows = res.rows.map((r) => [
      r.enrollment_id,
      r.course_title,
      r.category,
      r.member_name,
      r.register_number,
      r.department,
      r.status,
      r.progress_percentage,
      r.enrolled_at ? new Date(r.enrolled_at).toISOString() : '',
      r.completed_at ? new Date(r.completed_at).toISOString() : '',
    ]);

    await auditService.logAction({
      actorId: actor.userId,
      action: 'DATA_EXPORT',
      entityType: 'COURSE_ENROLLMENT',
      entityId: 'ALL',
      afterData: { exportType: 'course_enrollments_csv', recordCount: rows.length },
      ipAddress: actor.ip,
      userAgent: actor.userAgent,
    });

    return formatCsv(headers, rows);
  },

  exportAchievements: async (actor: AdminActor): Promise<string> => {
    const res = await pool.query(`
      SELECT 
        ma.id as grant_id,
        a.title as achievement_title,
        a.category,
        a.points,
        m.full_name as member_name,
        m.register_number,
        m.department,
        ma.earned_at
      FROM member_achievements ma
      JOIN achievements a ON ma.achievement_id = a.id
      JOIN members m ON ma.member_id = m.id
      ORDER BY ma.earned_at DESC
    `);

    const headers = [
      'Grant ID',
      'Achievement Title',
      'Category',
      'Points',
      'Member Name',
      'Register Number',
      'Department',
      'Earned At',
    ];

    const rows = res.rows.map((r) => [
      r.grant_id,
      r.achievement_title,
      r.category,
      r.points,
      r.member_name,
      r.register_number,
      r.department,
      r.earned_at ? new Date(r.earned_at).toISOString() : '',
    ]);

    await auditService.logAction({
      actorId: actor.userId,
      action: 'DATA_EXPORT',
      entityType: 'ACHIEVEMENT',
      entityId: 'ALL',
      afterData: { exportType: 'achievements_csv', recordCount: rows.length },
      ipAddress: actor.ip,
      userAgent: actor.userAgent,
    });

    return formatCsv(headers, rows);
  },
};
