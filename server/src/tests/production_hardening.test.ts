import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../app';
import { pool } from '../db';

let server: http.Server;
let baseUrl: string;

before(async () => {
  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });
  const address = server.address() as { port: number };
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
  await pool.end();
});

describe('Sprint 9: Production Hardening, Security & Observability', () => {
  describe('1. Health and Readiness Probes', () => {
    test('GET /health returns process liveness without database dependency', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'ok');
      assert.equal(typeof body.data.uptime, 'number');
    });

    test('GET /api/health returns standardized healthy status', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'ok');
      assert.equal(body.data.database, 'connected');
    });

    test('GET /ready and /api/ready return 200 when database connection pool is healthy', async () => {
      const res = await fetch(`${baseUrl}/ready`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'ready');
      assert.equal(body.data.database, 'connected');
    });
  });

  describe('2. Request Correlation & Tracing (Request IDs)', () => {
    test('Server generates a unique X-Request-Id header when none is provided', async () => {
      const res = await fetch(`${baseUrl}/health`);
      const reqId = res.headers.get('x-request-id');
      assert.ok(reqId, 'X-Request-Id header must be present');
      assert.match(
        reqId!,
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        'Should be a valid UUID'
      );
    });

    test('Server propagates client-supplied X-Request-Id across lifecycle and error envelopes', async () => {
      const customId = 'client-trace-hardening-999';
      const res = await fetch(`${baseUrl}/api/nonexistent-route-for-testing`, {
        headers: { 'X-Request-Id': customId },
      });
      assert.equal(res.status, 404);
      assert.equal(res.headers.get('x-request-id'), customId);

      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'NOT_FOUND');
      assert.equal(body.error.requestId, customId);
    });
  });

  describe('3. OWASP ASVS Security Headers', () => {
    test('Helmet security headers are properly attached to responses', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
      assert.ok(res.headers.get('content-security-policy'), 'CSP header must be configured');
      assert.ok(
        res.headers.get('cross-origin-resource-policy'),
        'CORP header must be configured'
      );
    });
  });

  describe('4. Standardized Production Error Envelope & Leakage Prevention', () => {
    test('404 route returns structured error without exposing stack trace', async () => {
      const res = await fetch(`${baseUrl}/api/unknown-endpoint`);
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'NOT_FOUND');
      assert.ok(body.error.requestId, 'requestId must be present in error response');
      assert.equal(body.error.stack, undefined, 'stack trace must not leak');
    });

    test('Validation failure returns 400 with details and requestId', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bad-email' }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
      assert.ok(Array.isArray(body.error.details));
      assert.ok(body.error.requestId);
    });
  });

  describe('5. Database Indexes & Query Safety', () => {
    test('Sprint 9 composite indexes are created in database', async () => {
      const result = await pool.query(`
        SELECT indexname FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname IN (
          'idx_course_enr_member_status',
          'idx_lesson_progress_member_status',
          'idx_event_reg_member_status',
          'idx_event_attendance_member_status',
          'idx_project_memberships_member_status',
          'idx_notifications_unread_fast',
          'idx_audit_logs_actor_created',
          'idx_ai_conv_member_updated'
        );
      `);

      const foundIndexes = result.rows.map((r: { indexname: string }) => r.indexname);
      assert.ok(foundIndexes.includes('idx_course_enr_member_status'));
      assert.ok(foundIndexes.includes('idx_event_reg_member_status'));
      assert.ok(foundIndexes.includes('idx_project_memberships_member_status'));
      assert.ok(foundIndexes.includes('idx_notifications_unread_fast'));
      assert.ok(foundIndexes.includes('idx_audit_logs_actor_created'));
      assert.ok(foundIndexes.includes('idx_ai_conv_member_updated'));
    });
  });
});
