const { Pool } = require('pg');

async function run() {
  const API_URL = 'http://localhost:3005';
  let passed = 0;
  let failed = 0;

  function assert(condition, message, evidence = null) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      if (evidence) console.error(`   Evidence:`, evidence);
      failed++;
    } else {
      console.log(`✅ PASS: ${message}`);
      if (evidence) console.log(`   Evidence:`, evidence);
      passed++;
    }
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aiclub_db'
  });

  try {
    console.log('\n==================================================');
    console.log('1. DATABASE VERIFICATION');
    console.log('==================================================');
    
    const tableRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('events', 'event_registrations')
    `);
    const tables = tableRes.rows.map(r => r.table_name);
    assert(tables.includes('events'), 'events table exists', tables);
    assert(tables.includes('event_registrations'), 'event_registrations table exists', tables);

    const fkeysRes = await pool.query(`
      SELECT tc.constraint_name, kcu.column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name 
      WHERE tc.table_name = 'event_registrations' AND tc.constraint_type = 'FOREIGN KEY'
    `);
    const fkeys = fkeysRes.rows.map(r => r.column_name);
    assert(fkeys.includes('event_id') && fkeys.includes('member_id'), 'Foreign keys exist on event_registrations', fkeys);

    const uniqueRes = await pool.query(`
      SELECT tc.constraint_name 
      FROM information_schema.table_constraints AS tc 
      WHERE tc.table_name = 'event_registrations' AND tc.constraint_type = 'UNIQUE'
    `);
    assert(uniqueRes.rowCount > 0, 'UNIQUE constraint exists on event_registrations', uniqueRes.rows.map(r => r.constraint_name));

    console.log('\n==================================================');
    console.log('2. ADMIN EVENT LIFECYCLE');
    console.log('==================================================');
    
    // Login as admin
    const adminRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@college.edu', password: 'admin123' })
    });
    const adminToken = (await adminRes.json()).data.token;

    // Login as student
    const studentRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@college.edu', password: 'student123' })
    });
    const studentData = await studentRes.json();
    if (!studentData.data) {
        console.error("Student login failed:", studentData);
    }
    const studentToken = studentData.data.token;
    const studentUserId = studentData.data.user.id;
    
    // Get member ID for student
    const memberRes = await pool.query('SELECT id FROM members WHERE user_id = $1', [studentUserId]);
    const studentMemberId = memberRes.rows[0].id;

    const d = new Date();
    d.setDate(d.getDate() + 5);
    const startAt = d.toISOString();
    d.setHours(d.getHours() + 2);
    const endAt = d.toISOString();

    const createRes = await fetch(`${API_URL}/api/admin/events`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'TEST_EVENT_FINAL_VERIFICATION',
        description: 'Test description',
        event_type: 'Workshop',
        start_at: startAt,
        end_at: endAt,
        status: 'draft',
        capacity: 50
      })
    });
    const createData = await createRes.json();
    assert(createRes.status === 201, 'Admin can create draft event');
    const eventId = createData.data.id;

    const dbEventRes = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    assert(dbEventRes.rowCount === 1, 'PostgreSQL contains draft event', dbEventRes.rows[0]);

    const getDraftRes = await fetch(`${API_URL}/api/events/${eventId}`);
    assert(getDraftRes.status === 404, 'Draft event is NOT visible to students publicly');

    const pubRes = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' })
    });
    assert(pubRes.status === 200, 'Event published');

    const getPubRes = await fetch(`${API_URL}/api/events/${eventId}`);
    assert(getPubRes.status === 200, 'Event IS visible to students after publish');

    const editRes = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'UPDATED_TEST_EVENT' })
    });
    assert(editRes.status === 200, 'Event title updated');

    const dbUpdateRes = await pool.query('SELECT title FROM events WHERE id = $1', [eventId]);
    assert(dbUpdateRes.rows[0].title === 'UPDATED_TEST_EVENT', 'PostgreSQL contains updated title', dbUpdateRes.rows[0]);

    const studentGetUpdate = await fetch(`${API_URL}/api/events/${eventId}`);
    const studentUpdateData = await studentGetUpdate.json();
    assert(studentUpdateData.data.title === 'UPDATED_TEST_EVENT', 'Student API returns updated title');

    console.log('\n==================================================');
    console.log('3. STUDENT REGISTRATION');
    console.log('==================================================');

    const regRes = await fetch(`${API_URL}/api/me/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(regRes.status === 200, 'Student registered successfully');

    const dbRegRes = await pool.query('SELECT * FROM event_registrations WHERE event_id = $1', [eventId]);
    assert(dbRegRes.rowCount === 1, 'Exactly one registration row exists', dbRegRes.rows[0]);
    assert(dbRegRes.rows[0].member_id === studentMemberId, 'member_id matches authenticated student');
    assert(dbRegRes.rows[0].registered_at !== null, 'registered_at exists');

    const stateRes = await fetch(`${API_URL}/api/events/${eventId}`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const stateData = await stateRes.json();
    assert(stateData.data.currentStudentRegistrationStatus === 'registered', 'Event is reported as REGISTERED to student');

    console.log('\n==================================================');
    console.log('4. DUPLICATE REGISTRATION');
    console.log('==================================================');

    const regRes2 = await fetch(`${API_URL}/api/me/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(regRes2.status === 200, 'API handles duplicate registration idempotently');
    const dbRegRes2 = await pool.query('SELECT COUNT(*) FROM event_registrations WHERE event_id = $1', [eventId]);
    assert(parseInt(dbRegRes2.rows[0].count) === 1, 'PostgreSQL still contains exactly ONE registration', dbRegRes2.rows[0]);

    console.log('\n==================================================');
    console.log('5. OWNERSHIP SECURITY');
    console.log('==================================================');
    
    // Test ownership by sending an explicit memberId in body (the API shouldn't read it from body anyway, but we will send it just to be sure)
    const otherStudentMemberId = '11111111-1111-1111-1111-111111111111'; // Fake UUID
    const hackRes = await fetch(`${API_URL}/api/me/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: otherStudentMemberId }) // Try to fake member_id
    });
    assert(hackRes.status === 200, 'API ignores explicit member_id payload');
    const dbHackRes = await pool.query('SELECT member_id FROM event_registrations WHERE event_id = $1', [eventId]);
    assert(dbHackRes.rows.every(r => r.member_id === studentMemberId), 'PostgreSQL contains ONLY the authenticated student member_id', dbHackRes.rows);

    console.log('\n==================================================');
    console.log('6. CANCELLED EVENT');
    console.log('==================================================');

    // First unregister student to test fresh registration on cancelled event
    await fetch(`${API_URL}/api/me/events/${eventId}/unregister`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    const canRes = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });
    assert(canRes.status === 200, 'Event cancelled');
    const dbCanRes = await pool.query('SELECT status FROM events WHERE id = $1', [eventId]);
    assert(dbCanRes.rows[0].status === 'cancelled', 'PostgreSQL status=cancelled', dbCanRes.rows[0]);

    const canRegRes = await fetch(`${API_URL}/api/me/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(canRegRes.status === 400 || canRegRes.status === 404, `Registration on cancelled event rejected (got ${canRegRes.status})`);
    const dbCanRegRes = await pool.query('SELECT COUNT(*) FROM event_registrations WHERE event_id = $1', [eventId]);
    assert(parseInt(dbCanRegRes.rows[0].count) === 0, 'No new registration is created for cancelled event', dbCanRegRes.rows[0]);

    console.log('\n==================================================');
    console.log('7. CAPACITY');
    console.log('==================================================');
    
    // Create new event with capacity 1
    const capRes = await fetch(`${API_URL}/api/admin/events`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'CAPACITY_TEST_EVENT',
        description: 'Test',
        event_type: 'Workshop',
        start_at: startAt,
        end_at: endAt,
        status: 'published',
        capacity: 1
      })
    });
    const capEventId = (await capRes.json()).data.id;

    // Register student 1
    const capReg1 = await fetch(`${API_URL}/api/me/events/${capEventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(capReg1.status === 200, 'First registration succeeded');

    // Create another student directly in DB or use admin to register? We only have 1 student seeded. Let's create another user/member
    await pool.query(`DELETE FROM members WHERE register_number = 'STU2'`);
    await pool.query(`DELETE FROM users WHERE email = 'student2@college.edu'`);
    const passRes = await pool.query(`INSERT INTO users (email, password_hash, role) VALUES ('student2@college.edu', 'hash', 'student') RETURNING id`);
    const s2UserId = passRes.rows[0].id;
    await pool.query(`INSERT INTO members (user_id, full_name, register_number, department, class_section, year, college_email) VALUES ($1, 'Student 2', 'STU2', 'CS', 'A', 1, 'student2@college.edu')`, [s2UserId]);
    
    // Generate token for student2
    const jwt = require('../server/node_modules/jsonwebtoken');
    const s2Token = jwt.sign({ userId: s2UserId, role: 'student' }, process.env.JWT_SECRET || 'super_secret_jwt_key_do_not_use_in_prod', { expiresIn: '1d' });
    
    const capReg2 = await fetch(`${API_URL}/api/me/events/${capEventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${s2Token}` }
    });
    assert(capReg2.status === 400, `Second registration rejected due to capacity (got ${capReg2.status})`);

    const dbCapRes = await pool.query('SELECT COUNT(*) FROM event_registrations WHERE event_id = $1', [capEventId]);
    assert(parseInt(dbCapRes.rows[0].count) === 1, 'PostgreSQL confirms capacity was not exceeded', dbCapRes.rows[0]);

    console.log('\n==================================================');
    console.log('8. ADMIN PARTICIPANTS');
    console.log('==================================================');

    const participantsRes = await fetch(`${API_URL}/api/admin/events/${capEventId}/registrations`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const pData = await participantsRes.json();
    assert(pData.data.length === 1, 'Admin sees 1 participant');
    assert(pData.data[0].full_name, 'Name exists');
    assert(pData.data[0].register_number, 'Register number exists');
    assert(pData.data[0].registered_at, 'Registration timestamp exists');
    assert(pData.data[0].password === undefined && pData.data[0].password_hash === undefined, 'No password data exposed');

    console.log('\n==================================================');
    console.log('11. CLEANUP');
    console.log('==================================================');

    await pool.query('DELETE FROM events WHERE id = $1', [eventId]);
    await pool.query('DELETE FROM events WHERE id = $1', [capEventId]);
    await pool.query('DELETE FROM members WHERE register_number = $1', ['STU2']);
    await pool.query('DELETE FROM users WHERE email = $1', ['student2@college.edu']);
    
    const checkDbRes = await pool.query('SELECT COUNT(*) FROM events WHERE title LIKE $1', ['%TEST_EVENT%']);
    assert(parseInt(checkDbRes.rows[0].count) === 0, 'Test events removed safely from PostgreSQL');

    console.log(`\n==================================================`);
    console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
    console.log(`==================================================`);
    
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test crashed:', err);
    process.exit(1);
  } finally {
    pool.end();
  }
}

run();
