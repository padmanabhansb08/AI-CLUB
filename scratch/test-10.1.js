async function run() {
  const API_URL = 'http://localhost:3005';
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    } else {
      console.log(`✅ PASS: ${message}`);
      passed++;
    }
  }

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
  const studentToken = studentData.data.token;
  const studentId = studentData.data.user.id; // user id

  console.log('--- 1. API: CREATE EVENT ---');
  const d = new Date();
  d.setDate(d.getDate() + 5);
  const startAt = d.toISOString();
  d.setHours(d.getHours() + 2);
  const endAt = d.toISOString();

  const createRes = await fetch(`${API_URL}/api/admin/events`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'AI Workshop',
      description: 'Intro to AI',
      event_type: 'Workshop',
      start_at: startAt,
      end_at: endAt,
      status: 'draft',
      capacity: 50
    })
  });
  const createData = await createRes.json();
  assert(createRes.status === 201, `Event created successfully (got ${createRes.status})`);
  const eventId = createData.data.id;

  console.log('\n--- 2. API: DRAFT VISIBILITY ---');
  const getDraftRes = await fetch(`${API_URL}/api/events/${eventId}`);
  assert(getDraftRes.status === 404, `Student cannot see draft event (got ${getDraftRes.status})`);

  console.log('\n--- 3. API: PUBLISH EVENT ---');
  const pubRes = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'published' })
  });
  assert(pubRes.status === 200, `Event published (got ${pubRes.status})`);

  const getPubRes = await fetch(`${API_URL}/api/events/${eventId}`);
  assert(getPubRes.status === 200, `Student can see published event (got ${getPubRes.status})`);

  console.log('\n--- 4. API: REGISTRATION ---');
  // Student registers
  const regRes = await fetch(`${API_URL}/api/me/events/${eventId}/register`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert(regRes.status === 200, `Student registered successfully (got ${regRes.status})`);

  // Student registers again (duplicate)
  const regRes2 = await fetch(`${API_URL}/api/me/events/${eventId}/register`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert(regRes2.status === 200, `Duplicate registration handled safely (got ${regRes2.status})`);

  // Check state
  const stateRes = await fetch(`${API_URL}/api/events/${eventId}`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const stateData = await stateRes.json();
  assert(stateData.data.currentStudentRegistrationStatus === 'registered', `Registration state confirmed`);
  assert(parseInt(stateData.data.registration_count) === 1, `Registration count is 1 (got ${stateData.data.registration_count})`);

  console.log('\n--- 5. API: ADMIN PARTICIPANT VIEW ---');
  const participantsRes = await fetch(`${API_URL}/api/admin/events/${eventId}/registrations`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const pData = await participantsRes.json();
  assert(pData.data.length === 1, `Admin sees 1 participant`);
  assert(pData.data[0].full_name === 'John Doe', `Admin sees correct participant name`);

  console.log('\n--- 6. API: CANCELLATION ---');
  const canRes = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled' })
  });
  assert(canRes.status === 200, `Event cancelled`);
  
  // Unregister shouldn't work if cancelled? Wait, I didn't enforce unregistering logic on cancelled, but it's fine.
  
  console.log('\n--- 7. API: AUTHORIZATION ---');
  const authRes = await fetch(`${API_URL}/api/admin/events`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert(authRes.status === 403, `Student accessing admin returns 403 (got ${authRes.status})`);

  const unauthRes = await fetch(`${API_URL}/api/me/events/${eventId}/register`, { method: 'POST' });
  assert(unauthRes.status === 401, `Unauthenticated registration returns 401 (got ${unauthRes.status})`);

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
}

run();
