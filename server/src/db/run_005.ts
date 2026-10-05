import { pool } from './index';
import * as m5 from './migrations/005_add_announcements';

async function run() {
  try {
    console.log('Running 005...');
    await m5.up(pool);
    console.log('Done 005');
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
