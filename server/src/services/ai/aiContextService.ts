import { query } from '../../db';
import { StudentAIContext } from '../../types/ai';

export class AIContextService {
  /**
   * Builds minimal, task-specific student context with strict data minimization
   */
  public static async buildStudentContext(memberId: string): Promise<StudentAIContext> {
    // 1. Profile information
    const memberRes = await query(
      `SELECT 
        m.id,
        m.department,
        m.year,
        m.skills,
        m.technical_interests as "technicalInterests"
       FROM members m
       WHERE m.id = $1`,
      [memberId]
    );

    const member = memberRes.rows[0];
    if (!member) {
      throw new Error(`Member with ID ${memberId} not found`);
    }

    // 2. Course enrollments & progress
    const coursesRes = await query(
      `SELECT 
        c.title,
        ce.status
       FROM course_enrollments ce
       JOIN courses c ON c.id = ce.course_id
       WHERE ce.member_id = $1`,
      [memberId]
    );

    const completedCourseTitles = coursesRes.rows
      .filter((c: any) => c.status?.toUpperCase() === 'COMPLETED')
      .map((c: any) => c.title);

    const activeCourseTitles = coursesRes.rows
      .filter((c: any) => c.status?.toUpperCase() !== 'COMPLETED' && c.status?.toUpperCase() !== 'DROPPED')
      .map((c: any) => c.title);

    // 3. Events attended
    const eventsRes = await query(
      `SELECT COUNT(*)::int as count
       FROM event_registrations
       WHERE member_id = $1 AND status = 'ATTENDED'`,
      [memberId]
    );

    // 4. Projects joined
    const projectsRes = await query(
      `SELECT p.title
       FROM project_memberships pm
       JOIN projects p ON p.id = pm.project_id
       WHERE pm.member_id = $1`,
      [memberId]
    );

    // 5. Earned achievements
    const achRes = await query(
      `SELECT a.title
       FROM member_achievements ma
       JOIN achievements a ON a.id = ma.achievement_id
       WHERE ma.member_id = $1`,
      [memberId]
    );

    return {
      memberId: member.id,
      department: member.department || 'General Engineering',
      year: member.year || 1,
      currentSkills: Array.isArray(member.skills) ? member.skills : [],
      interests: Array.isArray(member.technicalInterests) ? member.technicalInterests : [],
      coursesEnrolled: coursesRes.rows.length,
      coursesCompleted: completedCourseTitles.length,
      activeCourseTitles,
      completedCourseTitles,
      eventsAttended: eventsRes.rows[0]?.count || 0,
      projectTitles: projectsRes.rows.map((p: any) => p.title),
      earnedAchievements: achRes.rows.map((a: any) => a.title),
    };
  }
}
