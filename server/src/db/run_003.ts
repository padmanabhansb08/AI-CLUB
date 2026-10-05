import { pool } from './index';
import { up as up3 } from './migrations/003_add_events';

async function migrate() {
  const client = await pool.connect();
  try {
    await up3(client);
    console.log('Migration 003 completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}
migrate();
