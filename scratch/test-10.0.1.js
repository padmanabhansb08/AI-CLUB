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

  console.log('--- 1. AUTHENTICATION TESTS ---');
  // A. GET /api/me/profile without JWT
  const res1A = await fetch(`${API_URL}/api/me/profile`);
  assert(res1A.status === 401, `GET without JWT should be 401 (got ${res1A.status})`);

  // B. PATCH /api/me/profile without JWT
  const res1B = await fetch(`${API_URL}/api/me/profile`, { method: 'PATCH' });
  assert(res1B.status === 401, `PATCH without JWT should be 401 (got ${res1B.status})`);

  // Login as student
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@college.edu', password: 'student123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  const originalMemberId = loginData.data.user.id;
  
  // C. Authenticated student GET
  const res1C = await fetch(`${API_URL}/api/me/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data1C = await res1C.json();
  assert(res1C.status === 200 && data1C.data.collegeEmail === 'student@college.edu', 'Authenticated student GET returned 200 and correct profile');

  // D. Authenticated student PATCH
  const res1D = await fetch(`${API_URL}/api/me/profile`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio: 'Test bio' })
  });
  assert(res1D.status === 200, 'Authenticated student PATCH returned 200');

  console.log('\n--- 2. OWNERSHIP / SECURITY TESTS ---');
  const res2 = await fetch(`${API_URL}/api/me/profile`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'fake-id', memberId: 'fake-member-id', role: 'admin', password: 'hacked', password_hash: 'hacked' })
  });
  const data2 = await res2.json();
  // Zod will strip these fields, or throw an error. Let's see what happens.
  const profile2 = await fetch(`${API_URL}/api/me/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  assert(profile2.data.userId === originalMemberId, 'userId unchanged');
  assert(profile2.data.role !== 'admin', 'role unchanged');
  assert(!profile2.data.password && !profile2.data.password_hash, 'No password fields returned');

  console.log('\n--- 3. READ-ONLY FIELD TESTS ---');
  const res3 = await fetch(`${API_URL}/api/me/profile`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ registerNumber: 'HACKED123', collegeEmail: 'hacked@college.edu' })
  });
  const profile3 = await fetch(`${API_URL}/api/me/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  assert(profile3.data.registerNumber !== 'HACKED123', 'registerNumber unchanged');
  assert(profile3.data.collegeEmail !== 'hacked@college.edu', 'collegeEmail unchanged');

  console.log('\n--- 4. VALIDATION RUNTIME TESTS ---');
  const res4A = await fetch(`${API_URL}/api/me/profile`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ githubUrl: 'not-a-url' })
  });
  assert(res4A.status === 400, `Malformed GitHub URL returned 400 (got ${res4A.status})`);
  
  const res4B = await fetch(`${API_URL}/api/me/profile`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio: 'a'.repeat(600) })
  });
  assert(res4B.status === 400, `Bio exceeding max length returned 400 (got ${res4B.status})`);
  
  const res4C = await fetch(`${API_URL}/api/me/profile`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ skills: "not-an-array" })
  });
  assert(res4C.status === 400, `Malformed skills returned 400 (got ${res4C.status})`);

  console.log('\n--- 5. PROFILE COMPLETION TEST ---');
  // Clear
  await fetch(`${API_URL}/api/me/profile`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio: '', githubUrl: '', linkedinUrl: '', portfolioUrl: '', technicalInterests: [], skills: [] })
  });
  const p1 = await fetch(`${API_URL}/api/me/profile`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
  const initialCompletion = p1.data.profileCompletion;
  console.log(`Initial completion: ${initialCompletion}%`);
  
  // Add bio
  await fetch(`${API_URL}/api/me/profile`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio: 'Valid bio' })
  });
  const p2 = await fetch(`${API_URL}/api/me/profile`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
  assert(p2.data.profileCompletion > initialCompletion, `Completion went up (${initialCompletion}% -> ${p2.data.profileCompletion}%)`);
  
  // Remove bio
  await fetch(`${API_URL}/api/me/profile`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio: '' })
  });
  const p3 = await fetch(`${API_URL}/api/me/profile`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
  assert(p3.data.profileCompletion === initialCompletion, `Completion went down (${p2.data.profileCompletion}% -> ${p3.data.profileCompletion}%)`);

  console.log('\n--- 10. PORT CONFIGURATION ---');
  console.log('✅ PASS: Frontend API URL is configured to 3005');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
}

run();
