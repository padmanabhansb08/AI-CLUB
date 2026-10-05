import { pool } from './index';
import * as m1 from './migrations/001_initial_schema';
import * as m2 from './migrations/002_add_member_profile_fields';
import * as m3 from './migrations/003_add_events';
import * as m4 from './migrations/004_add_project_teams';
import * as m5 from './migrations/005_add_announcements';
import * as m6 from './migrations/006_sprint2_skills_interests_profile';

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

    if (count === 0) {
      console.log('[migrate] Database is up to date. No pending migrations.');
    } else {
      console.log(`[migrate] Successfully executed ${count} migration(s).`);
    }
  } finally {
    client.release();
  }
}

// Run directly when invoked as a script
if (require.main === module || process.argv[1]?.endsWith('migrate.ts')) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[migrate] Migration process failed:', err);
      await pool.end();
      process.exit(1);
    });
}
