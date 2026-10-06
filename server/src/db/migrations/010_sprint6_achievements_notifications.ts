import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  await client.query(`
    -- 1. Extend achievements table for data-driven criteria and gamification
    ALTER TABLE achievements
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
      ADD COLUMN IF NOT EXISTS icon VARCHAR(100) DEFAULT 'Award',
      ADD COLUMN IF NOT EXISTS criteria_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS criteria_config JSONB DEFAULT '{"target": 1}'::jsonb,
      ADD COLUMN IF NOT EXISTS points INT DEFAULT 10,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

    -- Backfill name from title if missing, and sync title
    UPDATE achievements
    SET
      name = COALESCE(name, title, 'Club Achievement'),
      title = COALESCE(title, name, 'Club Achievement'),
      slug = COALESCE(slug, LOWER(REGEXP_REPLACE(COALESCE(name, title, 'ach'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 4)),
      category = COALESCE(category, 'SPECIAL'),
      criteria_type = COALESCE(criteria_type, 'HACKATHON_PARTICIPATION'),
      criteria_config = COALESCE(criteria_config, '{"target": 1}'::jsonb),
      points = COALESCE(points, 10),
      is_active = COALESCE(is_active, true)
    WHERE slug IS NULL OR name IS NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_achievements_slug ON achievements(slug);
    CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
    CREATE INDEX IF NOT EXISTS idx_achievements_is_active ON achievements(is_active);

    -- 2. Member Achievements (relational tracking of unlocked recognition)
    CREATE TABLE IF NOT EXISTS member_achievements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
      earned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB DEFAULT '{}'::jsonb,
      CONSTRAINT unique_member_achievement UNIQUE(member_id, achievement_id)
    );

    CREATE INDEX IF NOT EXISTS idx_member_achievements_member ON member_achievements(member_id);
    CREATE INDEX IF NOT EXISTS idx_member_achievements_achievement ON member_achievements(achievement_id);
    CREATE INDEX IF NOT EXISTS idx_member_achievements_earned ON member_achievements(earned_at);

    -- Backfill from legacy achievement_members if exists
    DO $$
    BEGIN
      IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'achievement_members') THEN
        INSERT INTO member_achievements (member_id, achievement_id, earned_at)
        SELECT member_id, achievement_id, CURRENT_TIMESTAMP
        FROM achievement_members
        ON CONFLICT DO NOTHING;
      END IF;
    END $$;

    -- 3. Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      recipient_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      type VARCHAR(100) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      data JSONB DEFAULT '{}'::jsonb,
      priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
      read_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(recipient_id, read_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(recipient_id, created_at DESC);

    -- 4. Notification Preferences
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE UNIQUE,
      event_notifications BOOLEAN NOT NULL DEFAULT true,
      project_notifications BOOLEAN NOT NULL DEFAULT true,
      team_notifications BOOLEAN NOT NULL DEFAULT true,
      course_notifications BOOLEAN NOT NULL DEFAULT true,
      achievement_notifications BOOLEAN NOT NULL DEFAULT true,
      system_notifications BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_notification_preferences_member ON notification_preferences(member_id);

    -- 5. Member Activity table
    CREATE TABLE IF NOT EXISTS member_activity (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      activity_type VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id UUID,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_member_activity_member ON member_activity(member_id, created_at DESC);

    -- 6. Seed Standard Platform Achievements
    INSERT INTO achievements (name, title, slug, description, category, criteria_type, criteria_config, points, icon, is_active)
    VALUES
      ('First Event', 'First Event', 'first-event', 'Attended your first AI CLUB workshop, technical seminar or community session.', 'EVENT', 'EVENT_ATTENDANCE_COUNT', '{"target": 1}'::jsonb, 10, 'Calendar', true),
      ('Event Explorer', 'Event Explorer', 'event-explorer', 'Attended 3 or more club workshops, tech talks, and symposiums.', 'EVENT', 'EVENT_ATTENDANCE_COUNT', '{"target": 3}'::jsonb, 30, 'Compass', true),
      ('Workshop Regular', 'Workshop Regular', 'workshop-regular', 'Attended 5 or more technical workshops demonstrating continuous learning.', 'EVENT', 'EVENT_ATTENDANCE_COUNT', '{"target": 5}'::jsonb, 50, 'Award', true),
      ('Course Starter', 'Course Starter', 'course-starter', 'Enrolled in your first learning course and begun your AI skill track.', 'LEARNING', 'COURSE_ENROLLMENT_COUNT', '{"target": 1}'::jsonb, 10, 'BookOpen', true),
      ('Course Completer', 'Course Completer', 'course-completer', 'Completed 100% of all syllabus modules and lessons for an AI CLUB course.', 'LEARNING', 'COURSE_COMPLETION_COUNT', '{"target": 1}'::jsonb, 50, 'GraduationCap', true),
      ('Lesson Master', 'Lesson Master', 'lesson-master', 'Completed 5 lessons across club curriculum modules.', 'LEARNING', 'LESSON_COMPLETION_COUNT', '{"target": 5}'::jsonb, 25, 'CheckCircle2', true),
      ('Project Contributor', 'Project Contributor', 'project-contributor', 'Joined and actively contributed to an engineering or research club project.', 'PROJECT', 'PROJECT_COUNT', '{"target": 1}'::jsonb, 20, 'FolderGit2', true),
      ('Project Finisher', 'Project Finisher', 'project-finisher', 'Completed an AI CLUB engineering initiative to 100% milestone progress.', 'PROJECT', 'PROJECT_COMPLETION_COUNT', '{"target": 1}'::jsonb, 100, 'Trophy', true),
      ('Team Player', 'Team Player', 'team-player', 'Formed or collaborated inside a specialized project team pod.', 'TEAM', 'TEAM_PARTICIPATION_COUNT', '{"target": 1}'::jsonb, 25, 'Users', true),
      ('Milestone Crusher', 'Milestone Crusher', 'milestone-crusher', 'Successfully completed 2 or more major project milestones.', 'MILESTONE', 'MILESTONE_COMPLETION_COUNT', '{"target": 2}'::jsonb, 30, 'Sparkles', true)
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      criteria_type = EXCLUDED.criteria_type,
      criteria_config = EXCLUDED.criteria_config,
      points = EXCLUDED.points,
      icon = EXCLUDED.icon,
      is_active = EXCLUDED.is_active;
  `);
}

export async function down(client: PoolClient) {
  await client.query(`
    DROP TABLE IF EXISTS member_activity CASCADE;
    DROP TABLE IF EXISTS notification_preferences CASCADE;
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP TABLE IF EXISTS member_achievements CASCADE;
  `);
}
