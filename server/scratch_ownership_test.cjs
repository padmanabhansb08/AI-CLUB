const http = require('http');
const { Pool } = require('pg');

const API_BASE = 'http://localhost:3000/api';

const pool = new Pool({
  connectionString: 'postgres://aiclub:password@localhost:5433/aiclub_db'
});

async function request(method, path, token = null, body = null) {
  return new Promise((resolve, reject) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(`${API_BASE}${path}`, opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : {}; } catch(e){}
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTest() {
  console.log('--- Project Interest Ownership Test ---');
  
  // 1. Create Student A
  const regA = await request('POST', '/auth/register', null, {
    email: 'studentA@college.edu', password: 'password', fullName: 'Student A', registerNumber: 'A123', department: 'CS', classSection: 'A', year: 1, collegeEmail: 'studentA@college.edu', phone: '123'
  });
  const loginA = await request('POST', '/auth/login', null, { email: 'studentA@college.edu', password: 'password' });
  const tokenA = loginA.data.data.token;
  
  // 2. Create Student B
  const regB = await request('POST', '/auth/register', null, {
    email: 'studentB@college.edu', password: 'password', fullName: 'Student B', registerNumber: 'B123', department: 'CS', classSection: 'B', year: 1, collegeEmail: 'studentB@college.edu', phone: '123'
  });
  const loginB = await request('POST', '/auth/login', null, { email: 'studentB@college.edu', password: 'password' });
  const tokenB = loginB.data.data.token;

  // 3. Admin creates a project
  const adminLogin = await request('POST', '/auth/login', null, { email: 'admin@college.edu', password: 'admin123' });
  const adminToken = adminLogin.data.data.token;
  
  const projRes = await request('POST', '/admin/projects', adminToken, {
    title: 'Test Proj Ownership', short_description: 'Desc', category: 'AI', difficulty: 'Beginner', status: 'Open', featured: false
  });
  const projectId = projRes.data.data.id;

  // 4. Student A expresses interest
  const int1 = await request('POST', `/me/projects/${projectId}/interest`, tokenA, { member_id: 'fake-b-id' });
  console.log('int1 status:', int1.status, int1.data);
  console.log('A. Student A created interest for themselves:', int1.status === 201 ? 'PASS' : 'FAIL');

  // 5. Duplicate interest (Idempotent)
  const int2 = await request('POST', `/me/projects/${projectId}/interest`, tokenA);
  console.log('B. Duplicate interest idempotent:', int2.status === 201 ? 'PASS' : 'FAIL');

  // 6. Database Verification
  const client = await pool.connect();
  const dbRes = await client.query(`
    SELECT pi.member_id, m.user_id, m.full_name
    FROM project_interests pi
    JOIN members m ON pi.member_id = m.id
    WHERE pi.project_id = $1
  `, [projectId]);
  
  const interests = dbRes.rows;
  console.log('C. Cross-user ownership test: Student A provided malicious payload but DB resolved to:', interests[0].full_name);
  console.log('D. DB Rows returned:', interests.length);
  
  if (interests.length === 1 && interests[0].full_name === 'Student A') {
    console.log('E. No cross-user bypass exists: PASS');
  } else {
    console.log('E. No cross-user bypass exists: FAIL');
  }
  
  client.release();
  pool.end();
}

runTest();
