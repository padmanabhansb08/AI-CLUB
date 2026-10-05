# SPRINT 1 — Architecture & Codebase Audit Report

## 1. Executive Summary
This document provides a comprehensive audit of the AI CLUB application as the initial step of **Sprint 1 (Foundation, Stabilization & Authentication)**.
The inspection covers frontend architecture, backend services, database schema and migration workflows, security practices, authentication flows, and API consistency.

---

## 2. Current Architecture

### 2.1 Backend Architecture
- **Runtime & Framework**: Node.js, Express 5, TypeScript (executed via `tsx` / `tsc`).
- **Layers**:
  - `routes/` (Express router definitions for auth, admin, student, public, announcements)
  - `controllers/` (Request handlers parsing params and delegating to services)
  - `services/` (Business logic, password hashing, transactions, data mapping)
  - `repositories/` (Data access layer executing raw SQL queries via `pg.Pool`)
  - `db/` (Database pool configuration, migrations, seeds)
  - `middleware/` (Authentication, role verification, error handling, rate limiting)
  - `validators/` (Zod schemas for request validation)
- **Database**: PostgreSQL 15, accessed via node-postgres (`pg.Pool`).
- **Security & Utilities**: `helmet`, `cors`, `express-rate-limit`, `bcrypt`, `jsonwebtoken`, `zod`.

### 2.2 Frontend Architecture
- **Framework & Build**: React 19, TypeScript, Vite 8, React Router 7.
- **Styling**: Vanilla CSS with comprehensive design tokens (dark theme, glassmorphism, accent colors).
- **Structure**:
  - `src/pages/` (Student and Admin views)
  - `src/components/layout/` (`AuthLayout`, `DashboardLayout`, `AdminLayout`, `RoleGuard`)
  - `src/components/ui/` (Reusable form elements: `Input`, `Select`, `Button`)
  - `src/components/common/` (`StateView`)
  - `src/services/` (`authService`, `profileService`, content services)
- **State Management**: Local component state + `localStorage` for authentication tokens.

---

## 3. Existing Strengths
1. **Architectural Separation**: The backend follows a clear Controller-Service-Repository pattern.
2. **Relational Schema Design**: Complete relational models with foreign key constraints, cascading deletions, and indexes across 10+ domain tables (`users`, `members`, `projects`, `project_teams`, `courses`, `course_progress`, `achievements`, `updates`, `events`, `announcements`).
3. **Atomic Operations**: `authService.register` utilizes PostgreSQL transactions (`BEGIN` / `COMMIT` / `ROLLBACK`) to create user accounts and member records atomically.
4. **Validation Schemas**: Zod is already adopted for request validation on key endpoints.
5. **Modern Frontend Foundations**: Clean component breakdown, typed props, accessible form controls, and responsive CSS styling.

---

## 4. Problems Identified

### 4.1 Security Issues
- **SQL Parameterization**: In `memberRepository.ts`, `LIMIT` and `OFFSET` were directly interpolated into SQL strings rather than parameterized:
  ```ts
  sql += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
  ```
- **Insecure Fallbacks & Error Leakage**: `errorHandler.ts` did not sanitize internal error details in production environments.
- **Weak Password Standards**: The backend Zod schema accepted passwords with as few as 6 characters without complexity checks.
- **JWT Payload & Role Consistency**: JWT payload used `{ id, role }` rather than the standardized `{ userId, role }`. Inconsistent role casings (`student`/`admin` vs `STUDENT`/`ADMIN`) created authorization risks.
- **Overly Permissive Rate Limiting**: The rate limiter was only applied to `/register` and `/login` with an excessively high threshold (200 requests/15min) and returned a non-standard response format.

### 4.2 Authentication & Authorization Problems
- **Frontend Mock Fallbacks**:
  - `authService.loginAsDemo` generated client-side dummy JWT tokens (`demo-token-...`) and mock user objects in `localStorage`.
  - `authService.registerStudent` caught network errors and silently faked a successful registration if the backend was unreachable.
  - `profileService.ts` fell back to hardcoded profile data ("Rahul Sharma", `21BCE1001`) whenever the API call failed, masking server issues.
- **Lack of Centralized Auth State**: No React `AuthProvider` or context existed. Components and `RoleGuard` directly queried `localStorage.getItem()`, causing race conditions and route flashing.
- **Incomplete `/api/auth/me` Endpoint**: Returned only `{ id, role }` from the decoded token instead of fetching complete user profile information.
- **Fragile Role Guarding**: `RoleGuard` checked `user.role` synchronously from `localStorage` without a verified session or loading boundary, allowing stale sessions to flash protected views.

### 4.3 API Contract & Response Standardization Problems
- **Non-Standard Responses**:
  - Success responses returned `{ data: ... }` rather than `{ success: true, data: ..., message: "..." }`.
  - Error responses returned `{ error: { code, message } }` rather than `{ success: false, error: { code, message, details } }`.
- **Health Check Specification**: `GET /api/health` returned `{ status: 'ok', database: 'connected' }` instead of `{ success: true, data: { status: "ok", database: "connected" }, message: "AI CLUB API is healthy" }`.
- **Route Mounting Inconsistencies**:
  - `studentRoutes` was mounted at `/api/me`, but contained `/me/events/registrations`, resulting in the malformed path `/api/me/me/events/registrations`.
