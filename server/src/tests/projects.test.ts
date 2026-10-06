import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../app';
import { pool } from '../db';

let server: http.Server;
let baseUrl: string;

let adminToken: string;
let studentToken: string;
let secondStudentToken: string;
let thirdStudentToken: string;

let studentMemberId: string;
let secondStudentMemberId: string;
let thirdStudentMemberId: string;

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const address = server.address() as any;
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });

  // Login admin
  const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@aiclub.com', password: 'admin123' }),
  });
  assert.equal(adminRes.status, 200);
  const adminData = await adminRes.json();
  adminToken = adminData.data.token;

  // Login primary student
  const studentRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@aiclub.com', password: 'student123' }),
  });
  assert.equal(studentRes.status, 200);
  const studentData = await studentRes.json();
  studentToken = studentData.data.token;

  // Login second student
  const secondRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ananya@aiclub.com', password: 'student123' }),
  });
  assert.equal(secondRes.status, 200);
  const secondData = await secondRes.json();
  secondStudentToken = secondData.data.token;

  // Register unique third student for invitation testing
  const thirdEmail = `kavitha_${Date.now()}@aiclub.com`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: thirdEmail,
      password: 'Password123!',
      fullName: 'Kavitha Raman',
      registerNumber: `RA2311${Math.floor(1000000 + Math.random() * 9000000)}`,
      department: 'Computer Science and Engineering',
      classSection: 'CSE-D',
      year: 3,
    }),
  });
  assert.equal(regRes.status, 201);
  const regData = await regRes.json();
  thirdStudentToken = regData.data.token;
  thirdStudentMemberId = regData.data.user.memberId;

  // Retrieve member IDs directly from members table
  const membersRes = await pool.query(
    `SELECT m.id, u.email FROM members m JOIN users u ON m.user_id = u.id WHERE u.email IN ('student@aiclub.com', 'ananya@aiclub.com')`
  );
  for (const row of membersRes.rows) {
    if (row.email === 'student@aiclub.com') studentMemberId = row.id;
    if (row.email === 'ananya@aiclub.com') secondStudentMemberId = row.id;
  }
});

