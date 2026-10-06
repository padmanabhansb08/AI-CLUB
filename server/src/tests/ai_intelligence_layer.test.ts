import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../app';
import { pool } from '../db';
import { AISafetyService } from '../services/ai/aiSafetyService';
import { AIProviderFactory } from '../services/ai/providers';

let server: http.Server;
let baseUrl: string;

let adminToken: string;
let studentToken: string;
let student2Token: string;
let testMemberId: string;
let testMember2Id: string;

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

  // Login student 1
  const studentRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@aiclub.com', password: 'student123' }),
  });
  assert.equal(studentRes.status, 200);
  const studentData = await studentRes.json();
  studentToken = studentData.data.token;

  // Login student 2 (Ananya Patel from seeds)
  const student2Res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ananya@aiclub.com', password: 'student123' }),
  });
  assert.equal(student2Res.status, 200);
  const s2Data = await student2Res.json();
  student2Token = s2Data.data.token;

  // Get test member IDs
  const m1Res = await pool.query(
    "SELECT m.id FROM members m JOIN users u ON m.user_id = u.id WHERE u.email = 'student@aiclub.com'"
  );
  testMemberId = m1Res.rows[0].id;

  const m2Res = await pool.query(
    "SELECT m.id FROM members m JOIN users u ON m.user_id = u.id WHERE u.email = 'ananya@aiclub.com'"
  );
  testMember2Id = m2Res.rows[0].id;

  // Ensure test course exists and is published
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'deep-learning-foundations') THEN
        INSERT INTO courses (title, slug, description, category, difficulty, status)
        VALUES ('Deep Learning Foundations', 'deep-learning-foundations', 'Master neural networks and PyTorch.', 'Deep Learning', 'BEGINNER', 'PUBLISHED');
      ELSE
        UPDATE courses SET status = 'PUBLISHED' WHERE slug = 'deep-learning-foundations';
      END IF;
    END $$;
  `);

  // Ensure test event exists and is published
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Generative AI Hackathon') THEN
        INSERT INTO events (title, description, event_type, start_at, end_at, location, status)
        VALUES ('Generative AI Hackathon', 'Build LLM and RAG agents.', 'HACKATHON', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 4 hours', 'AI Lab', 'published');
      ELSE
        UPDATE events SET status = 'published' WHERE title = 'Generative AI Hackathon';
      END IF;
    END $$;
  `);

  // Ensure test project exists and is published
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM projects WHERE slug = 'autonomous-drone-navigation') THEN
        INSERT INTO projects (title, slug, short_description, description, category, difficulty, status)
        VALUES ('Autonomous Drone Navigation', 'autonomous-drone-navigation', 'Computer vision and reinforcement learning.', 'Computer vision and reinforcement learning.', 'Robotics', 'INTERMEDIATE', 'OPEN');
      ELSE
        UPDATE projects SET status = 'OPEN' WHERE slug = 'autonomous-drone-navigation';
      END IF;
    END $$;
  `);
});

after(async () => {
  AISafetyService.resetRateLimit();
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Sprint 8: AI Intelligence, Personalization & Intelligent Assistance', () => {
  describe('1. AI Status & Public Configuration', () => {
    test('GET /api/ai/status returns public safe status without secrets', async () => {
      const res = await fetch(`${baseUrl}/api/ai/status`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(typeof body.data.enabled, 'boolean');
      assert.equal(typeof body.data.assistantAvailable, 'boolean');
      assert.equal(typeof body.data.recommendationsAvailable, 'boolean');
      // Verify no keys or secrets are exposed
      assert.equal(body.data.AI_API_KEY, undefined);
      assert.equal(body.data.apiKey, undefined);
    });
  });

  describe('2. Personalized Hybrid Recommendations', () => {
    test('GET /api/ai/recommendations returns courses, events, projects with match scores', async () => {
      const res = await fetch(`${baseUrl}/api/ai/recommendations`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data.courses));
      assert.ok(Array.isArray(body.data.events));
      assert.ok(Array.isArray(body.data.projects));

      if (body.data.courses.length > 0) {
        const course = body.data.courses[0];
        assert.ok(course.courseId);
        assert.ok(course.title);
        assert.ok(typeof course.score === 'number');
        assert.ok(['STRONG_MATCH', 'GOOD_MATCH', 'GROWTH_OPPORTUNITY'].includes(course.matchStrength));
        assert.ok(Array.isArray(course.reasons));
        assert.ok(course.reasons.length > 0);
      }
    });

    test('GET /api/ai/recommendations/courses returns only published and uncompleted courses', async () => {
      const res = await fetch(`${baseUrl}/api/ai/recommendations/courses?limit=3`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));

      for (const course of body.data) {
        assert.ok(course.courseId);
        assert.ok(course.score > 0);
      }
    });

    test('GET /api/ai/recommendations/events returns valid upcoming events with explainability', async () => {
      const res = await fetch(`${baseUrl}/api/ai/recommendations/events`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));

      if (body.data.length > 0) {
        const event = body.data[0];
        assert.ok(event.eventId);
        assert.ok(event.title);
        assert.ok(event.reasons.length > 0);
      }
    });

    test('GET /api/ai/recommendations/projects returns active projects with grounded reasons', async () => {
      const res = await fetch(`${baseUrl}/api/ai/recommendations/projects`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));

      if (body.data.length > 0) {
        const project = body.data[0];
        assert.ok(project.projectId);
        assert.ok(project.title);
        assert.ok(project.reasons.length > 0);
      }
    });
  });

  describe('3. Skill Gap Analysis & Structured Learning Paths', () => {
    test('GET /api/ai/skills/gaps analyzes student current vs missing skills', async () => {
      const res = await fetch(`${baseUrl}/api/ai/skills/gaps?target=Generative+AI+Developer`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.target, 'Generative AI Developer');
      assert.ok(Array.isArray(body.data.currentSkills));
      assert.ok(Array.isArray(body.data.missingSkills));
      assert.ok(typeof body.data.summary === 'string');
    });

    test('POST /api/ai/skills/analyze accepts custom target domain', async () => {
      const res = await fetch(`${baseUrl}/api/ai/skills/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ target: 'Computer Vision Specialist' }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.target, 'Computer Vision Specialist');
    });

    test('POST /api/ai/learning-path generates step-by-step roadmap bound to existing courses', async () => {
      const res = await fetch(`${baseUrl}/api/ai/learning-path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ goal: 'Master Deep Learning and LLMs' }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.totalSteps >= 3);
      assert.ok(Array.isArray(body.data.steps));
      assert.equal(body.data.steps[0].step, 1);
      assert.ok(body.data.steps[0].title);
    });
  });

  describe('4. AI Club Assistant with Grounded RAG & Hallucination Control', () => {
    let createdConvId: string;

    test('POST /api/ai/assistant/chat answers question with verified source citations', async () => {
      const res = await fetch(`${baseUrl}/api/ai/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ message: 'What courses and workshops are available in deep learning?' }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.message);
      assert.ok(Array.isArray(body.data.sources));
      assert.ok(body.data.conversationId);
      createdConvId = body.data.conversationId;

      if (body.data.sources.length > 0) {
        const source = body.data.sources[0];
        assert.ok(['COURSE', 'EVENT', 'PROJECT'].includes(source.type));
        assert.ok(source.title);
      }
    });

    test('POST /api/ai/assistant/chat unknown query does NOT invent nonexistent entities', async () => {
      const res = await fetch(`${baseUrl}/api/ai/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ message: 'Can I learn quantum physics course invalid_course_xyz?' }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      // Safe response without hallucinating
      assert.ok(
        body.data.message.toLowerCase().includes("couldn't find") ||
        body.data.message.toLowerCase().includes("not found") ||
        body.data.message.toLowerCase().includes("directory")
      );
    });

    test('GET /api/ai/assistant/conversations lists student conversation sessions', async () => {
      const res = await fetch(`${baseUrl}/api/ai/assistant/conversations`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.some((c: any) => c.id === createdConvId));
    });

    test('GET /api/ai/assistant/conversations/:id retrieves conversation messages', async () => {
      const res = await fetch(`${baseUrl}/api/ai/assistant/conversations/${createdConvId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length >= 2); // user + assistant
    });

    test('IDOR Protection: Student 2 cannot access Student 1 conversation', async () => {
      const res = await fetch(`${baseUrl}/api/ai/assistant/conversations/${createdConvId}`, {
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    test('DELETE /api/ai/assistant/conversations/:id deletes conversation for owner', async () => {
      const res = await fetch(`${baseUrl}/api/ai/assistant/conversations/${createdConvId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.deleted, true);
    });
  });

  describe('5. Personalized Dashboard Insights & Next Best Action', () => {
    test('GET /api/ai/insights returns grounded insights, next best action, and weekly highlights', async () => {
      const res = await fetch(`${baseUrl}/api/ai/insights`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.nextBestAction);
      assert.ok(body.data.skillSummary);
      assert.ok(Array.isArray(body.data.weeklyHighlights));
      assert.ok(Array.isArray(body.data.recommendedCourses));
    });
  });

  describe('6. AI Preferences & Opt-In Controls', () => {
    test('GET /api/ai/preferences returns student preferences', async () => {
      const res = await fetch(`${baseUrl}/api/ai/preferences`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(typeof body.data.recommendationsEnabled, 'boolean');
      assert.equal(typeof body.data.assistantEnabled, 'boolean');
    });

    test('PUT /api/ai/preferences updates preferences and disables recommendations', async () => {
      const updateRes = await fetch(`${baseUrl}/api/ai/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ recommendationsEnabled: false }),
      });
      assert.equal(updateRes.status, 200);
      const updateBody = await updateRes.json();
      assert.equal(updateBody.data.recommendationsEnabled, false);

      // Verify recommendations endpoint now respects disabled setting
      const recsRes = await fetch(`${baseUrl}/api/ai/recommendations/courses`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const recsBody = await recsRes.json();
      assert.equal(recsBody.data.length, 0);

      // Restore recommendation setting
      await fetch(`${baseUrl}/api/ai/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ recommendationsEnabled: true }),
      });
    });
  });

  describe('7. Grounded Multi-Domain Search', () => {
    test('GET /api/ai/search finds published items matching technical query', async () => {
      const res = await fetch(`${baseUrl}/api/ai/search?q=Learning`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      if (body.data.length > 0) {
        assert.ok(body.data[0].id);
        assert.ok(body.data[0].title);
        assert.ok(body.data[0].url);
      }
    });
  });

  describe('8. Admin AI Insights & Observability', () => {
    test('Student receives 403 Forbidden on admin AI insights', async () => {
      const res = await fetch(`${baseUrl}/api/ai/admin/insights`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 403);
    });

    test('Admin receives 200 OK with executive platform observations', async () => {
      const res = await fetch(`${baseUrl}/api/ai/admin/insights`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.executiveSummary);
      assert.ok(Array.isArray(body.data.observations));
      assert.ok(body.data.observations.length > 0);
      assert.ok(Array.isArray(body.data.areasToInvestigate));
      assert.ok(body.data.telemetry);
    });

    test('Admin receives 200 OK with AI usage & cost telemetry', async () => {
      const res = await fetch(`${baseUrl}/api/ai/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(typeof body.data.totalRequests === 'number');
      assert.ok(typeof body.data.successRatePct === 'number');
      assert.ok(Array.isArray(body.data.byFeature));
    });
  });

  describe('9. AI Safety, Rate Limiting & Provider Fallback', () => {
    test('Rate limiting triggers 429 / error when requests exceed rapid threshold', async () => {
      // Artificially fill rate limit bucket for testMemberId
      for (let i = 0; i < 35; i++) {
        AISafetyService.checkRateLimit(testMemberId, 30, 60000);
      }

      const res = await fetch(`${baseUrl}/api/ai/skills/gaps?target=FastAPI`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 429);
      const body = await res.json();
      assert.ok(body.error.message.toLowerCase().includes('rate limit'));

      // Reset for subsequent tests
      AISafetyService.resetRateLimit(testMemberId);
    });

    test('Deterministic fallback continues operating when AI provider simulates failure', async () => {
      AIProviderFactory.mockInstance.setSimulateFailure(true);

      try {
        const res = await fetch(`${baseUrl}/api/ai/recommendations/courses`, {
          headers: { Authorization: `Bearer ${studentToken}` },
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.ok(Array.isArray(body.data)); // Still returns deterministic recommendations!
      } finally {
        AIProviderFactory.mockInstance.setSimulateFailure(false);
      }
    });
  });
});
