async function run() {
  const loginRes = await fetch('http://localhost:3005/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@college.edu', password: 'student123' })
  });
  const loginDataRaw = await loginRes.text();
  const loginData = JSON.parse(loginDataRaw);
  const token = loginData.data.token;

  console.log('Got token');

  const profileRes = await fetch('http://localhost:3005/api/me/profile', {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bio: 'I am a passionate AI enthusiast.',
      githubUrl: 'https://github.com/johndoe',
      skills: ['Python', 'React', 'TypeScript'],
      technicalInterests: ['Machine Learning', 'Web Dev']
    })
  });
  const resData = await profileRes.json();
  console.log(resData);
}
run().catch(console.error);
