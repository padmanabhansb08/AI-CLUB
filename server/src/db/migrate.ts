import { pool } from './index';
import * as m1 from './migrations/001_initial_schema';
import * as m2 from './migrations/002_add_member_profile_fields';
import * as m3 from './migrations/003_add_events';
import * as m4 from './migrations/004_add_project_teams';
import * as m5 from './migrations/005_add_announcements';
import * as m6 from './migrations/006_sprint2_skills_interests_profile';
import * as m7 from './migrations/007_sprint3_events_registration_attendance';
import * as m8 from './migrations/008_sprint4_projects_teams_collaboration';
import * as m9 from './migrations/009_sprint5_courses_lms';
import * as m10 from './migrations/010_sprint6_achievements_notifications';
import * as m11 from './migrations/011_sprint7_admin_analytics_audit';
import * as security from './migrations/006_account_security';
import * as m12 from './migrations/012_sprint8_ai_intelligence_layer';
import * as m13 from './migrations/013_sprint9_production_indexes';
import * as m14 from './migrations/014_membership_application_assessment';
import * as m15 from './migrations/015_supabase_profiles_and_views';

interface Migration {
  name: string;
  up: (client: any) => Promise<void>;
  down?: (client: any) => Promise<void>;
}

const MIGRATIONS: Migration[] = [
  { name: '001_initial_schema', up: m1.up, down: m1.down },
  { name: '002_add_member_profile_fields', up: m2.up, down: m2.down },
  { name: '003_add_events', up: m3.up, down: m3.down },
  { name: '004_add_project_teams', up: m4.up, down: m4.down },
  { name: '005_add_announcements', up: m5.up, down: m5.down },
  { name: '006_sprint2_skills_interests_profile', up: m6.up, down: m6.down },
  { name: '007_sprint3_events_registration_attendance', up: m7.up, down: m7.down },
  { name: '008_sprint4_projects_teams_collaboration', up: m8.up, down: m8.down },
  { name: '009_sprint5_courses_lms', up: m9.up, down: m9.down },
  { name: '010_sprint6_achievements_notifications', up: m10.up, down: m10.down },
  { name: '011_sprint7_admin_analytics_audit', up: m11.up, down: m11.down },
  { name: '012_account_security', up: security.up, down: security.down },
  { name: '012_sprint8_ai_intelligence_layer', up: m12.up, down: m12.down },
  { name: '013_sprint9_production_indexes', up: m13.up, down: m13.down },
  { name: '014_membership_application_assessment', up: m14.up, down: m14.down },
  { name: '015_supabase_profiles_and_views', up: m15.up, down: m15.down },
];

export async function runMigrations() {
  const client = await pool.connect();
  try {
    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Fetch already executed migrations
    const res = await client.query('SELECT name FROM migrations ORDER BY id ASC');
    const executed = new Set(res.rows.map((r: { name: string }) => r.name));

    let count = 0;
    for (const migration of MIGRATIONS) {
      if (!executed.has(migration.name)) {
        console.log(`[migrate] Applying: ${migration.name}...`);
        await client.query('BEGIN');
        try {
          await migration.up(client);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
          await client.query('COMMIT');
          console.log(`[migrate] ✓ Successfully applied: ${migration.name}`);
          count++;
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[migrate] ✗ Failed to apply ${migration.name}:`, err);
          throw err;
        }
      } else {
        console.log(`[migrate] - Skipped (already applied): ${migration.name}`);
      }
    }

    console.log(`[migrate] Successfully executed ${count} migration(s).`);
  } catch (error) {
    console.error('[migrate] Migration process failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

if (require.main === module || process.argv[1]?.endsWith('migrate.ts')) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[migrate] Failed:', err);
      await pool.end();
      process.exit(1);
    });
}
