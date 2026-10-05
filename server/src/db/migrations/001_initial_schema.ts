import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  await client.query(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'admin')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Members profile table
    CREATE TABLE IF NOT EXISTS members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      register_number VARCHAR(100) UNIQUE NOT NULL,
      department VARCHAR(100) NOT NULL,
      class_section VARCHAR(50) NOT NULL,
      year INT NOT NULL,
      college_email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      status VARCHAR(50) NOT NULL DEFAULT 'Active',
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Achievements table
    CREATE TABLE IF NOT EXISTS achievements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      student_name VARCHAR(255),
      team_name VARCHAR(255),
      organization VARCHAR(255),
      event_name VARCHAR(255),
      date DATE,
      year INT,
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Achievement Membership (Many-to-Many for team achievements)
    CREATE TABLE IF NOT EXISTS achievement_members (
      achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
      member_id UUID REFERENCES members(id) ON DELETE CASCADE,
      PRIMARY KEY (achievement_id, member_id)
    );

    -- AI & Tech Updates table
    CREATE TABLE IF NOT EXISTS updates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      summary TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      source VARCHAR(255) NOT NULL,
      published_at DATE NOT NULL,
      read_time VARCHAR(50),
      content TEXT,
      external_source_url VARCHAR(1000),
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Projects table
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      short_description TEXT NOT NULL,
      overview TEXT,
      problem TEXT,
      approach TEXT,
      category VARCHAR(100) NOT NULL,
      difficulty VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL,
      expected_outcome TEXT,
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Project Interests table
    CREATE TABLE IF NOT EXISTS project_interests (
      member_id UUID REFERENCES members(id) ON DELETE CASCADE,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (member_id, project_id)
    );

    -- Courses table
    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      provider VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      difficulty VARCHAR(50) NOT NULL,
      duration VARCHAR(100),
      course_url VARCHAR(1000),
      tracking_method VARCHAR(50) NOT NULL,
      tracking_status VARCHAR(50) NOT NULL,
      tracking_provider VARCHAR(255),
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Course Progress table
    CREATE TABLE IF NOT EXISTS course_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      member_id UUID REFERENCES members(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL,
      progress_percent INT, -- NULL means unknown
      completed_at TIMESTAMP WITH TIME ZONE,
      last_synced_at TIMESTAMP WITH TIME ZONE,
      tracking_method VARCHAR(50),
      verification_status VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (course_id, member_id)
    );

    -- Indexes
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_members_register_number ON members(register_number);
    CREATE INDEX idx_achievements_category ON achievements(category);
    CREATE INDEX idx_updates_published_at ON updates(published_at);
    CREATE INDEX idx_projects_status ON projects(status);
    CREATE INDEX idx_courses_category ON courses(category);
    CREATE INDEX idx_course_progress_member_course ON course_progress(member_id, course_id);
  `);
}

export async function down(client: PoolClient) {
  await client.query(`
    DROP TABLE IF EXISTS course_progress CASCADE;
    DROP TABLE IF EXISTS courses CASCADE;
    DROP TABLE IF EXISTS project_interests CASCADE;
    DROP TABLE IF EXISTS projects CASCADE;
    DROP TABLE IF EXISTS updates CASCADE;
    DROP TABLE IF EXISTS achievement_members CASCADE;
    DROP TABLE IF EXISTS achievements CASCADE;
    DROP TABLE IF EXISTS members CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
}
