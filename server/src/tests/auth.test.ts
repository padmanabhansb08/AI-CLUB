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

describe('1. Health Check & Observability', () => {
  test('GET /api/health returns healthy database status and standardized payload', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'ok');
    assert.equal(body.data.database, 'connected');
    assert.equal(body.message, 'AI CLUB API is healthy');
  });
});

describe('2. Request Validation', () => {
  test('Registration with invalid email returns HTTP 400 VALIDATION_ERROR', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email-format',
        password: 'ValidPassword123',
        fullName: 'Test User',
        registerNumber: 'REG99901',
        department: 'CSE',
        classSection: 'A',
        year: 2,
      }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(body.error.details));
  });

  test('Registration with short password (< 8 chars) returns HTTP 400 VALIDATION_ERROR', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'shortpass@college.edu',
        password: 'short',
        fullName: 'Test User',
        registerNumber: 'REG99902',
        department: 'CSE',
        classSection: 'A',
        year: 2,
      }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  test('Registration missing required fields returns HTTP 400 VALIDATION_ERROR', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'missingfields@college.edu',
      }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });
});

describe('3. Authentication Flow', () => {
  const uniqueSuffix = Date.now().toString().slice(-6);
  const testStudent = {
    email: `student_${uniqueSuffix}@college.edu`,
    password: 'SecurePassword123!',
    fullName: 'Jane SprintOne',
    registerNumber: `REG_${uniqueSuffix}`,
    department: 'AIDS',
    classSection: 'B',
    year: 3,
    phone: '+91 9999888877',
  };

  let studentToken = '';

  test('POST /api/auth/register successfully registers a new student with atomic profile', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token, 'Token must be returned');
    assert.equal(body.data.user.email, testStudent.email);
    assert.equal(body.data.user.role, 'student');
    assert.equal(body.data.user.registerNumber, testStudent.registerNumber);
    studentToken = body.data.token;
  });

  test('POST /api/auth/register rejects duplicate email with HTTP 409 CONFLICT', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...testStudent,
        registerNumber: `DIFF_${Date.now()}`,
      }),
    });
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'CONFLICT');
  });

  test('POST /api/auth/register rejects duplicate register number with HTTP 409 CONFLICT', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...testStudent,
        email: `different_email_${Date.now()}@college.edu`,
      }),
    });
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'CONFLICT');
  });

  test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudent.email,
        password: testStudent.password,
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    assert.equal(body.data.user.email, testStudent.email);
    assert.equal(body.data.user.role, 'student');
  });

  test('POST /api/auth/login rejects invalid password with HTTP 401 UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudent.email,
        password: 'WrongPassword123',
      }),
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('POST /api/auth/login rejects non-existent email with HTTP 401 UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'doesnotexist@college.edu',
        password: 'Password123',
      }),
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('GET /api/auth/me returns authenticated student context with valid token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.email, testStudent.email);
    assert.equal(body.data.role, 'student');
    assert.equal(body.data.registerNumber, testStudent.registerNumber);
  });

  test('GET /api/auth/me rejects unauthenticated request with HTTP 401 UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('GET /api/auth/me rejects invalid token with HTTP 401 UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer fake.invalid.token' },
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('POST /api/auth/logout succeeds with standardized message', async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.message, 'Logged out successfully');
  });
});

describe('4. Role-Based Authorization', () => {
  let adminToken = '';
  let studentToken = '';

  before(async () => {
    // Login as admin
    const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@aiclub.com', password: 'admin123' }),
    });
    const adminBody = await adminRes.json();
    adminToken = adminBody.data.token;

    // Login as student
    const studentRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@aiclub.com', password: 'student123' }),
    });
    const studentBody = await studentRes.json();
    studentToken = studentBody.data.token;
  });

  test('Admin can access protected admin endpoints (GET /api/admin/members)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/members`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  test('Student cannot access admin endpoints and receives HTTP 403 FORBIDDEN', async () => {
    const res = await fetch(`${baseUrl}/api/admin/members`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FORBIDDEN');
  });

  test('Unauthenticated user receives HTTP 401 on protected admin endpoints', async () => {
    const res = await fetch(`${baseUrl}/api/admin/members`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('Student can access student profile (GET /api/me/profile)', async () => {
    const res = await fetch(`${baseUrl}/api/me/profile`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.fullName, 'Rahul Sharma');
  });
});
