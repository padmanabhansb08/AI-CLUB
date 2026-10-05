import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      start_at TIMESTAMP WITH TIME ZONE NOT NULL,
      end_at TIMESTAMP WITH TIME ZONE NOT NULL,
      location VARCHAR(255),
      meeting_url VARCHAR(255),
      organizer VARCHAR(255),
      capacity INTEGER,
      status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
      registration_open_at TIMESTAMP WITH TIME ZONE,
      registration_close_at TIMESTAMP WITH TIME ZONE,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_dates CHECK (start_at < end_at)
    );

    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

    CREATE TABLE IF NOT EXISTS event_registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) NOT NULL DEFAULT 'registered',
      UNIQUE(event_id, member_id)
    );

    CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
    CREATE INDEX IF NOT EXISTS idx_event_registrations_member ON event_registrations(member_id);
  `);
}

export async function down(client: PoolClient) {
  await client.query(`
    DROP TABLE IF EXISTS event_registrations CASCADE;
    DROP TABLE IF EXISTS events CASCADE;
  `);
}