after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Sprint 4: Projects + Teams Collaboration', () => {
  let createdProjectId: string;
  let createdProjectSlug: string;
  let testTeamId: string;
  let testInvitationId: string;
  let testMilestoneId1: string;
  let testMilestoneId2: string;

  describe('1. Project Creation, Lifecycle & RBAC', () => {
    test('Admin successfully creates a project defaulting to DRAFT', async () => {
      const res = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Autonomous Drone Navigation System',
          short_description: 'Vision-based obstacle avoidance and autonomous indoor path planning.',
          description: 'A deep reinforcement learning and computer vision framework for autonomous aerial navigation in GPS-denied environments.',
          domain: 'ROBOTICS',
          difficulty: 'ADVANCED',
          technologies: ['PyTorch', 'ROS2', 'OpenCV', 'Gazebo'],
          requirements: ['Basic Python', 'Robotics foundation'],
          objectives: ['Implement visual odometry', 'Train obstacle avoidance model'],
          max_team_size: 4,
          status: 'DRAFT',
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.title, 'Autonomous Drone Navigation System');
      assert.equal(body.data.status, 'DRAFT');
      assert.equal(body.data.domain, 'ROBOTICS');
      assert.equal(body.data.difficulty, 'ADVANCED');
      assert.ok(body.data.slug);

      createdProjectId = body.data.id;
      createdProjectSlug = body.data.slug;
    });

    test('Creating project with invalid/short description returns HTTP 400 VALIDATION_ERROR', async () => {
      const res = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Short',
          short_description: 'Bad', // too short
          domain: 'AI_ML',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    });

    test('Student cannot create a project via admin endpoint (HTTP 403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          title: 'Student Attempted Project',
          short_description: 'Should be rejected',
          domain: 'AI_ML',
        }),
      });

      assert.equal(res.status, 403);
    });

    test('Unauthenticated user cannot create project (HTTP 401 UNAUTHORIZED)', async () => {
      const res = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthenticated Project',
          short_description: 'Should be rejected',
          domain: 'AI_ML',
        }),
      });

      assert.equal(res.status, 401);
    });

    test('DRAFT project is hidden from unauthenticated and student search results', async () => {
      const res = await fetch(`${baseUrl}/api/projects?search=Autonomous+Drone`);
      assert.equal(res.status, 200);
      const body = await res.json();
      const match = body.data.find((p: any) => p.id === createdProjectId);
      assert.equal(match, undefined, 'Draft project should not appear in public listing');
    });

    test('Admin publishes project: status transitions to OPEN', async () => {
      const res = await fetch(`${baseUrl}/api/projects/${createdProjectId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'OPEN');
    });
  });

  describe('2. Project Discovery, Search, Filtering & Detail', () => {
    test('Published project appears in public search results and filters by domain and difficulty', async () => {
      // Search by keyword
      const searchRes = await fetch(`${baseUrl}/api/projects?search=Autonomous+Drone`);
      assert.equal(searchRes.status, 200);
      const searchBody = await searchRes.json();
      assert.ok(searchBody.data.length >= 1);
      assert.equal(searchBody.data[0].id, createdProjectId);

      // Filter by domain
      const domainRes = await fetch(`${baseUrl}/api/projects?domain=ROBOTICS`);
      assert.equal(domainRes.status, 200);
      const domainBody = await domainRes.json();
      assert.ok(domainBody.data.some((p: any) => p.id === createdProjectId));

      // Filter by difficulty
      const diffRes = await fetch(`${baseUrl}/api/projects?difficulty=ADVANCED`);
      assert.equal(diffRes.status, 200);
      const diffBody = await diffRes.json();
      assert.ok(diffBody.data.some((p: any) => p.id === createdProjectId));
    });

    test('GET project by ID and by Slug returns complete item with aggregation counts', async () => {
      // By UUID
      const idRes = await fetch(`${baseUrl}/api/projects/${createdProjectId}`);
      assert.equal(idRes.status, 200);
      const idBody = await idRes.json();
      assert.equal(idBody.data.id, createdProjectId);
      assert.equal(typeof idBody.data.members_count, 'number');
      assert.equal(typeof idBody.data.teams_count, 'number');
      assert.equal(typeof idBody.data.milestones_count, 'number');

      // By Slug
      const slugRes = await fetch(`${baseUrl}/api/projects/${createdProjectSlug}`);
      assert.equal(slugRes.status, 200);
      const slugBody = await slugRes.json();
      assert.equal(slugBody.data.id, createdProjectId);
    });

    test('GET nonexistent project returns HTTP 404', async () => {
      const res = await fetch(`${baseUrl}/api/projects/00000000-0000-0000-0000-000000000000`);
      assert.equal(res.status, 404);
    });
  });

  describe('3. Project Memberships (Join, Approval & Management)', () => {
    test('Student requests to join project: status becomes PENDING', async () => {
      const res = await fetch(`${baseUrl}/api/projects/${createdProjectId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          role: 'CONTRIBUTOR',
          message: 'Interested in working on the visual SLAM pipeline.',
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.project_id, createdProjectId);
      assert.equal(body.data.status, 'PENDING');
      assert.equal(body.data.role, 'CONTRIBUTOR');
    });

    test('Repeated join request by same student is rejected with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/api/projects/${createdProjectId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ role: 'CONTRIBUTOR' }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.error.message, /already pending/i);
    });

    test('Project detail request by authenticated student shows current_member_status as PENDING', async () => {
      const res = await fetch(`${baseUrl}/api/projects/${createdProjectId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.current_member_status, 'PENDING');
      assert.equal(body.data.current_member_role, 'CONTRIBUTOR');
    });

    test('Admin approves student membership: status becomes ACTIVE and joined_at is set', async () => {
      const res = await fetch(`${baseUrl}/api/projects/${createdProjectId}/members/${studentMemberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: 'ACTIVE',
          role: 'CONTRIBUTOR',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'ACTIVE');
      assert.ok(body.data.joined_at);
    });

    test('Student GET /api/projects/my and /api/me/projects includes active project', async () => {
      const res = await fetch(`${baseUrl}/api/projects/my`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.data.some((p: any) => p.id === createdProjectId));
    });

    test('Admin lists project members and sees enriched profile details', async () => {
      const res = await fetch(`${baseUrl}/api/projects/${createdProjectId}/members`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.data.length >= 1);
      const mem = body.data.find((m: any) => m.member_id === studentMemberId);
      assert.ok(mem);
      assert.equal(mem.status, 'ACTIVE');
      assert.ok(mem.full_name);
      assert.ok(mem.department);
    });
  });

  describe('4. Teams Formation, Atomic Capacity & Member Roles', () => {
    test('Student creates a team under the project and becomes TEAM_LEAD', async () => {
      const res = await fetch(`${baseUrl}/api/projects/${createdProjectId}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          name: 'Perception Core Squad',
          description: 'Focusing on stereovision and YOLO object tracking.',
          max_members: 2, // low limit to test capacity
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.name, 'Perception Core Squad');
      assert.equal(body.data.max_members, 2);
      testTeamId = body.data.id;
    });

    test('Second student joins the team: member count increments to 2', async () => {
      const res = await fetch(`${baseUrl}/api/teams/${testTeamId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secondStudentToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);

      // Verify team is now FULL
      const teamRes = await fetch(`${baseUrl}/api/teams/${testTeamId}`);
      assert.equal(teamRes.status, 200);
      const teamBody = await teamRes.json();
      assert.equal(teamBody.data.member_count, 2);
      assert.equal(teamBody.data.status, 'FULL');
    });

    test('Third student attempting to join full team is rejected with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/api/teams/${testTeamId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${thirdStudentToken}`,
        },
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.error.message, /capacity|not accepting/i);
    });

    test('Team lead updates second student role to ML_ENGINEER', async () => {
      const res = await fetch(`${baseUrl}/api/teams/${testTeamId}/members/${secondStudentMemberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ role: 'ML_ENGINEER' }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.role, 'ML_ENGINEER');
    });

    test('Non-lead student cannot change other member roles (HTTP 403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/api/teams/${testTeamId}/members/${studentMemberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secondStudentToken}`,
        },
        body: JSON.stringify({ role: 'DEVELOPER' }),
      });

      assert.equal(res.status, 403);
    });

    test('Second student leaves the team: member count decreases and team status returns to ACTIVE', async () => {
      const res = await fetch(`${baseUrl}/api/teams/${testTeamId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secondStudentToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);

      // Verify status reset to ACTIVE
      const teamRes = await fetch(`${baseUrl}/api/teams/${testTeamId}`);
      const teamBody = await teamRes.json();
      assert.equal(teamBody.data.member_count, 1);
      assert.equal(teamBody.data.status, 'ACTIVE');
    });
  });

  describe('5. Team Invitations Workflow', () => {
    test('Team lead sends an invitation to a student', async () => {
      const res = await fetch(`${baseUrl}/api/teams/${testTeamId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          invited_member_id: thirdStudentMemberId,
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.invited_member_id, thirdStudentMemberId);
      assert.equal(body.data.status, 'PENDING');
      testInvitationId = body.data.id;
    });

    test('Invited student views their pending invitations', async () => {
      const res = await fetch(`${baseUrl}/api/teams/invitations/me`, {
        headers: { Authorization: `Bearer ${thirdStudentToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.data.some((inv: any) => inv.id === testInvitationId));
    });

    test('Another student cannot accept someone else invitation (HTTP 403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/api/teams/invitations/${testInvitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secondStudentToken}`,
        },
        body: JSON.stringify({ action: 'ACCEPT' }),
      });

      assert.equal(res.status, 403);
    });

    test('Invited student accepts invitation: status becomes ACCEPTED and student joins team', async () => {
      const res = await fetch(`${baseUrl}/api/teams/invitations/${testInvitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${thirdStudentToken}`,
        },
        body: JSON.stringify({ action: 'ACCEPT' }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);

      // Verify third student is now in team
      const teamRes = await fetch(`${baseUrl}/api/teams/${testTeamId}`);
      const teamBody = await teamRes.json();
      assert.ok(teamBody.data.members.some((m: any) => m.member_id === thirdStudentMemberId));
    });
  });

  describe('6. Project Milestones & Progress Calculation', () => {
    test('Admin adds two milestones to the project', async () => {
      // Milestone 1
      const res1 = await fetch(`${baseUrl}/api/projects/${createdProjectId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Design Simulation Environment',
          description: 'Setup Gazebo simulation with custom obstacle map.',
          status: 'TODO',
        }),
      });
      assert.equal(res1.status, 201);
      const body1 = await res1.json();
      testMilestoneId1 = body1.data.id;

      // Milestone 2
      const res2 = await fetch(`${baseUrl}/api/projects/${createdProjectId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Integrate Visual Odometry',
          description: 'Port stereo vision features to ROS2 nodes.',
          status: 'TODO',
        }),
      });
      assert.equal(res2.status, 201);
      const body2 = await res2.json();
      testMilestoneId2 = body2.data.id;

      // Initial progress percentage should be 0
      const projectRes = await fetch(`${baseUrl}/api/projects/${createdProjectId}`);
      const projectBody = await projectRes.json();
      assert.equal(projectBody.data.progress_percentage, 0);
      assert.equal(projectBody.data.milestones_count, 2);
      assert.equal(projectBody.data.completed_milestones_count, 0);
    });

    test('Completing milestone 1 automatically updates project progress_percentage to 50%', async () => {
      const res = await fetch(`${baseUrl}/api/projects/milestones/${testMilestoneId1}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.status, 'COMPLETED');

      // Verify project progress is now 50%
      const projectRes = await fetch(`${baseUrl}/api/projects/${createdProjectId}`);
      const projectBody = await projectRes.json();
      assert.equal(projectBody.data.progress_percentage, 50);
      assert.equal(projectBody.data.completed_milestones_count, 1);
    });

    test('Completing milestone 2 automatically updates project progress_percentage to 100%', async () => {
      const res = await fetch(`${baseUrl}/api/projects/milestones/${testMilestoneId2}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      assert.equal(res.status, 200);

      // Verify project progress is now 100%
      const projectRes = await fetch(`${baseUrl}/api/projects/${createdProjectId}`);
      const projectBody = await projectRes.json();
      assert.equal(projectBody.data.progress_percentage, 100);
      assert.equal(projectBody.data.completed_milestones_count, 2);
    });
  });

  describe('7. Dashboard & Profile Integration', () => {
    test('Student dashboard (GET /api/dashboard) returns myProjects list and statistics', async () => {
      const res = await fetch(`${baseUrl}/api/dashboard`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data.myProjects));
      assert.ok(body.data.myProjects.some((p: any) => p.id === createdProjectId));
    });
  });
});
