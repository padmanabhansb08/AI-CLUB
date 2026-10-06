import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  await client.query(`
    -- 1. Add profile_photo_url to members
    ALTER TABLE members
    ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(1000);

    -- 2. Create normalized skills table
    CREATE TABLE IF NOT EXISTS skills (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'Engineering',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Create member_skills junction table
    CREATE TABLE IF NOT EXISTS member_skills (
      member_id UUID REFERENCES members(id) ON DELETE CASCADE,
      skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
      proficiency VARCHAR(50) NOT NULL DEFAULT 'INTERMEDIATE' CHECK (proficiency IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (member_id, skill_id)
    );

    -- 4. Create normalized interests table
    CREATE TABLE IF NOT EXISTS interests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'Technical',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Create member_interests junction table
    CREATE TABLE IF NOT EXISTS member_interests (
      member_id UUID REFERENCES members(id) ON DELETE CASCADE,
      interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (member_id, interest_id)
    );

    -- 6. Performance indexes
    CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
    CREATE INDEX IF NOT EXISTS idx_members_department ON members(department);
    CREATE INDEX IF NOT EXISTS idx_member_skills_member_id ON member_skills(member_id);
    CREATE INDEX IF NOT EXISTS idx_member_skills_skill_id ON member_skills(skill_id);
    CREATE INDEX IF NOT EXISTS idx_member_interests_member_id ON member_interests(member_id);
    CREATE INDEX IF NOT EXISTS idx_member_interests_interest_id ON member_interests(interest_id);

    -- 7. Seed standard curated catalog of skills
    INSERT INTO skills (name, category) VALUES
      ('Python', 'AI & Machine Learning'),
      ('PyTorch', 'AI & Machine Learning'),
      ('TensorFlow', 'AI & Machine Learning'),
      ('Scikit-Learn', 'AI & Machine Learning'),
      ('OpenCV', 'Computer Vision'),
      ('Transformers', 'Natural Language Processing'),
      ('LangChain', 'Generative AI'),
      ('TypeScript', 'Web Development'),
      ('React', 'Web Development'),
      ('Next.js', 'Web Development'),
      ('Node.js', 'Web Development'),
      ('FastAPI', 'Backend & Cloud'),
      ('PostgreSQL', 'Databases'),
      ('MongoDB', 'Databases'),
      ('Docker', 'DevOps & Cloud'),
      ('Kubernetes', 'DevOps & Cloud'),
      ('Git', 'Tools & Workflow'),
      ('Linux', 'Tools & Workflow'),
      ('C++', 'Systems & Performance'),
      ('Rust', 'Systems & Performance')
    ON CONFLICT (name) DO NOTHING;

    -- 8. Seed standard curated catalog of technical interests
    INSERT INTO interests (name, category) VALUES
      ('Artificial Intelligence', 'Core AI'),
      ('Machine Learning', 'Core AI'),
      ('Deep Learning', 'Core AI'),
      ('Generative AI', 'Specialized AI'),
      ('Computer Vision', 'Specialized AI'),
      ('Natural Language Processing', 'Specialized AI'),
      ('Robotics', 'Applied AI'),
      ('Data Science', 'Data & Analytics'),
      ('Cloud Computing', 'Infrastructure'),
      ('Cybersecurity', 'Infrastructure'),
      ('Web Development', 'Software Engineering'),
      ('Mobile Development', 'Software Engineering'),
      ('Research', 'Academia & Research')
    ON CONFLICT (name) DO NOTHING;
  `);

  // 9. Migrate existing text[] skills and technical_interests into normalized tables
  const members = await client.query('SELECT id, skills, technical_interests FROM members');
  for (const row of members.rows) {
    if (Array.isArray(row.skills) && row.skills.length > 0) {
      for (const skillName of row.skills) {
        if (!skillName || typeof skillName !== 'string') continue;
        const trimmed = skillName.trim();
        if (!trimmed) continue;
        // Ensure skill exists in catalog
        const skillRes = await client.query(
          `INSERT INTO skills (name, category) VALUES ($1, 'General') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [trimmed]
        );
        const skillId = skillRes.rows[0].id;
        await client.query(
          `INSERT INTO member_skills (member_id, skill_id, proficiency) VALUES ($1, $2, 'INTERMEDIATE') ON CONFLICT DO NOTHING`,
          [row.id, skillId]
        );
      }
    }

    if (Array.isArray(row.technical_interests) && row.technical_interests.length > 0) {
      for (const interestName of row.technical_interests) {
        if (!interestName || typeof interestName !== 'string') continue;
        const trimmed = interestName.trim();
        if (!trimmed) continue;
        const interestRes = await client.query(
          `INSERT INTO interests (name, category) VALUES ($1, 'Technical') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [trimmed]
        );
        const interestId = interestRes.rows[0].id;
        await client.query(
          `INSERT INTO member_interests (member_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [row.id, interestId]
        );
      }
    }
  }
}

export async function down(client: PoolClient) {
  await client.query(`
    DROP TABLE IF EXISTS member_interests;
    DROP TABLE IF EXISTS interests;
    DROP TABLE IF EXISTS member_skills;
    DROP TABLE IF EXISTS skills;
    ALTER TABLE members DROP COLUMN IF EXISTS profile_photo_url;
  `);
}