- **Scattered Raw Fetch Calls**: Frontend components and services used independent `fetch()` calls with conflicting base URLs (`http://localhost:3000`, `http://localhost:3005`, and `http://localhost:5000/api`). No centralized API client handled base headers, auth token injection, and error normalization.

### 4.4 Database & Migration Problems
- **No Migration Tracking Table**: Migrations were executed ad-hoc without a `migrations` or `schema_migrations` table.
- **Broken Migration Runner**: `migrate.ts` commented out `001_initial_schema`, omitted `005_add_announcements`, and scattered execution across scripts like `run_003.ts`, `run_005.ts`, and `migrate4.ts`.
- **Environment Disconnection**: `server/.env` specified port `5433` while PostgreSQL was running on port `5432`, breaking all backend database queries.
- **Missing NPM Scripts**: No unified `npm run db:migrate` and `npm run db:seed` commands existed in `server/package.json`.

### 4.5 Testing & Code Quality
- **Zero Automated Tests**: `server/package.json` had `"test": "echo \"Error: no test specified\" && exit 1"`.
- **No Typecheck or Test Scripts**: Root package lacked a centralized `typecheck` and `test` command.
- **Untyped Application Errors**: Controllers used ad-hoc `throw new Error()` or manual HTTP status codes instead of typed error classes (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`).

---

## 5. Recommended Changes & Sprint 1 Action Plan

1. **Environment & Configuration**:
   - Establish `.env.example` in root and `server/.env.example`.
   - Update `docker-compose.yml` and server environment to use standard `postgresql://aiclub:aiclub_password@localhost:5432/aiclub_db`.
   - Standardize backend on port `5000` and frontend on port `5173`.
2. **Database Migration & Seeding**:
   - Implement an automated, idempotent migration runner in `server/src/db/migrate.ts` with a `migrations` tracking table.
   - Clean up one-off migration scripts (`migrate4.ts`, `run_003.ts`, `run_005.ts`).
   - Create unified seed script with standard development credentials (`admin@aiclub.com`, `student@aiclub.com`).
3. **API Standardization & Error Architecture**:
   - Create typed error classes (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`).
   - Update `errorHandler.ts` to output `{ success: false, error: { code, message, details } }`.
   - Implement standard success response helper `{ success: true, data, message }`.
   - Implement `GET /api/health` with full database probe and standard contract.
4. **Authentication & Authorization**:
   - Update `authService.ts` and `authController.ts` for clean registration, login, logout, and full `/api/auth/me`.
   - Standardize JWT token payload `{ userId, role }` with `7d` expiration.
   - Enforce password minimum of 8 characters with reasonable validation.
   - Implement robust `authenticate` and `requireRole("ADMIN" | "STUDENT")` middlewares with case-insensitivity.
5. **Frontend API Client & State Management**:
   - Create centralized API client in `src/api/client.ts` with interceptors for auth tokens and normalized errors.
   - Implement specialized API modules: `src/api/auth.api.ts`, `src/api/members.api.ts`, etc.
   - Build `AuthProvider` context in `src/context/AuthContext.tsx` handling session check (`GET /api/auth/me`), login, logout, and loading state.
   - Update `RoleGuard` to prevent route flashing and handle loading states.
   - Remove all fake/demo authentication fallbacks and offline simulations.
6. **Testing & Quality Assurance**:
   - Create automated integration tests covering authentication, authorization, validation, and health check.
   - Add `npm run typecheck`, `npm run test`, `npm run lint` scripts in root and server.

---

## 6. Files Impacted

### Files to be Modified:
- `docker-compose.yml`
- `.gitignore`
- `package.json`
- `server/package.json`
- `server/.env.example`
- `server/.env`
- `server/src/config.ts`
- `server/src/app.ts`
- `server/src/server.ts`
- `server/src/db/migrate.ts`
- `server/src/db/seeds/001_initial_seed.ts`
- `server/src/db/migrations/005_add_announcements.ts`
- `server/src/middleware/auth.ts`
- `server/src/middleware/errorHandler.ts`
- `server/src/middleware/rateLimiter.ts`
- `server/src/controllers/authController.ts`
- `server/src/controllers/contentController.ts`
- `server/src/controllers/studentController.ts`
- `server/src/services/authService.ts`
- `server/src/repositories/memberRepository.ts`
- `server/src/validators/schemas.ts`
- `server/src/routes/authRoutes.ts`
- `server/src/routes/studentRoutes.ts`
- `src/App.tsx`
- `src/components/layout/RoleGuard.tsx`
- `src/pages/Login.tsx`
- `src/pages/AdminLogin.tsx`
- `src/pages/Register.tsx`
- `src/services/profileService.ts`
- `src/services/content/repository.ts`

### Files to be Created:
- `.env.example`
- `docs/SPRINT_1_AUDIT.md` (this file)
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATABASE.md`
- `server/src/errors/AppError.ts`
- `server/src/utils/response.ts`
- `server/src/tests/auth.test.ts`
- `src/api/client.ts`
- `src/api/auth.api.ts`
- `src/context/AuthContext.tsx`
- `src/components/common/LoadingState.tsx`
- `src/components/common/ErrorState.tsx`
- `src/components/common/EmptyState.tsx`

### Files to be Cleaned Up / Deleted:
- `server/src/db/migrate4.ts` (subsumed by unified migration runner)
- `server/src/db/run_003.ts` (subsumed)
- `server/src/db/run_005.ts` (subsumed)
- `server/src/db/init-db.cjs` (local helper script)
