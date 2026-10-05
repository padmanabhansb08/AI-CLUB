
const API_URL = 'http://localhost:3005';

async function run() {
  console.log("=== SETUP ===");
  // 1. Login admin
  const adminRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@college.edu', password: 'admin123' })
  });
  const adminData = await adminRes.json();
  const adminToken = adminData.data.token;

  // 2. Login student 1
  const s1Res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@college.edu', password: 'student123' })
  });
  const s1Data = await s1Res.json();
  const s1Token = s1Data.data.token;
  const s1Id = s1Data.data.user.id;

  // 3. Login student 2
  await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'studentA104@college.edu', password: 'student123', fullName: 'Student A', registerNumber: 'REG104A', department: 'CS', classSection: 'A', year: 1, collegeEmail: 'studentA104@college.edu' })
  });

  const s2Res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'studentA104@college.edu', password: 'student123' })
  });
  const s2Data = await s2Res.json();
  const s2Token = s2Data.data.token;

  console.log("Login successful");

  // Create Project as Admin
  const pRes = await fetch(`${API_URL}/api/admin/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: 'TEST_PROJECT_FOR_TEAMS',
      short_description: 'Desc',
      overview: 'Overview',
      problem: 'Prob',
      approach: 'Appr',
      category: 'AI',
      difficulty: 'Beginner',
      status: 'active',
      expected_outcome: 'Outcome'
    })
  });
  const project = (await pRes.json()).data;
  console.log("Created Project:", project.id);

  // Student 1 Express Interest
  await fetch(`${API_URL}/api/me/projects/${project.id}/interest`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${s1Token}` }
  });
  console.log("Student 1 expressed interest");

  // Student 1 Creates Team
  const teamRes = await fetch(`${API_URL}/api/me/projects/${project.id}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s1Token}` },
    body: JSON.stringify({
      name: 'TEST_TEAM_1',
      maxMembers: 2
    })
  });
  const teamData = await teamRes.json();
  const team = teamData.data;
  console.log("Student 1 created team:", team?.id);

  if (!team) {
      console.error("Team creation failed:", teamData);
      return;
  }

  // Check Teams on Project (public/optional auth)
  const pubRes = await fetch(`${API_URL}/api/projects/${project.id}/teams`, {
    headers: { 'Authorization': `Bearer ${s1Token}` }
  });
  const pubTeams = (await pubRes.json()).data;
  console.log("Project Teams fetched:", pubTeams.length, pubTeams[0]?.currentStudentMembership);

  // Student 2 Joins Team
  const joinRes = await fetch(`${API_URL}/api/me/teams/${team.id}/join`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${s2Token}` }
  });
  console.log("Student 2 joined:", await joinRes.json());

  // Student 3 Joins Team (Should fail due to capacity)
  // Let's create an ad-hoc student 3 token if needed, or just let Student 1 check their own teams
  
  const myTeamsRes = await fetch(`${API_URL}/api/me/project-teams`, {
    headers: { 'Authorization': `Bearer ${s1Token}` }
  });
  console.log("Student 1 My Teams:", (await myTeamsRes.json()).data.length);

  // Cleanup
  await fetch(`${API_URL}/api/admin/projects/${project.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log("Cleanup complete");
}

run().catch(console.error);
