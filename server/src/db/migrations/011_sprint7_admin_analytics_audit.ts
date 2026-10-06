import { PoolClient } from 'pg';

export async function up(client: PoolClient): Promise<void> {
  // 1. Expand users.role check constraint to include 'instructor' and 'super_admin'
  await client.query(`
    DO $$
    BEGIN
      -- Drop old check constraint on users.role if it exists
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      -- Re-add check constraint supporting student, instructor, admin, super_admin
      ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (LOWER(role) IN ('student', 'instructor', 'admin', 'super_admin'));
    EXCEPTION
      WHEN OTHERS THEN
        NULL;
    END $$;
  `);

  // 2. Add status column to users table if not exists (ACTIVE, INACTIVE, SUSPENDED)
  await client.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
  `);

  // 3. Add indexing to members for admin filtering & analytics
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_members_department ON members(department);
    CREATE INDEX IF NOT EXISTS idx_members_year ON members(year);
    CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
    CREATE INDEX IF NOT EXISTS idx_members_joined_at ON members(joined_at);
  `);

  // 4. Create audit_logs table
  await client.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(255) NOT NULL,
      before_data JSONB NULL,
      after_data JSONB NULL,
      ip_address VARCHAR(100) NULL,
      user_agent TEXT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
  `);

  // 5. Ensure performance indexes on existing domain tables for aggregate queries
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_events_status_start ON events(status, start_at);
    CREATE INDEX IF NOT EXISTS idx_event_reg_event_status ON event_registrations(event_id, status);
    CREATE INDEX IF NOT EXISTS idx_event_reg_member ON event_registrations(member_id);
    CREATE INDEX IF NOT EXISTS idx_projects_status_created ON projects(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_project_teams_project ON project_teams(project_id);
    CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id, status);
    CREATE INDEX IF NOT EXISTS idx_course_enrollments_member ON course_enrollments(member_id);
    CREATE INDEX IF NOT EXISTS idx_member_achievements_member ON member_achievements(member_id);
    CREATE INDEX IF NOT EXISTS idx_member_achievements_earned ON member_achievements(earned_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
  `);
}

export async function down(client: PoolClient): Promise<void> {
  await client.query(`
    DROP TABLE IF EXISTS audit_logs CASCADE;
    DROP INDEX IF EXISTS idx_users_role;
    DROP INDEX IF EXISTS idx_users_status;
    DROP INDEX IF EXISTS idx_members_department;
    DROP INDEX IF EXISTS idx_members_year;
    DROP INDEX IF EXISTS idx_members_status;
    DROP INDEX IF EXISTS idx_members_joined_at;
  `);
}
