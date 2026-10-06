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

let createdAchievementId: string;
let createdNotificationId: string;

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

  // Fetch member IDs
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

describe('Sprint 6: Achievements + Notifications + Activity Recognition', () => {
  // -------------------------------------------------------------
  // 1. Achievement Model, Lifecycle & Admin RBAC
  // -------------------------------------------------------------
  describe('1. Achievement Management & Admin RBAC', () => {
    test('Admin successfully creates a data-driven achievement', async () => {
      const rand = Math.floor(1000 + Math.random() * 9000);
      const res = await fetch(`${baseUrl}/api/admin/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: `AI Model Innovator ${rand}`,
          description: 'Deployed and verified an original transformer architecture benchmark.',
          category: 'LEARNING',
          criteria_type: 'COURSE_COMPLETION_COUNT',
          criteria_config: { target: 2 },
          points: 75,
          icon: 'Sparkles',
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.data.id);
      assert.equal(data.data.points, 75);
      createdAchievementId = data.data.id;
    });

    test('Creating achievement with missing fields returns HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/api/admin/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ points: 50 }),
      });
      assert.equal(res.status, 400);
    });

    test('Student cannot create an achievement (HTTP 403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          name: 'Hacker Achievement',
          description: 'Illegal achievement',
        }),
      });
      assert.equal(res.status, 403);
    });

    test('Admin deactivates and re-activates an achievement', async () => {
      const deactRes = await fetch(`${baseUrl}/api/admin/achievements/${createdAchievementId}/deactivate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(deactRes.status, 200);
      const deactData = await deactRes.json();
      assert.equal(deactData.data.is_active, false);

      const actRes = await fetch(`${baseUrl}/api/admin/achievements/${createdAchievementId}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(actRes.status, 200);
      const actData = await actRes.json();
      assert.equal(actData.data.is_active, true);
    });

    test('Admin retrieves global achievement statistics', async () => {
      const res = await fetch(`${baseUrl}/api/admin/achievements/stats/global`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(typeof data.data.totalAwards === 'number');
      assert.ok(Array.isArray(data.data.mostEarned));
    });
  });

  // -------------------------------------------------------------
  // 2. Achievement Discovery & Progress Tracking
  // -------------------------------------------------------------
  describe('2. Achievement Discovery & Progress Tracking', () => {
    test('Public / Student lists all achievements with category filters', async () => {
      const res = await fetch(`${baseUrl}/api/achievements?category=EVENT`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.data.length >= 1);
      assert.ok(data.data.every((a: any) => a.category === 'EVENT'));
    });

    test('Authenticated student retrieves achievement progress', async () => {
      const res = await fetch(`${baseUrl}/api/achievements/me/progress`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.data.length > 0);
      const item = data.data[0];
      assert.ok(item.achievement);
      assert.ok(typeof item.progress.current === 'number');
      assert.ok(typeof item.progress.target === 'number');
      assert.ok(typeof item.progress.percentage === 'number');
      assert.ok(typeof item.earned === 'boolean');
    });

    test('Student views single achievement detail with enriched progress', async () => {
      const res = await fetch(`${baseUrl}/api/achievements/${createdAchievementId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.id, createdAchievementId);
      assert.ok(typeof data.data.target_progress === 'number');
      assert.ok(typeof data.data.progress_percentage === 'number');
    });

    test('Student retrieves my statistics (total earned, total points)', async () => {
      const res = await fetch(`${baseUrl}/api/achievements/me/stats`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(typeof data.data.totalEarned === 'number');
      assert.ok(typeof data.data.totalPoints === 'number');
    });
  });

  // -------------------------------------------------------------
  // 3. Automated Achievement Awarding & Idempotency
  // -------------------------------------------------------------
  describe('3. Automated Achievement Awarding & Idempotency', () => {
    test('Student triggers evaluation and receives awards for fulfilled criteria', async () => {
      // Award an achievement criterion by ensuring a course enrollment or event
      const res = await fetch(`${baseUrl}/api/achievements/me/evaluate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data));
    });

    test('Repeated evaluation is strictly idempotent and does not duplicate awards', async () => {
      const res1 = await fetch(`${baseUrl}/api/achievements/me/evaluate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res1.status, 200);

      const res2 = await fetch(`${baseUrl}/api/achievements/me/evaluate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res2.status, 200);
      const data2 = await res2.json();
      // On second call with same state, newly awarded should be 0
      assert.equal(data2.data.length, 0);
    });

    test('Database UNIQUE(member_id, achievement_id) rejects duplicate insert attempt', async () => {
      const achievements = await pool.query('SELECT id FROM achievements LIMIT 1');
      const achId = achievements.rows[0].id;

      // Direct manual insert test for database integrity
      await pool.query(
        `INSERT INTO member_achievements (member_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [studentMemberId, achId]
      );

      // Attempt second raw insert without ON CONFLICT must throw unique constraint error
      await assert.rejects(async () => {
        await pool.query(
          `INSERT INTO member_achievements (member_id, achievement_id) VALUES ($1, $2)`,
          [studentMemberId, achId]
        );
      }, /unique_member_achievement/);
    });
  });

  // -------------------------------------------------------------
  // 4. Notifications & Unread Counts
  // -------------------------------------------------------------
  describe('4. Notification System & Unread Management', () => {
    test('Student receives persistent notifications and lists them with pagination', async () => {
      // Inject a test notification for the student
      const insert = await pool.query(
        `INSERT INTO notifications (recipient_id, type, title, message, data, priority)
         VALUES ($1, 'SYSTEM_ANNOUNCEMENT', 'Sprint 6 Launched', 'Achievements and notifications are now active.', '{"test": true}', 'NORMAL')
         RETURNING id`,
        [studentMemberId]
      );
      createdNotificationId = insert.rows[0].id;

      const res = await fetch(`${baseUrl}/api/notifications?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.data.length >= 1);
      assert.ok(typeof data.pagination.unreadCount === 'number');
    });

    test('Student fetches unread notification count', async () => {
      const res = await fetch(`${baseUrl}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.data.count >= 1);
    });

    test('Student marks a single notification as read', async () => {
      const res = await fetch(`${baseUrl}/api/notifications/${createdNotificationId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.data.read_at !== null);
    });

    test('Student cannot mark another student notification as read (HTTP 403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/notifications/${createdNotificationId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secondStudentToken}` },
      });
      assert.equal(res.status, 403);
    });

    test('Student marks all notifications as read', async () => {
      const res = await fetch(`${baseUrl}/api/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);

      // Verify unread count is now 0
      const countRes = await fetch(`${baseUrl}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const countData = await countRes.json();
      assert.equal(countData.data.count, 0);
    });
  });

  // -------------------------------------------------------------
  // 5. Notification Preferences & Activity Feed
  // -------------------------------------------------------------
  describe('5. Notification Preferences & Activity Feed', () => {
    test('Student gets default notification preferences', async () => {
      const res = await fetch(`${baseUrl}/api/notifications/preferences`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.event_notifications, true);
      assert.equal(data.data.achievement_notifications, true);
    });

    test('Student updates notification preferences', async () => {
      const res = await fetch(`${baseUrl}/api/notifications/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          achievement_notifications: false,
          team_notifications: true,
        }),
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.data.achievement_notifications, false);

      // Restore preference for further tests
      await fetch(`${baseUrl}/api/notifications/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ achievement_notifications: true }),
      });
    });

    test('Student retrieves chronological activity feed', async () => {
      const res = await fetch(`${baseUrl}/api/notifications/activity`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data));
    });
  });

  // -------------------------------------------------------------
  // 6. Admin Announcements & Controlled Targeting
  // -------------------------------------------------------------
  describe('6. Admin Announcements & Controlled Targeting', () => {
    test('Admin sends targeted announcement to ALL_MEMBERS', async () => {
      const res = await fetch(`${baseUrl}/api/admin/notifications/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Campus Hackathon 2026 Announcement',
          message: 'Registrations are now open for the annual AI challenge.',
          audience: 'ALL_MEMBERS',
          priority: 'HIGH',
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.data.recipientCount >= 1);
    });

    test('Student cannot send announcements (HTTP 403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/notifications/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          title: 'Spam Announcement',
          message: 'Unauthorized announcement',
          audience: 'ALL_MEMBERS',
        }),
      });
      assert.equal(res.status, 403);
    });

    test('Admin views delivery history and statistics', async () => {
      const res = await fetch(`${baseUrl}/api/admin/notifications/history`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(typeof data.pagination.stats.totalSent === 'number');
    });
  });

  // -------------------------------------------------------------
  // 7. Domain Triggers Integration (Events, Courses, Projects)
  // -------------------------------------------------------------
  describe('7. Domain Triggers Integration (Sprints 3-5 -> Sprint 6)', () => {
    test('Event registration automatically creates EVENT_REGISTRATION_CONFIRMED notification', async () => {
      let eventId: string;
      const evRes = await pool.query(
        `SELECT id, title FROM events 
         WHERE status = 'published' 
           AND start_at > CURRENT_TIMESTAMP 
           AND (registration_close_at IS NULL OR registration_close_at > CURRENT_TIMESTAMP)
           AND (registration_open_at IS NULL OR registration_open_at <= CURRENT_TIMESTAMP)
         LIMIT 1`
      );

      if (evRes.rows.length > 0) {
        eventId = evRes.rows[0].id;
      } else {
        const created = await pool.query(
          `INSERT INTO events (title, description, event_type, status, start_at, end_at, registration_open_at, registration_close_at, capacity, created_by)
           VALUES ('Sprint 6 Auto Workshop', 'A hands-on workshop for Sprint 6 testing', 'WORKSHOP', 'published', NOW() + INTERVAL '2 days', NOW() + INTERVAL '3 days', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', 100, (SELECT id FROM users WHERE role = 'admin' LIMIT 1))
           RETURNING id, title`
        );
        eventId = created.rows[0].id;
      }

      await pool.query('DELETE FROM event_registrations WHERE event_id = $1 AND member_id = $2', [eventId, secondStudentMemberId]);

      // Register second student
      const regRes = await fetch(`${baseUrl}/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secondStudentToken}` },
      });
      assert.equal(regRes.status, 200);

      // Check second student's notifications
      const notifRes = await fetch(`${baseUrl}/api/notifications?limit=5`, {
        headers: { Authorization: `Bearer ${secondStudentToken}` },
      });
      const notifData = await notifRes.json();
      const found = notifData.data.find(
        (n: any) => n.type === 'EVENT_REGISTRATION_CONFIRMED' && n.data?.eventId === eventId
      );
      assert.ok(found, 'Expected EVENT_REGISTRATION_CONFIRMED notification to exist');
    });

    test('Dashboard integration returns points, unread notifications and achievements', async () => {
      const res = await fetch(`${baseUrl}/api/dashboard`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(typeof data.data.stats.achievements === 'number');
      assert.ok(typeof data.data.stats.points === 'number');
      assert.ok(typeof data.data.stats.unreadNotifications === 'number');
      assert.ok(Array.isArray(data.data.recentAchievements));
      assert.ok(Array.isArray(data.data.recentNotifications));
    });
  });
});
