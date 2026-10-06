import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  await client.query(`
    -- 1. Extend projects table
    ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS domain VARCHAR(100),
      ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES members(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS max_team_size INT DEFAULT 5,
      ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS target_end_date TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS github_url VARCHAR(1000),
      ADD COLUMN IF NOT EXISTS demo_url VARCHAR(1000),
      ADD COLUMN IF NOT EXISTS documentation_url VARCHAR(1000),
      ADD COLUMN IF NOT EXISTS cover_image VARCHAR(1000),
      ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS learning_outcomes JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS progress_percentage INT DEFAULT 0;

    -- Backfill description and domain if existing
    UPDATE projects
    SET 
      description = COALESCE(description, overview, short_description),
      domain = COALESCE(domain, category, 'OTHER'),
      slug = COALESCE(slug, LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')))
    WHERE description IS NULL OR domain IS NULL OR slug IS NULL;

    -- Add constraints if not present
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_project_dates'
      ) THEN
        ALTER TABLE projects
          ADD CONSTRAINT valid_project_dates
          CHECK (start_date IS NULL OR target_end_date IS NULL OR start_date <= target_end_date);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_project_team_size'
      ) THEN
        ALTER TABLE projects
          ADD CONSTRAINT valid_project_team_size
          CHECK (max_team_size IS NULL OR max_team_size >= 1);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_progress_percentage'
      ) THEN
        ALTER TABLE projects
          ADD CONSTRAINT valid_progress_percentage
          CHECK (progress_percentage IS NULL OR (progress_percentage >= 0 AND progress_percentage <= 100));
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_projects_domain ON projects(domain);
    CREATE INDEX IF NOT EXISTS idx_projects_difficulty ON projects(difficulty);
    CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

    -- 2. Create project_memberships table
    CREATE TABLE IF NOT EXISTS project_memberships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      joined_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_project_member UNIQUE(project_id, member_id)
    );

    CREATE INDEX IF NOT EXISTS idx_project_memberships_project ON project_memberships(project_id);
    CREATE INDEX IF NOT EXISTS idx_project_memberships_member ON project_memberships(member_id);
    CREATE INDEX IF NOT EXISTS idx_project_memberships_status ON project_memberships(status);

    -- 3. Extend project_teams table
    ALTER TABLE project_teams
      ADD COLUMN IF NOT EXISTS team_lead_id UUID REFERENCES members(id) ON DELETE SET NULL;

    UPDATE project_teams
    SET team_lead_id = created_by
    WHERE team_lead_id IS NULL;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_team_max_members'
      ) THEN
        ALTER TABLE project_teams
          ADD CONSTRAINT valid_team_max_members
          CHECK (max_members IS NULL OR max_members >= 1);
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_project_teams_team_lead ON project_teams(team_lead_id);

    -- 4. Extend project_team_members table
    ALTER TABLE project_team_members
      ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

    CREATE INDEX IF NOT EXISTS idx_project_team_members_status ON project_team_members(status);

    -- 5. Create team_invitations table
    CREATE TABLE IF NOT EXISTS team_invitations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID NOT NULL REFERENCES project_teams(id) ON DELETE CASCADE,
      invited_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      invited_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMPTZ,
      responded_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON team_invitations(team_id);
    CREATE INDEX IF NOT EXISTS idx_team_invitations_member ON team_invitations(invited_member_id);
    CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

    -- 6. Create project_milestones table
    CREATE TABLE IF NOT EXISTS project_milestones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      due_date TIMESTAMPTZ,
      status VARCHAR(50) NOT NULL DEFAULT 'TODO',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON project_milestones(project_id);
    CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON project_milestones(status);
    CREATE INDEX IF NOT EXISTS idx_project_milestones_due_date ON project_milestones(due_date);
  `);
}

export async function down(client: PoolClient) {
  await client.query(`
    DROP TABLE IF EXISTS project_milestones CASCADE;
    DROP TABLE IF EXISTS team_invitations CASCADE;
    DROP TABLE IF EXISTS project_memberships CASCADE;

    ALTER TABLE project_team_members
      DROP COLUMN IF EXISTS updated_at,
      DROP COLUMN IF EXISTS created_at,
      DROP COLUMN IF EXISTS status,
      DROP COLUMN IF EXISTS id;

    ALTER TABLE project_teams
      DROP CONSTRAINT IF EXISTS valid_team_max_members,
      DROP COLUMN IF EXISTS team_lead_id;

    ALTER TABLE projects
      DROP CONSTRAINT IF EXISTS valid_progress_percentage,
      DROP CONSTRAINT IF EXISTS valid_project_team_size,
      DROP CONSTRAINT IF EXISTS valid_project_dates,
      DROP COLUMN IF EXISTS progress_percentage,
      DROP COLUMN IF EXISTS learning_outcomes,
      DROP COLUMN IF EXISTS objectives,
      DROP COLUMN IF EXISTS requirements,
      DROP COLUMN IF EXISTS technologies,
      DROP COLUMN IF EXISTS cover_image,
      DROP COLUMN IF EXISTS documentation_url,
      DROP COLUMN IF EXISTS demo_url,
      DROP COLUMN IF EXISTS github_url,
      DROP COLUMN IF EXISTS target_end_date,
      DROP COLUMN IF EXISTS start_date,
      DROP COLUMN IF EXISTS max_team_size,
      DROP COLUMN IF EXISTS owner_id,
      DROP COLUMN IF EXISTS domain,
      DROP COLUMN IF EXISTS description,
      DROP COLUMN IF EXISTS slug;
  `);
}
