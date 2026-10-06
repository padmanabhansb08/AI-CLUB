# AI CLUB — Technical Foundation & Community Platform

AI CLUB is a student-centered artificial intelligence community platform designed to foster peer learning, collaborative AI projects, achievements, and research initiatives.

---

## 1. Technology Stack

### Frontend

- **Framework**: React 19 + TypeScript + Vite 8
- **Routing**: React Router 7
- **Icons & Styling**: Lucide React + Tailored Vanilla CSS Design Tokens (Dark Theme, Glassmorphism)
- **State Management**: React Context (`AuthProvider`) with centralized session synchronization
- **HTTP Client**: Centralized `apiClient` with automatic token injection and typed errors

### Backend

- **Runtime**: Node.js + Express 5 + TypeScript (`tsx` / `tsc`)
- **Database**: PostgreSQL 15 via `pg.Pool`
- **Authentication**: JWT (`jsonwebtoken`) + Secure Password Hashing (`bcrypt`)
- **Validation**: Schema-driven validation with `zod`
- **Security**: `helmet`, `cors`, and `express-rate-limit`

---

## 2. Architecture Overview

The system strictly adheres to a layered architecture:

```text
React Frontend
  └── Context (AuthProvider)
      └── Central API Client (src/api/client.ts)
          └── HTTP / JSON
              └── Express Routers & Middlewares (auth, rate limiting, error handling)
                  └── Controllers (src/controllers/)
                      └── Services (src/services/)
                          └── Repositories (src/repositories/)
                              └── PostgreSQL 15 Pool
```

Detailed architectural blueprints are available in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 3. Prerequisites

- **Node.js**: v18.0.0+ (Tested on v24)
- **npm**: v9.0.0+
- **PostgreSQL**: v14+ (Local installation or Docker)

---

## 4. Environment Setup

### Frontend Environment

Create `.env` in the project root:

```bash
cp .env.example .env
```

Default contents:

```ini
VITE_API_URL=http://localhost:5000/api
```

### Backend Environment

Create `server/.env`:

```bash
cp server/.env.example server/.env
```

Default contents:

```ini
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://aiclub:aiclub_password@localhost:5432/aiclub_db
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

---

## 5. Database Setup & Initialization

### Option A: Using Docker Compose

```bash
docker compose up -d
```

### Option B: Using Local PostgreSQL

Ensure a PostgreSQL instance is running on port `5432` with user `aiclub`, password `aiclub_password`, and database `aiclub_db`.

### Run Migrations & Seeds

```bash
# Apply all tracked database migrations
npm run db:migrate

# Seed development accounts and sample data
npm run db:seed
```

#### Pre-seeded Development Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@aiclub.com` | `admin123` | Operations & Admin Portal |
| **Student** | `student@aiclub.com` | `student123` | Rahul Sharma (`21BCE1001`, CSE, Year 3, Sec A) |

---

## 6. Running the Application

### Start Backend API Server (Port 5000)

```bash
cd server
npm run dev
```

Verify backend health:

```bash
curl http://localhost:5000/api/health
```

### Start Frontend Application (Port 5173)

From project root:

```bash
npm run dev
```

---

## 7. Running Tests & Quality Verification

### Run Automated Integration & Auth Tests

```bash
npm run test
```

The test suite validates (33 tests across 10 suites):

- API health and database connectivity
- Zod request validation (email format, password min length, missing fields)
- User registration and atomic profile transactions
- Duplicate email & register number conflict rejection (`409 Conflict`)
- Valid and invalid login attempts
- Authenticated and unauthenticated `GET /api/auth/me`
- Logout flow
- Role-based authorization (`admin` vs `student` access control)
- Student Profile & weighted Profile Completion calculation
- Normalized skills catalog & member proficiencies (`BEGINNER` to `EXPERT`)
- Structured technical interests catalog & member selection
- Personalized student dashboard with real database stats & chronological activity feed
- Member directory search by skill/name, filtering, pagination, and sanitized public profiles
- Server-enforced profile ownership (students cannot tamper with another member profile)

### Run Type Checking

```bash
npm run typecheck
```

### Build for Production

```bash
npm run build
```

---

## 8. Documentation

- [System Architecture](docs/ARCHITECTURE.md): Comprehensive system design and layer breakdown.
- [API Specification](docs/API.md): Standard response envelopes, auth endpoints, and error codes.
- [Database Guide](docs/DATABASE.md): Schema, relationships, migrations, and indexing strategy.
- [Sprint 1 Audit Report](docs/SPRINT_1_AUDIT.md): Initial audit findings, security remediation, and changes.
