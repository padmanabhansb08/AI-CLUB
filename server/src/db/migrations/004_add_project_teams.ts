import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  await client.query(`
    -- Project Teams
    CREATE TABLE IF NOT EXISTS project_teams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      max_members INT,
      status VARCHAR(50) NOT NULL DEFAULT 'forming', -- forming, active, closed, archived
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Project Team Members
    CREATE TABLE IF NOT EXISTS project_team_members (
      team_id UUID NOT NULL REFERENCES project_teams(id) ON DELETE CASCADE,
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      role VARCHAR(50) NOT NULL DEFAULT 'member', -- leader, member
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (team_id, member_id)
    );

    -- Indexes
    CREATE INDEX idx_project_teams_project_id ON project_teams(project_id);
    CREATE INDEX idx_project_teams_status ON project_teams(status);
  `);
}

export async function down(client: PoolClient) {
  await client.query(`
    DROP TABLE IF EXISTS project_team_members CASCADE;
    DROP TABLE IF EXISTS project_teams CASCADE;
  `);
}
