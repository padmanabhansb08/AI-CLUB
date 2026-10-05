const API_URL = 'http://localhost:3005';

async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!data.data) {
    console.error(email, data);
    process.exit(1);
  }
  return data.data.token;
}

async function run() {
  const s1Token = await login('student1@test.com', 'password123');

  console.log('Testing GET /api/members...');
  const res1 = await fetch(`${API_URL}/api/members`, {
    headers: { 'Authorization': `Bearer ${s1Token}` }
  });
  
  if (!res1.ok) {
    console.error(await res1.text());
    process.exit(1);
  }

  const list = await res1.json();
  console.log('List data length:', list.data.length);
  if (list.data.length > 0) {
    const member = list.data[0];
    console.log('First member:', Object.keys(member));
    if (member.email || member.phone || member.password_hash || member.college_email) {
      console.error('FAILED: Private fields exposed in directory list');
      process.exit(1);
    }
    
    console.log(`\nTesting GET /api/members/${member.id}...`);
    const res2 = await fetch(`${API_URL}/api/members/${member.id}`, {
      headers: { 'Authorization': `Bearer ${s1Token}` }
    });
    const detail = await res2.json();
    console.log('Detail member keys:', Object.keys(detail.data));
    if (detail.data.email || detail.data.phone || detail.data.password_hash || detail.data.college_email) {
      console.error('FAILED: Private fields exposed in directory detail');
      process.exit(1);
    }
  }

  console.log('\nUnauthenticated Test...');
  const res3 = await fetch(`${API_URL}/api/members`);
  console.log('Status:', res3.status);
  if (res3.status !== 401) {
    console.error('FAILED: Unauthenticated should be 401');
    process.exit(1);
  }

  console.log('\nPASS: API backend correctly secured and filtered.');
}
run();
