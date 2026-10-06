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

let studentMemberId: string;
let secondStudentMemberId: string;

let createdCourseId: string;
let createdCourseSlug: string;
let createdModuleId: string;
let createdLesson1Id: string;
let createdLesson2Id: string;
let previewLessonId: string;

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

  // Fetch student member IDs
  const m1 = await pool.query("SELECT id FROM members WHERE college_email = 'student@aiclub.com'");
  studentMemberId = m1.rows[0]?.id;

  const m2 = await pool.query("SELECT id FROM members WHERE college_email = 'ananya@aiclub.com'");
  secondStudentMemberId = m2.rows[0]?.id;
});

after(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

describe('Sprint 5: Courses + Learning Management System (LMS)', () => {
  // -------------------------------------------------------------
  // 1. Course Creation, Lifecycle & RBAC
  // -------------------------------------------------------------
  describe('1. Course Creation, Lifecycle & RBAC', () => {
    test('Admin successfully creates a course defaulting to DRAFT', async () => {
      const rand = Math.floor(1000 + Math.random() * 9000);
      const res = await fetch(`${baseUrl}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: `Deep Reinforcement Learning Foundations ${rand}`,
          description: 'A comprehensive curriculum covering MDPs, Bellman equations, Q-learning, Policy Gradients, PPO, and actor-critic algorithms.',
          short_description: 'Master reinforcement learning from mathematics to robotic deployment.',
          category: 'AI_ML',
          difficulty: 'ADVANCED',
          estimated_duration_minutes: 480,
          learning_objectives: ['Implement Q-learning and DQN', 'Master Policy Gradients and PPO'],
          prerequisites: ['Python proficiency', 'Linear algebra foundation'],
          technologies: ['PyTorch', 'Gymnasium', 'Ray RLlib'],
          skills: ['Reinforcement Learning', 'PyTorch'],
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'DRAFT');
      assert.ok(body.data.id);
      assert.ok(body.data.slug);

      createdCourseId = body.data.id;
      createdCourseSlug = body.data.slug;
    });

    test('Creating course with invalid or short description returns HTTP 400 VALIDATION_ERROR', async () => {
      const res = await fetch(`${baseUrl}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Too short',
          description: 'Short', // < 10 chars
          category: 'AI_ML',
          difficulty: 'BEGINNER',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    });

    test('Student cannot create a course (HTTP 403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          title: 'Student Attempted Course',
          description: 'Students should not be permitted to create courses without instructor privileges.',
          category: 'AI_ML',
          difficulty: 'BEGINNER',
        }),
      });

      assert.equal(res.status, 403);
    });

    test('Unauthenticated user cannot create course (HTTP 401 UNAUTHORIZED)', async () => {
      const res = await fetch(`${baseUrl}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthorized Course',
          description: 'An unauthenticated request must fail.',
          category: 'AI_ML',
          difficulty: 'BEGINNER',
        }),
      });

      assert.equal(res.status, 401);
    });

    test('DRAFT course is hidden from student discovery and student access', async () => {
      const listRes = await fetch(`${baseUrl}/api/courses?search=Reinforcement`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(listRes.status, 200);
      const listBody = await listRes.json();
      const found = listBody.data.some((c: any) => c.id === createdCourseId);
      assert.equal(found, false, 'Draft course must not be in student search results');

      const detailRes = await fetch(`${baseUrl}/api/courses/${createdCourseId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(detailRes.status, 403);
    });

    test('Attempting to publish course with 0 modules/lessons fails validation (HTTP 400)', async () => {
      const pubRes = await fetch(`${baseUrl}/api/courses/${createdCourseId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(pubRes.status, 400);
      const pubBody = await pubRes.json();
      assert.equal(pubBody.success, false);
      assert.ok(pubBody.error.message.includes('COURSE_PUBLISH_VALIDATION_FAILED'));
    });
  });

  // -------------------------------------------------------------
  // 2. Curriculum: Modules & Lessons Management
  // -------------------------------------------------------------
  describe('2. Curriculum: Modules & Lessons Management', () => {
    test('Admin creates a module in the course', async () => {
      const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Module 1: Foundations of Markov Decision Processes',
          description: 'States, Actions, Reward signals, and Transition dynamics.',
          position: 1,
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.id);
      assert.equal(body.data.position, 1);
      createdModuleId = body.data.id;
    });

    test('Admin creates lesson 1 (ARTICLE) with preview enabled', async () => {
      const res = await fetch(`${baseUrl}/api/modules/${createdModuleId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Introduction to MDPs and Bellman Equations',
          content_type: 'ARTICLE',
          content: '<h1>Markov Decision Process</h1><p>An MDP is defined by the 5-tuple (S, A, P, R, gamma).</p>',
          position: 1,
          duration_minutes: 25,
          is_preview: true,
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.is_preview, true);
      createdLesson1Id = body.data.id;
      previewLessonId = body.data.id;
    });

    test('Admin creates lesson 2 (VIDEO) protected for enrolled students', async () => {
      const res = await fetch(`${baseUrl}/api/modules/${createdModuleId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Implementing Deep Q-Networks (DQN) with PyTorch',
          content_type: 'VIDEO',
          video_url: 'https://youtube.com/watch?v=dqn_rl_demo',
          description: 'Code walkthrough creating experience replay buffer, target network, and epsilon-greedy exploration.',
          position: 2,
          duration_minutes: 40,
          is_preview: false,
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.is_preview, false);
      createdLesson2Id = body.data.id;
    });

    test('Admin publishes course now that modules and lessons exist', async () => {
      const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'PUBLISHED');
      assert.ok(body.data.published_at);
    });

    test('Unenrolled student can access preview lesson 1, but is blocked from lesson 2 (HTTP 403)', async () => {
      // Preview lesson is accessible
      const previewRes = await fetch(`${baseUrl}/api/lessons/${previewLessonId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(previewRes.status, 200);
      const previewBody = await previewRes.json();
      assert.equal(previewBody.success, true);
      assert.equal(previewBody.data.id, previewLessonId);

      // Protected lesson is forbidden for unenrolled student
      const protectedRes = await fetch(`${baseUrl}/api/lessons/${createdLesson2Id}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(protectedRes.status, 403);
    });
  });

  // -------------------------------------------------------------
  // 3. Course Discovery, Search, Filtering & Detail
  // -------------------------------------------------------------
  describe('3. Course Discovery, Search, Filtering & Detail', () => {
    test('Published course appears in search results and filters by category and difficulty', async () => {
      const res = await fetch(`${baseUrl}/api/courses?search=Reinforcement&category=AI_ML&difficulty=ADVANCED`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.length >= 1);
      const item = body.data.find((c: any) => c.id === createdCourseId);
      assert.ok(item);
      assert.equal(item.category, 'AI_ML');
      assert.equal(item.difficulty, 'ADVANCED');
    });

    test('GET course by ID and by Slug returns complete item with curriculum counts', async () => {
      const byId = await fetch(`${baseUrl}/api/courses/${createdCourseId}`);
      assert.equal(byId.status, 200);
      const bData = await byId.json();
      assert.equal(bData.data.id, createdCourseId);
      assert.equal(bData.data.modules_count, 1);
      assert.equal(bData.data.lessons_count, 2);

      const bySlug = await fetch(`${baseUrl}/api/courses/${createdCourseSlug}`);
      assert.equal(bySlug.status, 200);
      const sData = await bySlug.json();
      assert.equal(sData.data.id, createdCourseId);
    });

    test('GET /api/courses/:id/curriculum returns modules and ordered lessons', async () => {
      const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/curriculum`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.length, 1);
      assert.equal(body.data[0].lessons.length, 2);
      assert.equal(body.data[0].lessons[0].position, 1);
      assert.equal(body.data[0].lessons[1].position, 2);
    });

    test('GET nonexistent course returns HTTP 404', async () => {
      const res = await fetch(`${baseUrl}/api/courses/00000000-0000-0000-0000-000000000000`);
      assert.equal(res.status, 404);
    });
  });

  // -------------------------------------------------------------
  // 4. Course Enrollments
  // -------------------------------------------------------------
  describe('4. Course Enrollments', () => {
    test('Student enrolls in published course: status becomes ENROLLED', async () => {
      const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'ENROLLED');
      assert.ok(body.data.enrolled_at);
    });

    test('Duplicate enrollment by same student returns HTTP 409 CONFLICT', async () => {
      const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 409);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'CONFLICT');
    });

    test('Student views their enrolled courses via GET /api/courses/me and GET /api/me/courses', async () => {
      const res1 = await fetch(`${baseUrl}/api/courses/me`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res1.status, 200);
      const body1 = await res1.json();
      assert.equal(body1.success, true);
      const item1 = body1.data.find((e: any) => e.course_id === createdCourseId);
      assert.ok(item1);
      assert.equal(item1.status, 'ENROLLED');

      const res2 = await fetch(`${baseUrl}/api/me/courses`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res2.status, 200);
      const body2 = await res2.json();
      assert.equal(body2.success, true);
      const item2 = body2.data.find((e: any) => e.course_id === createdCourseId);
      assert.ok(item2);
    });

    test('Enrolled student can now access protected lesson 2', async () => {
      const res = await fetch(`${baseUrl}/api/lessons/${createdLesson2Id}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.title, 'Implementing Deep Q-Networks (DQN) with PyTorch');
    });
  });

  // -------------------------------------------------------------
  // 5. Lesson Progress, Course Completion & Resume
  // -------------------------------------------------------------
  describe('5. Lesson Progress, Course Completion & Resume', () => {
    test('Student starts lesson 1: progress becomes IN_PROGRESS', async () => {
      const res = await fetch(`${baseUrl}/api/lessons/${createdLesson1Id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'IN_PROGRESS');
      assert.ok(body.data.started_at);
    });

    test('Student updates progress percentage on lesson 1', async () => {
      const res = await fetch(`${baseUrl}/api/lessons/${createdLesson1Id}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          progress_percentage: 60,
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.progress_percentage, 60);
    });

    test('Student completes lesson 1: course progress becomes 50%', async () => {
      const res = await fetch(`${baseUrl}/api/lessons/${createdLesson1Id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'COMPLETED');
      assert.equal(body.data.progress_percentage, 100);
      assert.ok(body.data.completed_at);

      // Check course progress summary
      const progRes = await fetch(`${baseUrl}/api/courses/${createdCourseId}/progress`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(progRes.status, 200);
      const progBody = await progRes.json();
      assert.equal(progBody.data.progress.percentage, 50);
      assert.equal(progBody.data.progress.completedLessons, 1);
      assert.equal(progBody.data.progress.totalLessons, 2);
      assert.equal(progBody.data.currentLesson.id, createdLesson2Id, 'Resume points to lesson 2');
    });

    test('Student completes lesson 2: course automatically transitions to COMPLETED', async () => {
      const res = await fetch(`${baseUrl}/api/lessons/${createdLesson2Id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'COMPLETED');

      // Check enrollment status
      const enrRes = await fetch(`${baseUrl}/api/courses/${createdCourseId}/enrollment`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(enrRes.status, 200);
      const enrBody = await enrRes.json();
      assert.equal(enrBody.data.status, 'COMPLETED');
      assert.ok(enrBody.data.completed_at);

      // Check course progress summary
      const progRes = await fetch(`${baseUrl}/api/courses/${createdCourseId}/progress`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(progRes.status, 200);
      const progBody = await progRes.json();
      assert.equal(progBody.data.progress.percentage, 100);
      assert.equal(progBody.data.progress.completedLessons, 2);
    });
  });

  // -------------------------------------------------------------
  // 6. Analytics & Dashboard Integration
  // -------------------------------------------------------------
  describe('6. Analytics & Dashboard Integration', () => {
    test('Second student enrolls, leaving course at active in-progress state', async () => {
      const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secondStudentToken}` },
      });
      assert.equal(res.status, 201);
    });

    test('Admin retrieves course analytics with completion rate and learners breakdown', async () => {
      const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.totalEnrollments, 2);
      assert.equal(body.data.completedLearners, 1);
      assert.equal(body.data.activeLearners, 1);
      assert.equal(body.data.completionRate, 50);
    });

    test('Non-admin student cannot view analytics (HTTP 403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}/analytics`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 403);
    });

    test('Student dashboard (GET /api/dashboard) returns myCourses and continueLearning', async () => {
      const res = await fetch(`${baseUrl}/api/dashboard`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data.myCourses));
      assert.ok(body.data.myCourses.length >= 1);
      const found = body.data.myCourses.some((c: any) => c.id === createdCourseId);
      assert.ok(found);
    });
  });
});
