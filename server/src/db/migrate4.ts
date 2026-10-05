import { pool } from './index';
import { up } from './migrations/004_add_project_teams';

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await up(client);
    await client.query('COMMIT');
    console.log('004 applied successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to apply 004:', e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
