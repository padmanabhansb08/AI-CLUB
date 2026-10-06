import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  await client.query(`
    -- 1. Extend courses table
    ALTER TABLE courses ALTER COLUMN provider DROP NOT NULL;
    ALTER TABLE courses ALTER COLUMN provider SET DEFAULT 'AI CLUB';
    ALTER TABLE courses ALTER COLUMN tracking_method DROP NOT NULL;
    ALTER TABLE courses ALTER COLUMN tracking_method SET DEFAULT 'INTERNAL';
    ALTER TABLE courses ALTER COLUMN tracking_status DROP NOT NULL;
    ALTER TABLE courses ALTER COLUMN tracking_status SET DEFAULT 'CONNECTED';

    ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
      ADD COLUMN IF NOT EXISTS short_description TEXT,
      ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(1000),
      ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES members(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
      ADD COLUMN IF NOT EXISTS estimated_duration_minutes INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English';

    -- Backfill slug, short_description, and default status for legacy seeded rows
    UPDATE courses
    SET
      short_description = COALESCE(short_description, SUBSTRING(description FROM 1 FOR 200)),
      slug = COALESCE(slug, LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 4)),
      status = COALESCE(status, 'PUBLISHED')
    WHERE slug IS NULL OR status IS NULL;

    CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
    CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty);
    CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
    CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

    -- 2. Create course_modules table
    CREATE TABLE IF NOT EXISTS course_modules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      position INT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_course_modules_course_pos ON course_modules(course_id, position);

    -- 3. Create course_lessons table
    CREATE TABLE IF NOT EXISTS course_lessons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255),
      description TEXT,
      content_type VARCHAR(50) NOT NULL DEFAULT 'ARTICLE',
      content TEXT,
      video_url VARCHAR(1000),
      external_url VARCHAR(1000),
      position INT NOT NULL DEFAULT 1,
      duration_minutes INT DEFAULT 0,
      is_preview BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_course_lessons_module_pos ON course_lessons(module_id, position);

    -- 4. Create course_enrollments table
    CREATE TABLE IF NOT EXISTS course_enrollments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'ENROLLED',
      enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMPTZ,
      last_accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_course_enrollment UNIQUE(course_id, member_id)
    );

    CREATE INDEX IF NOT EXISTS idx_course_enrollments_member ON course_enrollments(member_id, status);
    CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id, status);

    -- 5. Create lesson_progress table
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
      progress_percentage INT NOT NULL DEFAULT 0,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      last_accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_lesson_member_progress UNIQUE(lesson_id, member_id)
    );

    CREATE INDEX IF NOT EXISTS idx_lesson_progress_member_lesson ON lesson_progress(member_id, lesson_id);

    -- 6. Create course_skills table
    CREATE TABLE IF NOT EXISTS course_skills (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_course_skill UNIQUE(course_id, skill_id)
    );

    CREATE INDEX IF NOT EXISTS idx_course_skills_course ON course_skills(course_id);
  `);
}

export async function down(client: PoolClient) {
  await client.query(`
    DROP TABLE IF EXISTS course_skills CASCADE;
    DROP TABLE IF EXISTS lesson_progress CASCADE;
    DROP TABLE IF EXISTS course_enrollments CASCADE;
    DROP TABLE IF EXISTS course_lessons CASCADE;
    DROP TABLE IF EXISTS course_modules CASCADE;
  `);
}
