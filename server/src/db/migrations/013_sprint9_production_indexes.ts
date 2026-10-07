export async function up(client: any): Promise<void> {
  // 1. Composite indexes for LMS progress & enrollment lookups
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_course_enr_member_status 
      ON course_enrollments(member_id, status);
    CREATE INDEX IF NOT EXISTS idx_lesson_progress_member_status 
      ON lesson_progress(member_id, status);
  `);

  // 2. Composite indexes for Events, Registrations, and Attendance
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_event_reg_member_status 
      ON event_registrations(member_id, status);
    CREATE INDEX IF NOT EXISTS idx_event_attendance_member_status 
      ON event_attendance(member_id, status);
  `);

  // 3. Composite indexes for Projects and Teams Collaboration
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_project_memberships_member_status 
      ON project_memberships(member_id, status);
    CREATE INDEX IF NOT EXISTS idx_project_team_members_member_status 
      ON project_team_members(member_id, status);
  `);

  // 4. Filtered index for unread student notifications
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_unread_fast 
      ON notifications(recipient_id, read_at) 
      WHERE read_at IS NULL;
  `);

  // 5. Composite index for Administrative Audit Logs
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created 
      ON audit_logs(actor_id, created_at DESC);
  `);

  // 6. Composite index for AI Intelligence Conversations
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_ai_conv_member_updated 
      ON ai_conversations(member_id, updated_at DESC);
  `);
}

export async function down(client: any): Promise<void> {
  await client.query(`
    DROP INDEX IF EXISTS idx_course_enr_member_status;
    DROP INDEX IF EXISTS idx_lesson_progress_member_status;
    DROP INDEX IF EXISTS idx_event_reg_member_status;
    DROP INDEX IF EXISTS idx_event_attendance_member_status;
    DROP INDEX IF EXISTS idx_project_memberships_member_status;
    DROP INDEX IF EXISTS idx_project_team_members_member_status;
    DROP INDEX IF EXISTS idx_notifications_unread_fast;
    DROP INDEX IF EXISTS idx_audit_logs_actor_created;
    DROP INDEX IF EXISTS idx_ai_conv_member_updated;
  `);
}
