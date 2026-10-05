async function run() {
  const loginRes = await fetch('http://localhost:3005/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@college.edu', password: 'student123' })
  });
  const loginDataRaw = await loginRes.text();
  console.log(loginDataRaw);
  const loginData = JSON.parse(loginDataRaw);
  const token = loginData.data.token;

  console.log('Got token');

  const profileRes = await fetch('http://localhost:3005/api/me/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(await profileRes.json());
}
run().catch(console.error);
