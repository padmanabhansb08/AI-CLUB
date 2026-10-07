# AI CLUB Security Policy & Baseline

## 1. Supported Versions

| Version | Supported          | Security Maintenance Status |
| :------ | :----------------- | :-------------------------- |
| 1.0.x   | :white_check_mark: | Active production support   |
| < 1.0.0 | :x:                | Pre-release / unsupported   |

---

## 2. Security Architecture & Threat Model

The AI CLUB platform follows an **OWASP Application Security Verification Standard (ASVS)** baseline, built on defense-in-depth principles:

```
[ Browser / Client ] 
        │ (TLS / HTTPS Only)
        ▼
[ Edge / Reverse Proxy / Nginx ] ──> Strict Content-Security-Policy, HSTS, X-Frame-Options
        │
        ▼
[ Express API Server ] 
   ├─ Request ID Correlation (X-Request-Id)
   ├─ Helmet Security Headers
   ├─ Strict CORS Validation (Trusted Origins)
   ├─ Rate Limiting (Auth, AI, Export, General APIs)
   ├─ Zod Schema Validation & Input Sanitization
   ├─ JWT Stateless Authentication (HMAC SHA-256)
   └─ Role-Based Access Control (Student, Instructor, Admin, Super Admin)
        │
        ▼
[ Business Domain Services ] ──> Field allowlisting, Mass-assignment protection, Idempotency
        │
        ▼
[ Parameterized SQL Repositories ] ──> 100% Parameterized queries ($1, $2, ...), Zero string concatenation
        │
        ▼
[ PostgreSQL 15 Relational DB ] ──> Foreign Key cascades, Unique constraints, Transaction boundaries
```

---

## 3. Authentication & Credential Safety

1. **Password Storage**: Passwords are hashed using `bcrypt` with salt rounds (cost factor 10). Plaintext passwords are never persisted to disk, cached, or logged.
2. **Account Enumeration Defense**: Login and authentication endpoints return uniform, non-distinguishing responses (`"Invalid credentials"`) for both incorrect passwords and non-existent accounts.
3. **JWT Security**:
   - Access tokens are cryptographically signed with `JWT_SECRET`.
   - Payloads contain strictly minimal identity information: `{ userId, role }`.
   - Sensitive metadata (passwords, email hashes, contact numbers) are prohibited in JWT claims.
4. **Brute Force & Abuse Protection**:
   - Authentication routes (`/api/auth/*`) are protected by `authLimiter` allowing maximum 50 requests per 15-minute sliding window per IP.
   - Unauthenticated access attempts return standardized HTTP 401/429 responses.

---

## 4. Authorization & Domain Isolation (RBAC Matrix)

Every protected endpoint validates server-side claims extracted from the verified token. Client-supplied fields like `memberId`, `role`, `isAdmin`, or `ownerId` are never trusted without backend validation.

| Domain | Student | Instructor | Admin | Super Admin | Enforcement Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication & Profile** | Own | Own | All | All | Token identity match |
| **Events & Attendance** | Discover/Register | Manage assigned | Full CRUD | Full CRUD | `requireAdmin` or instructor check |
| **Projects & Teams** | Discover/Join/Lead | Manage assigned | Full CRUD | Full CRUD | Team ownership & membership guards |
| **Courses & LMS** | Discover/Enroll | Manage assigned | Full CRUD | Full CRUD | Role check, draft isolation |
| **Achievements & Badges** | View earned | View stats | Create/Edit/Award | Full CRUD | `requireAdmin` |
| **Notifications** | View/Mark Own | View Own | Send Broadcast | Full CRUD | `recipient_id === token.userId` |
| **Admin Control Center** | :x: 403 Forbidden | :x: 403 Forbidden | Full Access | Full Access | `requireAdmin` |
| **Audit Logs** | :x: 403 Forbidden | :x: 403 Forbidden | Read-Only | Read-Only | Append-only in PostgreSQL |
| **AI Personalization** | Own Recommendations | Own Recommendations | View Telemetry | View Telemetry | Isolated per `member_id` |

---

## 5. Input Validation, Output Encoding & Injection Defense

1. **SQL Injection**: All database queries are executed via PostgreSQL client parameterized statements (`$1`, `$2`, ...). Raw string concatenation in queries is strictly prohibited.
2. **Cross-Site Scripting (XSS)**:
   - React automatically escapes rendered strings in JSX.
   - HTML injection in bio descriptions, event descriptions, and AI chat responses is escaped.
   - Content Security Policy (CSP) restricts script sources to `'self'`.
3. **Mass Assignment**: Update controllers employ explicit property allowlisting. Dangerous fields (`role`, `is_admin`, `status`, `id`) cannot be modified via generic object spreading.

---

## 6. AI Intelligence Layer Security

1. **Prompt Injection & Containment**:
   - User inputs to the AI assistant are encapsulated inside rigid system instructions.
   - Prompts instruct the LLM never to override safety boundaries, divulge system prompts, or hallucinate credentials.
2. **Context & Tenant Isolation**:
   - Retrieval queries enforce `WHERE member_id = $1` filters. Student A cannot prompt or query the AI to retrieve Student B's conversations, notifications, or private project notes.
3. **Token Quota & Cost Protection**:
   - AI endpoints are guarded by `aiLimiter` (30 requests/min).
   - Maximum output tokens are clamped via `AI_MAX_TOKENS`.
   - AI usage telemetry logs model execution time, prompt tokens, completion tokens, and estimated cost in `ai_usage`.
4. **Graceful Degradation**:
   - AI provider outages, invalid keys, or timeouts (default 15s) fail safely without interrupting core platform services (Login, Events, Courses, Projects).

---

## 7. Secrets Management & Rotation Policy

1. **Zero Secret Policy in Source Control**:
   - `.env` files are ignored via `.gitignore`.
   - CI build step fails if credentials (`AI_API_KEY`, `DATABASE_URL`, `JWT_SECRET`) are detected in client distribution builds (`dist/`).
2. **Rotation Protocol**:
   - In case of credential leakage, the secret must be invalidated immediately at the provider.
   - Issue updated secrets via production secret manager/environment variables.
   - Redeploy the application stack.
   - File an incident postmortem in accordance with `docs/INCIDENT_RESPONSE.md`.

---

## 8. Reporting a Vulnerability

If you discover a security vulnerability within the AI CLUB platform:
1. **Do not** create a public GitHub issue.
2. Email security findings to `security@aiclub.internal` (or repository maintainers).
3. Include:
   - Vulnerability classification (ASVS category)
   - Step-by-step reproduction steps or proof-of-concept
   - Potential impact
4. The security team will acknowledge receipt within 24 hours and provide remediation updates.
