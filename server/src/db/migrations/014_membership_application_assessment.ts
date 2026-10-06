import { PoolClient } from 'pg';

export async function up(client: PoolClient): Promise<void> {
  // 1. Assessment Questions Bank
  await client.query(`
    CREATE TABLE IF NOT EXISTS assessment_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
      category VARCHAR(100) NOT NULL,
      difficulty VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
      explanation TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_assessment_questions_category ON assessment_questions(category);
    CREATE INDEX IF NOT EXISTS idx_assessment_questions_is_active ON assessment_questions(is_active);
    CREATE INDEX IF NOT EXISTS idx_assessment_questions_difficulty ON assessment_questions(difficulty);
  `);

  // 2. Membership Applications
  await client.query(`
    CREATE TABLE IF NOT EXISTS membership_applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      member_id UUID REFERENCES members(id) ON DELETE SET NULL,
      application_number VARCHAR(50) UNIQUE NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'TEST_REQUIRED' 
        CHECK (status IN ('DRAFT', 'TEST_REQUIRED', 'TEST_IN_PROGRESS', 'TEST_COMPLETED', 'UNDER_REVIEW', 'APPROVED', 'WAITLISTED', 'REJECTED', 'WITHDRAWN')),
      test_attempt_id UUID,
      final_score INT,
      score_percentage NUMERIC(5, 2),
      passed BOOLEAN,
      submitted_at TIMESTAMPTZ,
      reviewed_at TIMESTAMPTZ,
      reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
      admin_notes TEXT,
      rejection_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_membership_apps_user_id ON membership_applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_membership_apps_status ON membership_applications(status);
    CREATE INDEX IF NOT EXISTS idx_membership_apps_number ON membership_applications(application_number);
    CREATE INDEX IF NOT EXISTS idx_membership_apps_created_at ON membership_applications(created_at DESC);
  `);

  // 3. Assessment Attempts
  await client.query(`
    CREATE TABLE IF NOT EXISTS assessment_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID NOT NULL REFERENCES membership_applications(id) ON DELETE CASCADE,
      student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS' 
        CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'EXPIRED')),
      started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMPTZ NOT NULL,
      submitted_at TIMESTAMPTZ,
      question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      total_questions INT NOT NULL DEFAULT 25,
      correct_answers INT DEFAULT 0,
      wrong_answers INT DEFAULT 0,
      unanswered INT DEFAULT 25,
      score INT DEFAULT 0,
      percentage NUMERIC(5, 2) DEFAULT 0,
      passed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_assessment_attempts_app_id ON assessment_attempts(application_id);
    CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student_id ON assessment_attempts(student_id);
    CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON assessment_attempts(status);
  `);

  // Link test_attempt_id foreign key back to assessment_attempts
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_membership_app_attempt'
      ) THEN
        ALTER TABLE membership_applications
          ADD CONSTRAINT fk_membership_app_attempt
          FOREIGN KEY (test_attempt_id) REFERENCES assessment_attempts(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  // 4. Assessment Answers (Auto-saved & Evaluated server-side)
  await client.query(`
    CREATE TABLE IF NOT EXISTS assessment_answers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
      selected_option VARCHAR(1) CHECK (selected_option IN ('A', 'B', 'C', 'D')),
      is_correct BOOLEAN,
      answered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
    );

    CREATE INDEX IF NOT EXISTS idx_assessment_answers_attempt ON assessment_answers(attempt_id);
  `);

  // 5. Club Memberships (Distinct domain for official membership lifecycle)
  await client.query(`
    CREATE TABLE IF NOT EXISTS club_memberships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      member_id UUID REFERENCES members(id) ON DELETE SET NULL,
      member_number VARCHAR(50) UNIQUE NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
      joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
      application_id UUID REFERENCES membership_applications(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_club_memberships_user ON club_memberships(user_id);
    CREATE INDEX IF NOT EXISTS idx_club_memberships_status ON club_memberships(status);
    CREATE INDEX IF NOT EXISTS idx_club_memberships_number ON club_memberships(member_number);
  `);

  // 6. Backward Compatibility: Migrate existing approved demo members into club_memberships
  await client.query(`
    INSERT INTO club_memberships (user_id, member_id, member_number, status, joined_at)
    SELECT 
      m.user_id,
      m.id,
      'AIC-M-2026-' || LPAD((ROW_NUMBER() OVER (ORDER BY m.joined_at, m.id))::text, 5, '0'),
      'ACTIVE',
      COALESCE(m.joined_at, CURRENT_TIMESTAMP)
    FROM members m
    WHERE m.user_id IS NOT NULL
    ON CONFLICT (user_id) DO NOTHING;
  `);
}

export async function down(client: PoolClient): Promise<void> {
  await client.query(`
    DROP TABLE IF EXISTS assessment_answers CASCADE;
    DROP TABLE IF EXISTS assessment_attempts CASCADE;
    DROP TABLE IF EXISTS club_memberships CASCADE;
    DROP TABLE IF EXISTS membership_applications CASCADE;
    DROP TABLE IF EXISTS assessment_questions CASCADE;
  `);
}
