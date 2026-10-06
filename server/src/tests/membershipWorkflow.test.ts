import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../app';
import { pool } from '../db';

let server: http.Server;
let baseUrl: string;

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const address = server.address() as any;
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
  await pool.end();
});

describe('AI CLUB Membership Selection Workflow (End-to-End)', () => {
  const ts = Date.now().toString().slice(-6);
  let studentToken = '';
  let studentUserId = '';
  let studentAppId = '';
  let studentAttemptId = '';

  let otherStudentToken = '';
  let otherAppId = '';

  let adminToken = '';

  before(async () => {
    // 1. Log in admin
    const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@aiclub.com', password: 'admin123' }),
    });
    assert.equal(adminRes.status, 200);
    const adminBody = await adminRes.json();
    adminToken = adminBody.data.token;
    assert.ok(adminToken, 'Admin token obtained');
  });

  // STEP 1: Student Registration
  test('1. Student registers: account created with TEST_REQUIRED application', async () => {
    const studentData = {
      email: `applicant_${ts}@college.edu`,
      password: 'StrongPassword123!',
      fullName: 'Vikram Sarabhai',
      registerNumber: `REG_WORKFLOW_${ts}`,
      department: 'CSE',
      classSection: 'A',
      year: 2,
      phone: '+91 9123456789',
    };

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    studentToken = body.data.token;
    studentUserId = body.data.user.id;

    assert.equal(body.data.user.role, 'student');
    assert.equal(body.data.user.membershipStatus, 'NONE');
    assert.equal(body.data.user.isClubMember, false);
    assert.ok(body.data.user.applicationNumber, 'Application number generated');
    assert.match(body.data.user.applicationNumber, /^AIC-\d{4}-\d{6}$/);
    assert.equal(body.data.user.applicationStatus, 'TEST_REQUIRED');
  });

  // STEP 2: Second student registers for isolation testing
  test('2. Second student registers for IDOR & access control testing', async () => {
    const otherData = {
      email: `other_${ts}@college.edu`,
      password: 'StrongPassword123!',
      fullName: 'Other Student',
      registerNumber: `REG_OTHER_${ts}`,
      department: 'ECE',
      classSection: 'B',
      year: 1,
    };

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(otherData),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    otherStudentToken = body.data.token;
    otherAppId = body.data.user.applicationId;
    assert.ok(otherAppId);
  });

  // STEP 3: Student fetches their application status
  test('3. Student retrieves active application details via GET /api/applications/me', async () => {
    const res = await fetch(`${baseUrl}/api/applications/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.application);
    studentAppId = body.data.application.id;
    assert.equal(body.data.application.status, 'TEST_REQUIRED');
    assert.equal(body.data.application.fullName, 'Vikram Sarabhai');
    assert.equal(body.data.application.department, 'CSE');
  });

  // STEP 4: Start Mock Test
  let questionsReceived: any[] = [];
  test('4. Student starts assessment: exactly 25 questions returned WITHOUT answers', async () => {
    const res = await fetch(`${baseUrl}/api/assessments/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ applicationId: studentAppId }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.attemptId);
    studentAttemptId = body.data.attemptId;

    assert.equal(body.data.status, 'IN_PROGRESS');
    assert.equal(body.data.totalQuestions, 25);
    assert.equal(body.data.questions.length, 25);
    questionsReceived = body.data.questions;

    // Security Verification: correct_option and explanation must NEVER be in response
    for (const q of questionsReceived) {
      assert.equal(q.correct_option, undefined, 'correct_option must NOT be returned');
      assert.equal(q.correctOption, undefined, 'correctOption must NOT be returned');
      assert.equal(q.explanation, undefined, 'explanation must NOT be returned');
      assert.ok(q.question, 'Question text must exist');
      assert.ok(q.option_a && q.option_b && q.option_c && q.option_d);
    }
  });

  // STEP 5: Resume Mock Test
  test('5. Student refreshes and retrieves active test with identical questions and timer', async () => {
    const res = await fetch(`${baseUrl}/api/assessments/${studentAttemptId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.attemptId, studentAttemptId);
    assert.equal(body.data.questions.length, 25);
    assert.ok(body.data.timeRemainingSeconds > 0);
  });

  // STEP 6: IDOR Protection
  test('6. Other student cannot access Vikram attempt (HTTP 403 FORBIDDEN)', async () => {
    const res = await fetch(`${baseUrl}/api/assessments/${studentAttemptId}`, {
      headers: { Authorization: `Bearer ${otherStudentToken}` },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  // STEP 7: Auto-Save Answers
  test('7. Student auto-saves answers for multiple questions', async () => {
    // Save answer for question 0
    const q0 = questionsReceived[0];
    const res0 = await fetch(`${baseUrl}/api/assessments/${studentAttemptId}/questions/${q0.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ selectedOption: 'B' }),
    });
    assert.equal(res0.status, 200);
    const body0 = await res0.json();
    assert.equal(body0.success, true);
    assert.equal(body0.data.selectedOption, 'B');

    // Save answer for question 1
    const q1 = questionsReceived[1];
    const res1 = await fetch(`${baseUrl}/api/assessments/${studentAttemptId}/questions/${q1.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ selectedOption: 'A' }),
    });
    assert.equal(res1.status, 200);

    // Answer remainder of the 25 questions
    for (let i = 2; i < 25; i++) {
      const q = questionsReceived[i];
      await fetch(`${baseUrl}/api/assessments/${studentAttemptId}/questions/${q.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ selectedOption: i % 2 === 0 ? 'B' : 'A' }),
      });
    }

    // Verify all saved answers remain upon fetch
    const getRes = await fetch(`${baseUrl}/api/assessments/${studentAttemptId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const getBody = await getRes.json();
    assert.equal(Object.keys(getBody.data.savedAnswers).length, 25);
  });

  // STEP 8: Security: Non-Admin Cannot Access Admin Endpoints
  test('8. Student cannot call admin application list or review endpoints (HTTP 403 FORBIDDEN)', async () => {
    const listRes = await fetch(`${baseUrl}/api/applications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(listRes.status, 403);

    const reviewRes = await fetch(`${baseUrl}/api/applications/${studentAppId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ decision: 'APPROVED' }),
    });
    assert.equal(reviewRes.status, 403);
  });

  // STEP 9: Submit Test & Server-Side Scoring
  test('9. Student submits assessment: score calculated server-side & status becomes UNDER_REVIEW', async () => {
    const res = await fetch(`${baseUrl}/api/assessments/${studentAttemptId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'SUBMITTED');
    assert.equal(body.data.totalQuestions, 25);
    assert.ok(typeof body.data.score === 'number', 'Score must be a number');
    assert.ok(typeof body.data.percentage === 'number', 'Percentage must be a number');
    assert.ok(typeof body.data.passed === 'boolean', 'Passed must be a boolean');

    // Verify application status updated to UNDER_REVIEW
    const appRes = await fetch(`${baseUrl}/api/applications/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const appBody = await appRes.json();
    assert.equal(appBody.data.application.status, 'UNDER_REVIEW');
    assert.equal(appBody.data.application.final_score, body.data.score);
    assert.equal(appBody.data.application.passed, body.data.passed);
  });

  // STEP 10: Duplicate Submission Prevention
  test('10. Duplicate assessment submission is rejected with HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/api/assessments/${studentAttemptId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  // STEP 11: Admin Applications Table with Pagination and Search
  test('11. Admin lists applications: pagination, search, and count summary work', async () => {
    // 1. Counts
    const countsRes = await fetch(`${baseUrl}/api/applications/counts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(countsRes.status, 200);
    const countsBody = await countsRes.json();
    assert.ok(countsBody.data.total > 0);
    assert.ok(countsBody.data.pending >= 1);

    // 2. Search by student name
    const searchRes = await fetch(`${baseUrl}/api/applications?search=Vikram`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(searchRes.status, 200);
    const searchBody = await searchRes.json();
    assert.ok(searchBody.data.applications.length >= 1);
    assert.equal(searchBody.data.applications[0].fullName, 'Vikram Sarabhai');
    assert.equal(searchBody.data.applications[0].status, 'UNDER_REVIEW');

    // 3. Analytics
    const analyticsRes = await fetch(`${baseUrl}/api/applications/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(analyticsRes.status, 200);
    const analyticsBody = await analyticsRes.json();
    assert.ok(analyticsBody.data.summary);
    assert.ok(Array.isArray(analyticsBody.data.byDepartment));
  });

  // STEP 12: Admin Application Detail View
  test('12. Admin retrieves complete applicant profile and assessment result', async () => {
    const res = await fetch(`${baseUrl}/api/applications/${studentAppId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.application.id, studentAppId);
    assert.equal(body.data.application.fullName, 'Vikram Sarabhai');
    assert.ok(body.data.attempt);
    assert.equal(body.data.attempt.totalQuestions, 25);
  });

  // STEP 13: Admin Decision: WAITLIST
  test('13. Admin waitlists an applicant', async () => {
    const res = await fetch(`${baseUrl}/api/applications/${studentAppId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        decision: 'WAITLISTED',
        notes: 'Promising candidate, reviewing batch capacity.',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.decision, 'WAITLISTED');
    assert.equal(body.data.application.status, 'WAITLISTED');
  });

  // STEP 14: Admin Decision: REJECT requires Reason
  test('14. Admin reject requires rejection reason', async () => {
    const res = await fetch(`${baseUrl}/api/applications/${otherAppId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ decision: 'REJECTED' }), // missing reason
    });

    assert.equal(res.status, 400);

    // Now reject with valid reason
    const validRes = await fetch(`${baseUrl}/api/applications/${otherAppId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        decision: 'REJECTED',
        rejectionReason: 'Test score does not satisfy current semester club cut-off.',
      }),
    });

    assert.equal(validRes.status, 200);
    const validBody = await validRes.json();
    assert.equal(validBody.data.decision, 'REJECTED');
    assert.equal(validBody.data.application.status, 'REJECTED');
    assert.ok(validBody.data.application.rejection_reason);
  });

  // STEP 15: Admin Decision: APPROVE creates Club Membership
  test('15. Admin approves student: membership activated with unique member number', async () => {
    const res = await fetch(`${baseUrl}/api/applications/${studentAppId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        decision: 'APPROVED',
        notes: 'Excellent performance and strong background.',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.decision, 'APPROVED');
    assert.equal(body.data.application.status, 'APPROVED');
    assert.ok(body.data.membership);
    assert.equal(body.data.membership.status, 'ACTIVE');
    assert.match(body.data.membership.member_number, /^AIC-M-\d{4}-\d{5}$/);
  });

  // STEP 16: Student Unlocks Club Membership
  test('16. Approved student checks /api/auth/me: membershipStatus is ACTIVE and features unlocked', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.membershipStatus, 'ACTIVE');
    assert.equal(body.data.isClubMember, true);
    assert.ok(body.data.memberNumber);
    assert.match(body.data.memberNumber, /^AIC-M-\d{4}-\d{5}$/);
  });
});
