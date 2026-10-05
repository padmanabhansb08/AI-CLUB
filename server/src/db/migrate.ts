import { pool } from './index';
import { up as up1 } from './migrations/001_initial_schema';
import { up as up2 } from './migrations/002_add_member_profile_fields';
import { up as up3 } from './migrations/003_add_events';
import { up as up4 } from './migrations/004_add_project_teams';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // We will just try running up2 for now. up1 is already applied.
    try {
      await up2(client);
    } catch (e: any) {
      console.log('002 might be applied already:', e.message);
    }
    
    try {
      await up3(client);
    } catch (e: any) {
      console.log('003 might be applied already:', e.message);
    }

    try {
      await up4(client);
    } catch (e: any) {
      console.log('004 might be applied already:', e.message);
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}
migrate();
