const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://aiclub:password@localhost:5433/aiclub_db'
});

async function runTest() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create test user
    const userRes = await client.query(`
      INSERT INTO users (email, password_hash, role) 
      VALUES ('test_cascade@college.edu', 'hash', 'student') 
      RETURNING id
    `);
    const userId = userRes.rows[0].id;
    
    // Create test member
    const memberRes = await client.query(`
      INSERT INTO members (user_id, full_name, register_number, department, class_section, year, college_email) 
      VALUES ($1, 'Test Member', 'TEST001', 'CS', 'A', 1, 'test_cascade@college.edu') 
      RETURNING id
    `, [userId]);
    const memberId = memberRes.rows[0].id;
    
    // Create test course
    const courseRes = await client.query(`
      INSERT INTO courses (title, provider, description, category, difficulty, tracking_method, tracking_status)
      VALUES ('Test Course', 'Test', 'Desc', 'AI', 'Beginner', 'api', 'Integration Available')
      RETURNING id
    `);
    const courseId = courseRes.rows[0].id;
    
    // Add course progress
    await client.query(`
      INSERT INTO course_progress (course_id, member_id, status)
      VALUES ($1, $2, 'In Progress')
    `, [courseId, memberId]);
    
    // Create test project
    const projRes = await client.query(`
      INSERT INTO projects (title, short_description, category, difficulty, status)
      VALUES ('Test Project', 'Desc', 'AI', 'Beginner', 'Open')
      RETURNING id
    `);
    const projId = projRes.rows[0].id;
    
    // Add project interest
    await client.query(`
      INSERT INTO project_interests (member_id, project_id)
      VALUES ($1, $2)
    `, [memberId, projId]);
    
    // Delete user (should cascade)
    await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
    
    // Verify
    const memCheck = await client.query(`SELECT count(*) FROM members WHERE id = $1`, [memberId]);
    const cpCheck = await client.query(`SELECT count(*) FROM course_progress WHERE member_id = $1`, [memberId]);
    const piCheck = await client.query(`SELECT count(*) FROM project_interests WHERE member_id = $1`, [memberId]);
    
    console.log('Member remaining:', memCheck.rows[0].count);
    console.log('Course Progress remaining:', cpCheck.rows[0].count);
    console.log('Project Interest remaining:', piCheck.rows[0].count);
    
    await client.query('ROLLBACK');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}

runTest();
