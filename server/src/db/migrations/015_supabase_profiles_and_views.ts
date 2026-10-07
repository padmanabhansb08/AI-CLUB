import { PoolClient } from 'pg';

export async function up(client: PoolClient): Promise<void> {
  // 1. Assessment Attempt Questions Table (stores explicit randomized question order)
  await client.query(`
    CREATE TABLE IF NOT EXISTS assessment_attempt_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE RESTRICT,
      question_order INT NOT NULL CHECK (question_order BETWEEN 1 AND 25),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_attempt_question_pair UNIQUE(attempt_id, question_id),
      CONSTRAINT uq_attempt_question_order UNIQUE(attempt_id, question_order)
    );

    CREATE INDEX IF NOT EXISTS idx_attempt_questions_attempt_id ON assessment_attempt_questions(attempt_id);
  `);

  // 2. Safe View: student_assessment_questions (strictly omits correct_option and explanation)
  await client.query(`
    CREATE OR REPLACE VIEW student_assessment_questions AS
    SELECT 
      id,
      question,
      category,
      difficulty,
      option_a,
      option_b,
      option_c,
      option_d,
      created_at
    FROM assessment_questions
    WHERE is_active = true;
  `);

  // 3. Supabase-compatible profiles view
  await client.query(`
    CREATE OR REPLACE VIEW profiles AS
    SELECT 
      u.id,
      u.id AS user_id,
      COALESCE(m.full_name, split_part(u.email, '@', 1)) AS full_name,
      u.email,
      m.phone,
      m.department,
      m.year,
      m.class_section AS section,
      m.profile_photo_url AS avatar_url,
      m.bio,
      m.github_url,
      m.linkedin_url,
      m.portfolio_url,
      u.role,
      COALESCE(m.status, 'Applicant') AS membership_status,
      u.created_at,
      u.updated_at
    FROM users u
    LEFT JOIN members m ON m.user_id = u.id;
  `);
}

export async function down(client: PoolClient): Promise<void> {
  await client.query(`
    DROP VIEW IF EXISTS profiles CASCADE;
    DROP VIEW IF EXISTS student_assessment_questions CASCADE;
    DROP TABLE IF EXISTS assessment_attempt_questions CASCADE;
  `);
}
