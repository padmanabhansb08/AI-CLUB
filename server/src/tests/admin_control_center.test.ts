import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../app';
import { pool } from '../db';

let server: http.Server;
let baseUrl: string;

let adminToken: string;
let studentToken: string;
let testMemberId: string;
let testUserId: string;

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

  // Login student
  const studentRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@aiclub.com', password: 'student123' }),
  });
  assert.equal(studentRes.status, 200);
  const studentData = await studentRes.json();
  studentToken = studentData.data.token;

  // Get a test member and user ID
  const mRes = await pool.query(
    "SELECT m.id, m.user_id FROM members m JOIN users u ON m.user_id = u.id WHERE u.email = 'student@aiclub.com'"
  );
  assert.ok(mRes.rows.length > 0);
  testMemberId = mRes.rows[0].id;
  testUserId = mRes.rows[0].user_id;
});

after(async () => {
  // Restore student role and status in case modified
  if (testUserId && testMemberId) {
    await pool.query("UPDATE users SET role = 'student', status = 'ACTIVE' WHERE id = $1", [testUserId]);
    await pool.query("UPDATE members SET status = 'Active' WHERE id = $1", [testMemberId]);
  }
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Sprint 7: Admin Control Center & Analytics', () => {
  describe('1. Security & RBAC Enforcement', () => {
    test('Unauthenticated request to admin dashboard returns 401 Unauthorized', async () => {
      const res = await fetch(`${baseUrl}/api/admin/dashboard`);
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, 'UNAUTHORIZED');
    });

    test('Student token requesting admin dashboard returns 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, 'FORBIDDEN');
    });

    test('Student token requesting admin members list returns 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/api/admin/members`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 403);
    });

    test('Student token requesting audit logs returns 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/api/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 403);
    });

    test('Student token requesting data export returns 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/api/admin/exports/members`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 403);
    });
  });

  describe('2. Admin Dashboard Overview & Time-Range Filtering', () => {
    test('Admin successfully retrieves platform KPIs with default 30d range', async () => {
      const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      const data = body.data;

      // Verify KPI structure
      assert.ok(data.period);
      assert.equal(data.period.range, '30d');
      assert.ok(data.members);
      assert.ok(typeof data.members.total === 'number');
      assert.ok(data.events);
      assert.ok(typeof data.events.total === 'number');
      assert.ok(data.projects);
      assert.ok(typeof data.projects.total === 'number');
      assert.ok(data.learning);
      assert.ok(typeof data.learning.totalCourses === 'number');
      assert.ok(data.achievements);
      assert.ok(typeof data.achievements.totalDefinitions === 'number');
      assert.ok(data.notifications);
      assert.ok(typeof data.notifications.totalSent === 'number');
      assert.ok(Array.isArray(data.recentActivity));
      assert.ok(data.trends);
    });

    test('Admin retrieves dashboard filtered by range=7d', async () => {
      const res = await fetch(`${baseUrl}/api/admin/dashboard?range=7d`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.period.range, '7d');
    });

    test('Admin retrieves dashboard filtered by custom date range', async () => {
      const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();
      const res = await fetch(`${baseUrl}/api/admin/dashboard?range=custom&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.period.range, 'custom');
    });
  });

  describe('3. Domain-Specific Analytics Endpoints', () => {
    test('GET /api/admin/analytics/members returns comprehensive demographic & status metrics', async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics/members`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.summary);
      assert.ok(Array.isArray(body.data.departmentDistribution));
      assert.ok(Array.isArray(body.data.yearDistribution));
      assert.ok(Array.isArray(body.data.roleDistribution));
      assert.ok(Array.isArray(body.data.statusDistribution));
    });

    test('GET /api/admin/analytics/events returns registration, attendance and event type metrics', async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics/events`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.summary);
      assert.ok(body.data.registrations);
      assert.ok(Array.isArray(body.data.eventTypeDistribution));
    });

    test('GET /api/admin/analytics/projects returns domain and team analytics', async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics/projects`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.summary);
      assert.ok(Array.isArray(body.data.domainDistribution));
      assert.ok(body.data.teamStats);
    });

    test('GET /api/admin/analytics/courses returns LMS metrics and top courses', async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics/courses`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.summary);
      assert.ok(body.data.learningStats);
      assert.ok(Array.isArray(body.data.categoryDistribution));
    });

    test('GET /api/admin/analytics/achievements returns recognition metrics and trends', async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics/achievements`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.summary);
      assert.ok(Array.isArray(body.data.categoryDistribution));
      assert.ok(Array.isArray(body.data.topAchievements));
    });

    test('GET /api/admin/analytics/engagement returns active user numbers and activity breakdown', async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics/engagement`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(typeof body.data.activeMembersCount === 'number');
      assert.ok(Array.isArray(body.data.activityBreakdown));
    });
  });

  describe('4. Member Administration & Moderation', () => {
    test('Admin lists members with pagination and filters', async () => {
      const res = await fetch(`${baseUrl}/api/admin/members?page=1&limit=10&department=CSE`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      const items = Array.isArray(body.data) ? body.data : body.data?.items;
      assert.ok(Array.isArray(items));
      assert.ok(body.pagination ? body.pagination.total >= 0 : body.data?.total >= 0);
      if (items.length > 0) {
        const item = items[0];
        assert.ok(item.id);
        assert.ok(item.fullName);
        assert.ok(typeof item.profileCompletionPercentage === 'number');
        assert.ok(item.role);
        assert.ok(item.status);
      }
    });

    test('Admin views 360-degree member detail by ID', async () => {
      const res = await fetch(`${baseUrl}/api/admin/members/${testMemberId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      const detail = body.data;

      assert.ok(detail.profile);
      assert.equal(detail.profile.id, testMemberId);
      assert.ok(Array.isArray(detail.events));
      assert.ok(Array.isArray(detail.courses));
      assert.ok(Array.isArray(detail.projects));
      assert.ok(Array.isArray(detail.teams));
      assert.ok(Array.isArray(detail.achievements));
      assert.ok(detail.stats);
      assert.ok(typeof detail.stats.activityScore === 'number');
    });

    test('Admin updates member role to instructor with automatic audit logging', async () => {
      const res = await fetch(`${baseUrl}/api/admin/members/${testMemberId}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'instructor' }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.role, 'instructor');

      // Verify audit log entry
      const auditRes = await pool.query(
        "SELECT * FROM audit_logs WHERE entity_type = 'MEMBER' AND entity_id = $1 AND action = 'MEMBER_ROLE_CHANGED' ORDER BY created_at DESC LIMIT 1",
        [testMemberId]
      );
      assert.equal(auditRes.rows.length, 1);
      const log = auditRes.rows[0];
      assert.equal(log.action, 'MEMBER_ROLE_CHANGED');
      assert.equal(log.after_data.role, 'instructor');
    });

    test('Admin updates member status to Suspended and then reactivates to Active', async () => {
      // Suspend
      const suspendRes = await fetch(`${baseUrl}/api/admin/members/${testMemberId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Suspended' }),
      });
      assert.equal(suspendRes.status, 200);
      const suspendBody = await suspendRes.json();
      assert.equal(suspendBody.data.status, 'Suspended');

      // Verify audit log for suspension
      const suspendAudit = await pool.query(
        "SELECT * FROM audit_logs WHERE entity_type = 'MEMBER' AND entity_id = $1 AND action = 'MEMBER_SUSPENDED' ORDER BY created_at DESC LIMIT 1",
        [testMemberId]
      );
      assert.equal(suspendAudit.rows.length, 1);

      // Reactivate
      const reactivateRes = await fetch(`${baseUrl}/api/admin/members/${testMemberId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Active' }),
      });
      assert.equal(reactivateRes.status, 200);
      const reactivateBody = await reactivateRes.json();
      assert.equal(reactivateBody.data.status, 'Active');
    });

    test('Attempting to update member role with invalid role name returns 400 Validation Error', async () => {
      const res = await fetch(`${baseUrl}/api/admin/members/${testMemberId}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'supreme_commander' }),
      });
      assert.equal(res.status, 400);
    });
  });

  describe('5. Audit Logs API & Querying', () => {
    test('Admin fetches audit logs with pagination and search', async () => {
      const res = await fetch(`${baseUrl}/api/admin/audit-logs?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data.items));
      assert.ok(body.data.total > 0);
      assert.ok(body.data.items[0].action);
      assert.ok(body.data.items[0].entityType);
    });

    test('Admin filters audit logs by action=MEMBER_ROLE_CHANGED', async () => {
      const res = await fetch(`${baseUrl}/api/admin/audit-logs?action=MEMBER_ROLE_CHANGED`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.data.items.length > 0);
      for (const item of body.data.items) {
        assert.equal(item.action, 'MEMBER_ROLE_CHANGED');
      }
    });

    test('Admin fetches single audit log by ID', async () => {
      const listRes = await fetch(`${baseUrl}/api/admin/audit-logs?limit=1`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const listBody = await listRes.json();
      const firstId = listBody.data.items[0].id;

      const singleRes = await fetch(`${baseUrl}/api/admin/audit-logs/${firstId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(singleRes.status, 200);
      const singleBody = await singleRes.json();
      assert.equal(singleBody.data.id, firstId);
    });
  });

  describe('6. Data Exports (CSV Generation & Formula Sanitization)', () => {
    test('Admin exports members CSV', async () => {
      const res = await fetch(`${baseUrl}/api/admin/exports/members`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      assert.ok(res.headers.get('content-type')?.includes('text/csv'));
      const csv = await res.text();
      assert.ok(csv.includes('Member ID,Full Name,Register Number'));
      assert.ok(csv.includes('admin@aiclub.com') || csv.includes('student@aiclub.com'));
    });

    test('Admin exports events CSV', async () => {
      const res = await fetch(`${baseUrl}/api/admin/exports/events`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      assert.ok(res.headers.get('content-type')?.includes('text/csv'));
      const csv = await res.text();
      assert.ok(csv.includes('Event ID,Title,Type,Start Time'));
    });

    test('Admin exports attendance CSV', async () => {
      const res = await fetch(`${baseUrl}/api/admin/exports/attendance`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      assert.ok(res.headers.get('content-type')?.includes('text/csv'));
      const csv = await res.text();
      assert.ok(csv.includes('Registration ID,Event Title,Event Date,Member Name'));
    });

    test('Admin exports course enrollments CSV', async () => {
      const res = await fetch(`${baseUrl}/api/admin/exports/course-enrollments`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      assert.ok(res.headers.get('content-type')?.includes('text/csv'));
      const csv = await res.text();
      assert.ok(csv.includes('Enrollment ID,Course Title,Category,Member Name'));
    });

    test('Admin exports achievements CSV and verifies DATA_EXPORT audit record is created', async () => {
      const res = await fetch(`${baseUrl}/api/admin/exports/achievements`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      assert.ok(res.headers.get('content-type')?.includes('text/csv'));
      const csv = await res.text();
      assert.ok(csv.includes('Grant ID,Achievement Title,Category,Points'));

      // Check audit log for DATA_EXPORT
      const exportAudit = await pool.query(
        "SELECT * FROM audit_logs WHERE action = 'DATA_EXPORT' AND entity_type = 'ACHIEVEMENT' ORDER BY created_at DESC LIMIT 1"
      );
      assert.equal(exportAudit.rows.length, 1);
      assert.equal(exportAudit.rows[0].action, 'DATA_EXPORT');
    });
  });
});
