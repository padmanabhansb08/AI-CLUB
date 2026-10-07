import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import app from '../app';
import { pool } from '../db';
import { config } from '../config';

let server: http.Server;
let url: string;
let userId: string;
let token: string;
const suffix = randomBytes(6).toString('hex');
const email = `security_${suffix}@example.edu`;
const original = 'SecureTestPassword123!';
const changed = 'ChangedTestPassword456!';
const post = (path: string, data: unknown, bearer?: string) => fetch(`${url}/api/auth/${path}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) }, body: JSON.stringify(data),
});

before(async () => {
  await new Promise<void>(resolve => { server = app.listen(0, '127.0.0.1', () => { url = `http://127.0.0.1:${(server.address() as any).port}`; resolve(); }); });
  const response = await post('register', { email, password: original, fullName: 'Security Test Member', registerNumber: `SEC_${suffix}`, department: 'CSE', classSection: 'A', year: 2 });
  assert.equal(response.status, 201);
  const body = await response.json();
  userId = body.data.user.userId;
  token = body.data.token;
});
after(async () => {
  if (userId) await pool.query('DELETE FROM users WHERE id = $1 AND email = $2', [userId, email]);
  await new Promise<void>(resolve => server.close(() => resolve()));
  await pool.end();
});

test('Account and member IDs remain distinct at login and refresh', async () => {
  const login = await (await post('login', { email, password: original })).json();
  const me = await (await fetch(`${url}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).json();
  assert.equal(login.data.user.id, userId);
  assert.equal(me.data.id, userId);
  assert.equal(login.data.user.memberId, me.data.memberId);
  assert.notEqual(me.data.memberId, userId);
});
test('Wrong current password is rejected without ending the valid session', async () => {
  assert.equal((await post('change-password', { currentPassword: 'wrong-password', password: changed }, token)).status, 400);
  assert.equal((await fetch(`${url}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).status, 200);
});
test('Password change revokes old sessions and permits the new password', async () => {
  assert.equal((await post('change-password', { currentPassword: original, password: changed }, token)).status, 200);
  assert.equal((await fetch(`${url}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).status, 401);
  assert.equal((await post('login', { email, password: original })).status, 401);
  const response = await post('login', { email, password: changed });
  assert.equal(response.status, 200);
  token = (await response.json()).data.token;
});
test('Reset links are single-use and revoke sessions', async () => {
  const raw = randomBytes(32).toString('hex');
  await pool.query("INSERT INTO account_tokens (token_hash, user_id, purpose, expires_at) VALUES ($1,$2,'reset',NOW() + INTERVAL '30 minutes')", [createHash('sha256').update(raw).digest('hex'), userId]);
  assert.equal((await post('reset-password', { token: raw, password: original })).status, 200);
  assert.equal((await post('reset-password', { token: raw, password: changed })).status, 400);
  assert.equal((await fetch(`${url}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).status, 401);
});
test('Verification rejects invalid tokens', async () => {
  assert.equal((await post('verify-email', { token: '0'.repeat(64) })).status, 400);
});
test('Unavailable mail infrastructure returns an honest service error', { skip: !!config.SMTP_HOST }, async () => {
  const response = await post('forgot-password', { email });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, 'MAIL_UNAVAILABLE');
});
