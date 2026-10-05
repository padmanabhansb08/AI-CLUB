const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://aiclub:password@localhost:5433/aiclub_db'
});

async function runTest() {
  const client = await pool.connect();
  try {
    
    // 1. Duplicate email
    try {
      await client.query(`
        INSERT INTO users (email, password_hash, role) 
        VALUES ('admin@college.edu', 'hash', 'student') 
      `);
      throw new Error('Duplicate email should have failed');
    } catch (e) {
      if (e.code === '23505') console.log('✅ Duplicate email constraint passed');
      else throw e;
    }

    // 2. Duplicate project interest
    try {
      // Find a member and project
      const memberRes = await client.query('SELECT id FROM members LIMIT 1');
      const projRes = await client.query('SELECT id FROM projects LIMIT 1');
      
      if (memberRes.rowCount > 0 && projRes.rowCount > 0) {
        await client.query(`
          INSERT INTO project_interests (member_id, project_id)
          VALUES ($1, $2)
        `, [memberRes.rows[0].id, projRes.rows[0].id]);
        
        await client.query(`
          INSERT INTO project_interests (member_id, project_id)
          VALUES ($1, $2)
        `, [memberRes.rows[0].id, projRes.rows[0].id]);
        
        throw new Error('Duplicate project interest should have failed');
      } else {
        console.log('⚠️ Could not test duplicate project interest (missing data)');
      }
    } catch (e) {
      if (e.code === '23505') console.log('✅ Duplicate project interest constraint passed');
      else throw e;
    }

    // 3. Invalid foreign key
    try {
      await client.query(`
        INSERT INTO project_interests (member_id, project_id)
        VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000')
      `);
      throw new Error('Invalid foreign key should have failed');
    } catch (e) {
      if (e.code === '23503') console.log('✅ Invalid foreign key constraint passed');
      else throw e;
    }

    // 4. Required field violation (NOT NULL)
    try {
      await client.query(`
        INSERT INTO courses (title, provider, category, difficulty, tracking_method, tracking_status)
        VALUES ('Test', 'Prov', 'AI', 'Beginner', 'api', 'Integration Available')
      `); // missing description
      throw new Error('NOT NULL constraint should have failed');
    } catch (e) {
      if (e.code === '23502') console.log('✅ NOT NULL constraint passed');
      else throw e;
    }

    // 5. Invalid enum/role (CHECK constraint)
    try {
      await client.query(`
        INSERT INTO users (email, password_hash, role) 
        VALUES ('test2@college.edu', 'hash', 'invalid_role') 
      `);
      throw new Error('CHECK constraint should have failed');
    } catch (e) {
      if (e.code === '23514') console.log('✅ CHECK constraint passed (invalid role)');
      else throw e;
    }

    console.log('--- Database constraints verified ---');
  } catch (e) {
    console.error('❌ Constraint test failed:', e);
  } finally {
    client.release();
    pool.end();
  }
}

runTest();
