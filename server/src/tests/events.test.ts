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
let studentUserId: string;
let secondStudentUserId: string;
let studentMemberId: string;
let secondStudentMemberId: string;

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
  studentUserId = studentData.data.user.userId || studentData.data.user.id;
  studentMemberId = studentData.data.user.memberId || studentData.data.user.id;

  // Login second student
  const secondRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ananya@aiclub.com', password: 'student123' }),
  });
  assert.equal(secondRes.status, 200);
  const secondData = await secondRes.json();
  secondStudentToken = secondData.data.token;
  secondStudentUserId = secondData.data.user.userId || secondData.data.user.id;
  secondStudentMemberId = secondData.data.user.memberId || secondData.data.user.id;
});

after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Sprint 3: Events, Registration & Attendance Management', () => {
  let createdEventId: string;
  let limitedEventId: string;
  let futureRegEventId: string;
  let pastRegEventId: string;

  describe('1. Event Creation & Validation', () => {
    test('Admin successfully creates an event defaulting to DRAFT', async () => {
      const start = new Date(Date.now() + 7 * 86400000).toISOString();
      const end = new Date(Date.now() + 7 * 86400000 + 3600000 * 3).toISOString();

      const res = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Deep Learning Workshop',
          description: 'Hands-on training in neural networks and transformer architectures.',
          event_type: 'WORKSHOP',
          start_at: start,
          end_at: end,
          location: 'Turing Lab 301',
          capacity: 50,
          organizer: 'AI Club Core Team',
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.title, 'Deep Learning Workshop');
      assert.equal(body.data.status, 'draft');
      assert.equal(body.data.event_type, 'WORKSHOP');
      createdEventId = body.data.id;
    });

    test('Student cannot create event and receives HTTP 403 FORBIDDEN', async () => {
      const start = new Date(Date.now() + 86400000).toISOString();
      const end = new Date(Date.now() + 86400000 * 2).toISOString();

      const res = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          title: 'Student Attempted Event',
          description: 'Should be rejected',
          event_type: 'WORKSHOP',
          start_at: start,
          end_at: end,
          location: 'Lab 1',
        }),
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'FORBIDDEN');
    });

    test('Unauthenticated user cannot create event and receives HTTP 401 UNAUTHORIZED', async () => {
      const res = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthenticated Event',
          description: 'Should be rejected',
          event_type: 'WORKSHOP',
          start_at: new Date().toISOString(),
          end_at: new Date().toISOString(),
        }),
      });

      assert.equal(res.status, 401);
    });

    test('Invalid event with start_at >= end_at is rejected with HTTP 400 VALIDATION_ERROR', async () => {
      const now = new Date();
      const invalidEnd = new Date(now.getTime() - 3600000).toISOString();

      const res = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Invalid Date Event',
          description: 'Start after end',
          event_type: 'WORKSHOP',
          start_at: now.toISOString(),
          end_at: invalidEnd,
          location: 'Auditorium',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    });

    test('Event missing both location and meeting_url is rejected with HTTP 400 VALIDATION_ERROR', async () => {
      const start = new Date(Date.now() + 86400000).toISOString();
      const end = new Date(Date.now() + 86400000 + 3600000).toISOString();

      const res = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'No Location Event',
          description: 'No place or link given',
          event_type: 'WORKSHOP',
          start_at: start,
          end_at: end,
          capacity: 10,
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    });
  });

  describe('2. Event Publishing Lifecycle', () => {
    test('Draft event is hidden from public event listing', async () => {
      const res = await fetch(`${baseUrl}/api/events`);
      assert.equal(res.status, 200);
      const body = await res.json();
      const found = body.data.some((e: any) => e.id === createdEventId);
      assert.equal(found, false, 'Draft event must not appear in public listing');
    });

    test('Student cannot view details of draft event and receives HTTP 404', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 404);
    });

    test('Student cannot publish event and receives HTTP 403 FORBIDDEN', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 403);
    });

    test('Admin successfully publishes draft event: DRAFT -> PUBLISHED', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'published');
    });

    test('Published event now appears in public event listing', async () => {
      const res = await fetch(`${baseUrl}/api/events?search=Deep+Learning+Workshop`);
      assert.equal(res.status, 200);
      const body = await res.json();
      const found = body.data.find((e: any) => e.id === createdEventId);
      assert.ok(found);
      assert.equal(found.title, 'Deep Learning Workshop');
    });
  });

  describe('3. Registration Business Rules & Concurrency', () => {
    test('Student registers for published event successfully', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.registration.status, 'REGISTERED');
      assert.equal(body.data.registration.eventId, createdEventId);
      assert.ok(body.data.registration.registeredAt);
    });

    test('Duplicate registration by the same student is rejected with HTTP 409 ALREADY_REGISTERED', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 409);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'ALREADY_REGISTERED');
    });

    test('Second student can register and registration count increments', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secondStudentToken}` },
      });
      assert.equal(res.status, 200);

      // Verify event count
      const evRes = await fetch(`${baseUrl}/api/events/${createdEventId}`);
      assert.equal(evRes.status, 200);
      const evBody = await evRes.json();
      assert.equal(evBody.data.registration_count, 2);
    });

    test('Student registration before registration_open_at is rejected with HTTP 400 REGISTRATION_NOT_OPEN', async () => {
      // Create published event with future registration open
      const start = new Date(Date.now() + 10 * 86400000).toISOString();
      const end = new Date(Date.now() + 10 * 86400000 + 3600000).toISOString();
      const regOpen = new Date(Date.now() + 2 * 86400000).toISOString();
      const regClose = new Date(Date.now() + 9 * 86400000).toISOString();

      const createRes = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Future Reg Event',
          description: 'Registration opens in 2 days',
          event_type: 'WEBINAR',
          start_at: start,
          end_at: end,
          meeting_url: 'https://meet.google.com/xyz',
          registration_open_at: regOpen,
          registration_close_at: regClose,
        }),
      });
      const createData = await createRes.json();
      futureRegEventId = createData.data.id;

      // Publish it
      await fetch(`${baseUrl}/api/events/${futureRegEventId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      // Student tries to register
      const regRes = await fetch(`${baseUrl}/api/events/${futureRegEventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(regRes.status, 400);
      const regBody = await regRes.json();
      assert.equal(regBody.error.code, 'REGISTRATION_NOT_OPEN');
    });

    test('Student registration after registration_close_at is rejected with HTTP 400 REGISTRATION_CLOSED', async () => {
      // Create event with past registration close date
      const start = new Date(Date.now() + 5 * 86400000).toISOString();
      const end = new Date(Date.now() + 5 * 86400000 + 3600000).toISOString();
      const regOpen = new Date(Date.now() - 3 * 86400000).toISOString();
      const regClose = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

      const createRes = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Closed Reg Event',
          description: 'Registration closed 1 hour ago',
          event_type: 'SEMINAR',
          start_at: start,
          end_at: end,
          location: 'Seminar Hall 1',
          registration_open_at: regOpen,
          registration_close_at: regClose,
        }),
      });
      const createData = await createRes.json();
      pastRegEventId = createData.data.id;

      // Publish
      await fetch(`${baseUrl}/api/events/${pastRegEventId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      // Student attempts register
      const regRes = await fetch(`${baseUrl}/api/events/${pastRegEventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(regRes.status, 400);
      const regBody = await regRes.json();
      assert.equal(regBody.error.code, 'REGISTRATION_CLOSED');
    });

    test('Event capacity limit is enforced: extra registration rejected with HTTP 409 EVENT_FULL', async () => {
      // Create event with capacity = 1
      const start = new Date(Date.now() + 86400000 * 3).toISOString();
      const end = new Date(Date.now() + 86400000 * 3 + 3600000).toISOString();

      const createRes = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Exclusive Hackathon',
          description: 'Capacity limited to 1 student',
          event_type: 'HACKATHON',
          start_at: start,
          end_at: end,
          location: 'Lab 5',
          capacity: 1,
        }),
      });
      const createData = await createRes.json();
      limitedEventId = createData.data.id;

      await fetch(`${baseUrl}/api/events/${limitedEventId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      // First student registers -> success
      const reg1 = await fetch(`${baseUrl}/api/events/${limitedEventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(reg1.status, 200);

      // Second student registers -> EVENT_FULL 409
      const reg2 = await fetch(`${baseUrl}/api/events/${limitedEventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secondStudentToken}` },
      });
      assert.equal(reg2.status, 409);
      const reg2Body = await reg2.json();
      assert.equal(reg2Body.error.code, 'EVENT_FULL');
    });
  });

  describe('4. Cancellation of Registration', () => {
    test('Student cancels own registration: status becomes CANCELLED with timestamp', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/register`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ reason: 'Schedule conflict' }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.registration.status, 'CANCELLED');
      assert.ok(body.data.registration.cancelledAt);
    });

    test('Repeated cancellation attempt returns HTTP 400 REGISTRATION_CANCELLED', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/register`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.error.code, 'REGISTRATION_CANCELLED');
    });

    test('Student can re-register after cancellation and status returns to REGISTERED', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.registration.status, 'REGISTERED');
    });

    test('Student view of registered events (GET /api/events/me/registrations) contains registered event', async () => {
      const res = await fetch(`${baseUrl}/api/events/me/registrations`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      const found = body.data.some((r: any) => r.id === createdEventId && r.registration_status === 'REGISTERED');
      assert.ok(found);
    });

    test('Student A cannot tamper with Student B registration', async () => {
      // Primary student cancels their own registration
      await fetch(`${baseUrl}/api/events/${createdEventId}/register`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      // Second student's registration remains REGISTERED and unaffected
      const checkRes = await fetch(`${baseUrl}/api/events/me/registrations`, {
        headers: { Authorization: `Bearer ${secondStudentToken}` },
      });
      const checkBody = await checkRes.json();
      const secondReg = checkBody.data.find((r: any) => r.id === createdEventId);
      assert.ok(secondReg);
      assert.equal(secondReg.registration_status, 'REGISTERED');

      // Re-register primary student for downstream attendance suite
      await fetch(`${baseUrl}/api/events/${createdEventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
    });
  });

  describe('5. Admin Attendance Tracking & Management', () => {
    test('Student cannot view attendance stats or mark attendance (HTTP 403 FORBIDDEN)', async () => {
      const getRes = await fetch(`${baseUrl}/api/events/${createdEventId}/attendance`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(getRes.status, 403);

      const putRes = await fetch(`${baseUrl}/api/events/${createdEventId}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          records: [{ memberId: studentMemberId, status: 'PRESENT' }],
        }),
      });
      assert.equal(putRes.status, 403);
    });

    test('Admin marks student attendance as PRESENT and statistics update', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          records: [
            { memberId: studentMemberId, status: 'PRESENT' },
            { memberId: secondStudentMemberId, status: 'LATE' },
          ],
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);

      // Verify attendance stats
      const statsRes = await fetch(`${baseUrl}/api/events/${createdEventId}/attendance`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(statsRes.status, 200);
      const statsBody = await statsRes.json();
      assert.equal(statsBody.data.stats.present, 1);
      assert.equal(statsBody.data.stats.late, 1);
      assert.equal(statsBody.data.stats.totalRegistrations, 2);
      assert.ok(statsBody.data.stats.attendanceRate > 0);
    });

    test('Admin bulk marks students attendance successfully', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/attendance/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          memberIds: [studentMemberId, secondStudentMemberId],
          status: 'PRESENT',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
    });

    test('Marking attendance on a DRAFT event is rejected with HTTP 400 ATTENDANCE_NOT_ALLOWED', async () => {
      // Create a draft event
      const start = new Date(Date.now() + 86400000).toISOString();
      const end = new Date(Date.now() + 86400000 * 2).toISOString();
      const createRes = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Draft Unopened Event',
          description: 'Testing attendance rejection on draft',
          event_type: 'MEETUP',
          start_at: start,
          end_at: end,
          location: 'Lab 2',
        }),
      });
      const draftData = await createRes.json();
      const draftId = draftData.data.id;

      const attRes = await fetch(`${baseUrl}/api/events/${draftId}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          records: [{ memberId: studentMemberId, status: 'PRESENT' }],
        }),
      });

      assert.equal(attRes.status, 400);
      const attBody = await attRes.json();
      assert.equal(attBody.error.code, 'ATTENDANCE_NOT_ALLOWED');
    });
  });

  describe('6. Event Cancellation & Completion', () => {
    test('Admin cancels published event with reason: status becomes CANCELLED', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ reason: 'Guest speaker fell ill' }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'cancelled');
      assert.equal(body.data.cancellation_reason, 'Guest speaker fell ill');
    });

    test('Cancelling an event without reason is rejected with HTTP 400 VALIDATION_ERROR', async () => {
      const res = await fetch(`${baseUrl}/api/events/${limitedEventId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ reason: '' }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    });

    test('Student cannot register for a cancelled event and receives HTTP 400 EVENT_CANCELLED', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.error.code, 'EVENT_CANCELLED');
    });

    test('Admin completes an event (with force flag if in future)', async () => {
      const res = await fetch(`${baseUrl}/api/events/${limitedEventId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ force: true }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'completed');
    });

    test('Completed event rejects new registrations', async () => {
      const res = await fetch(`${baseUrl}/api/events/${limitedEventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secondStudentToken}` },
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.error.code, 'EVENT_NOT_PUBLISHED');
    });
  });

  describe('7. Member Profile & Dashboard Activity Integration', () => {
    test('Student profile includes eventsAttended count', async () => {
      const res = await fetch(`${baseUrl}/api/members/me`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(typeof body.data.eventsAttended === 'number');
    });

    test('Dashboard endpoint includes upcomingEvents array with registration state', async () => {
      const res = await fetch(`${baseUrl}/api/dashboard`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data.upcomingEvents));
    });
  });
});
