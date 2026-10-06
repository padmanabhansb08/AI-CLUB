import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  await client.query(`
    -- 1. Extend events table
    ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

    -- Add validation check on registration dates if not present
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_reg_dates'
      ) THEN
        ALTER TABLE events
          ADD CONSTRAINT valid_reg_dates 
          CHECK (registration_open_at IS NULL OR registration_close_at IS NULL OR registration_open_at < registration_close_at);
      END IF;
    END $$;

    -- Additional event indexes
    CREATE INDEX IF NOT EXISTS idx_events_reg_open ON events(registration_open_at);
    CREATE INDEX IF NOT EXISTS idx_events_reg_close ON events(registration_close_at);

    -- 2. Extend event_registrations table
    ALTER TABLE event_registrations
      ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

    -- Ensure status column defaults to uppercase 'REGISTERED' or allows standard statuses
    CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

    -- 3. Create event_attendance table
    CREATE TABLE IF NOT EXISTS event_attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      checked_out_at TIMESTAMP WITH TIME ZONE,
      marked_by UUID REFERENCES users(id) ON DELETE SET NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'present', 'absent', 'late')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_event_member_attendance UNIQUE(event_id, member_id)
    );

    CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON event_attendance(event_id);
    CREATE INDEX IF NOT EXISTS idx_event_attendance_member ON event_attendance(member_id);
    CREATE INDEX IF NOT EXISTS idx_event_attendance_status ON event_attendance(status);
  `);
}

export async function down(client: PoolClient) {
  await client.query(`
    DROP TABLE IF EXISTS event_attendance CASCADE;
    ALTER TABLE event_registrations 
      DROP COLUMN IF EXISTS cancellation_reason,
      DROP COLUMN IF EXISTS cancelled_at;
    ALTER TABLE events 
      DROP CONSTRAINT IF EXISTS valid_reg_dates,
      DROP COLUMN IF EXISTS cancellation_reason;
  `);
}
