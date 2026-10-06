import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../app';
import { pool } from '../db';

let server: http.Server;
let baseUrl: string;

let studentToken: string;
let studentUserId: string;
let studentMemberId: string;

let secondStudentToken: string;
let secondStudentMemberId: string;

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const address = server.address() as any;
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });

  // Log in primary student (Rahul Sharma)
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@aiclub.com', password: 'student123' }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  studentToken = data.data.token;
  studentUserId = data.data.user.id || data.data.user.userId;

  // Log in secondary student (Ananya Patel)
  const res2 = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ananya@aiclub.com', password: 'student123' }),
  });
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  secondStudentToken = data2.data.token;
});

after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Sprint 2: Student Profile, Member Identity & Dashboard', () => {
  describe('1. Student Profile & Profile Completion', () => {
    test('GET /api/members/me returns authenticated student profile with completion object', async () => {
      const res = await fetch(`${baseUrl}/api/members/me`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.fullName);
      assert.ok(body.data.department);
      studentMemberId = body.data.id;

      // Verify Profile Completion structure
      const completion = body.data.profileCompletion;
      assert.ok(completion, 'Profile completion should exist');
      assert.ok(typeof completion.percentage === 'number');
      assert.ok(completion.percentage >= 0 && completion.percentage <= 100);
      assert.ok(Array.isArray(completion.missing));
    });

    test('GET /api/members/me rejects unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/members/me`);
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'UNAUTHORIZED');
    });

    test('PATCH /api/members/me updates bio, photo URL, and links and recalculates completion', async () => {
      const updatePayload = {
        bio: 'Updated bio: Senior AI researcher focusing on autonomous robotics and agents.',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        githubUrl: 'https://github.com/rahulsharma-ai',
        linkedinUrl: 'https://linkedin.com/in/rahulsharma-ai',
        portfolioUrl: 'https://rahulsharma-ai.dev',
      };

      const res = await fetch(`${baseUrl}/api/members/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify(updatePayload),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.bio, updatePayload.bio);
      assert.equal(body.data.profilePhotoUrl, updatePayload.profilePhotoUrl);
      assert.equal(body.data.githubUrl, updatePayload.githubUrl);

      // Verify completion reflects the filled links
      assert.ok(body.data.profileCompletion.percentage >= 80);
    });

    test('PATCH /api/members/me rejects invalid URL formats with 400 VALIDATION_ERROR', async () => {
      const res = await fetch(`${baseUrl}/api/members/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          profilePhotoUrl: 'not-a-valid-url',
          githubUrl: 'invalid-github',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    });
  });

  describe('2. Skills & Interests Catalog & Normalization', () => {
    test('GET /api/skills returns curated skills catalog', async () => {
      const res = await fetch(`${baseUrl}/api/skills`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length >= 10);
      assert.ok(body.data.some((s: any) => s.name === 'Python'));
    });

    test('GET /api/interests returns curated interests catalog', async () => {
      const res = await fetch(`${baseUrl}/api/interests`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length >= 5);
      assert.ok(body.data.some((i: any) => i.name === 'Generative AI'));
    });

    test('PUT /api/members/me/skills updates student skills with proficiencies', async () => {
      const skillsPayload = {
        skills: [
          { name: 'Python', proficiency: 'EXPERT' },
          { name: 'PyTorch', proficiency: 'ADVANCED' },
          { name: 'TypeScript', proficiency: 'INTERMEDIATE' },
        ],
      };

      const res = await fetch(`${baseUrl}/api/members/me/skills`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify(skillsPayload),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.equal(body.data.length, 3);
      const pythonSkill = body.data.find((s: any) => s.name === 'Python');
      assert.ok(pythonSkill);
      assert.equal(pythonSkill.proficiency, 'EXPERT');
    });

    test('PUT /api/members/me/interests updates student interests', async () => {
      const interestsPayload = {
        interests: ['Generative AI', 'Computer Vision', 'Robotics'],
      };

      const res = await fetch(`${baseUrl}/api/members/me/interests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify(interestsPayload),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.equal(body.data.length, 3);
    });
  });

  describe('3. Personalized Student Dashboard', () => {
    test('GET /api/dashboard returns personalized stats, profile, activity, and announcements', async () => {
      const res = await fetch(`${baseUrl}/api/dashboard`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      const data = body.data;

      // Profile & Greeting
      assert.ok(data.profile);
      assert.equal(data.profile.fullName, 'Rahul Sharma');
      assert.ok(data.profileCompletion);

      // Real Stats
      assert.ok(data.stats);
      assert.ok(typeof data.stats.projects === 'number');
      assert.ok(typeof data.stats.courses === 'number');
      assert.ok(typeof data.stats.achievements === 'number');
      assert.ok(typeof data.stats.events === 'number');

      // Activity Feed & Announcements
      assert.ok(Array.isArray(data.recentActivity));
      assert.ok(Array.isArray(data.announcements));
      assert.ok(Array.isArray(data.recentProjects));
    });

    test('GET /api/dashboard rejects unauthenticated request with 401', async () => {
      const res = await fetch(`${baseUrl}/api/dashboard`);
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'UNAUTHORIZED');
    });
  });

  describe('4. Member Directory & Public Profiles', () => {
    test('GET /api/members returns paginated list of active members without sensitive fields', async () => {
      const res = await fetch(`${baseUrl}/api/members?page=1&limit=10`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length >= 2);
      assert.ok(body.pagination);
      assert.ok(body.pagination.total >= 2);

      // Check field sanitization: no password hash or private credentials
      const first = body.data[0];
      assert.ok(first.fullName);
      assert.ok(first.department);
      assert.equal(first.password_hash, undefined);
      assert.equal(first.passwordHash, undefined);
    });

    test('GET /api/members filters by search query on skills and name', async () => {
      const res = await fetch(`${baseUrl}/api/members?search=Python`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.data.length >= 1);
      assert.ok(body.data.some((m: any) => m.fullName.includes('Rahul') || m.fullName.includes('Ananya')));
    });

    test('GET /api/members/:id returns public profile for single member', async () => {
      const res = await fetch(`${baseUrl}/api/members/${studentMemberId}`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.id, studentMemberId);
      assert.equal(body.data.fullName, 'Rahul Sharma');
    });

    test('GET /api/members/:id returns 404 for nonexistent ID', async () => {
      const res = await fetch(`${baseUrl}/api/members/00000000-0000-0000-0000-000000000000`);
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'NOT_FOUND');
    });
  });

  describe('5. Profile Ownership & Security', () => {
    test('Student token always updates own profile and cannot tamper with another student profile', async () => {
      // Second student tries to pass primary student's memberId in body
      const res = await fetch(`${baseUrl}/api/members/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secondStudentToken}`,
        },
        body: JSON.stringify({
          memberId: studentMemberId,
          bio: 'Hacked bio by another student',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      // The update only applies to the second student's profile (Ananya Patel)
      assert.equal(body.data.fullName, 'Ananya Patel');
      assert.equal(body.data.bio, 'Hacked bio by another student');

      // Verify Rahul Sharma profile was NOT modified
      const rahulRes = await fetch(`${baseUrl}/api/members/me`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(rahulRes.status, 200);
      const rahulBody = await rahulRes.json();
      assert.equal(rahulBody.data.fullName, 'Rahul Sharma');
      assert.notEqual(rahulBody.data.bio, 'Hacked bio by another student');
    });
  });
});
