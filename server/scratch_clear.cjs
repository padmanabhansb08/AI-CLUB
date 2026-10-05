const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://aiclub:password@localhost:5433/aiclub_db' });

async function clear() {
  await pool.query("DELETE FROM users WHERE email = 'api-test-student@example.edu'");
  pool.end();
}
clear();
