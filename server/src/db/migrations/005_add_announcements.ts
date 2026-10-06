import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  // Announcements Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(200) NOT NULL,
      body TEXT NOT NULL,
      category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'event', 'project', 'workshop', 'hackathon', 'recruitment', 'deadline', 'achievement', 'important')),
      priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
      status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
      published_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_announcements_status_published ON announcements(status, published_at);
    CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
    CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON announcements(expires_at);

    -- Member Read State
    CREATE TABLE IF NOT EXISTS announcement_reads (
      announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (announcement_id, member_id)
    );

    CREATE INDEX IF NOT EXISTS idx_announcement_reads_member_id_read_at ON announcement_reads(member_id, read_at);
  `);
}

export async function down(client: PoolClient) {
  await client.query(`
    DROP TABLE IF EXISTS announcement_reads CASCADE;
    DROP TABLE IF EXISTS announcements CASCADE;
  `);
}
