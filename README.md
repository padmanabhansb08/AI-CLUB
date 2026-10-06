# AI CLUB — Production Community, Learning & AI Platform

[![CI Pipeline](https://github.com/padmanabhansb08/AI-CLUB/actions/workflows/ci.yml/badge.svg)](https://github.com/padmanabhansb08/AI-CLUB/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](docs/RELEASE_NOTES.md)
[![Tests](https://img.shields.io/badge/tests-205%20passed-brightgreen.svg)](docs/RELEASE_NOTES.md)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](package.json)

**AI CLUB** is an enterprise-grade artificial intelligence student community and learning platform. Built across Sprints 1 through 9, the platform combines hands-on project collaboration, an interactive learning management system, event scheduling, gamified recognition, administrative operations, and context-aware artificial intelligence.

---

## 1. Platform Features & Domain Modules

- **Authentication & RBAC (Sprint 1)**: Stateless JWT authentication, secure `bcrypt` hashing, and role-based permissions (Student, Instructor, Admin, Super Admin).
- **Profiles & Activity Dashboard (Sprint 2)**: Custom profile management, skills catalog, technical interests, and personalized activity feeds.
- **Events & Attendance (Sprint 3)**: Event discovery, seat reservation with concurrency protection, QR check-in, and attendance audit logs.
- **Projects & Team Collaboration (Sprint 4)**: Open project catalog, atomic team formation, capacity enforcement, role management, and milestones.
- **Courses & LMS (Sprint 5)**: Multi-module curriculum, structured lessons, rich video/text learning, and atomic lesson progress tracking.
- **Achievements & Notifications (Sprint 6)**: Criteria-driven gamification, unlockable badges, points, and real-time in-app notification center.
- **Admin Control Center & Analytics (Sprint 7)**: Platform KPI dashboard, member moderation, domain analytics, append-only audit logging, and secure data exports.
- **AI Intelligence Layer (Sprint 8)**: Grounded multi-domain search, course/event recommendations, skill gap analysis, and student AI assistant with privacy isolation.
- **Production Hardening & Operations (Sprint 9)**: End-to-end request tracing (`X-Request-Id`), OWASP ASVS baseline, Helmet CSP headers, multi-tier rate limiting, composite index optimization, multi-stage Docker containerization, and GitHub Actions CI/CD.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite 8
- **Routing**: React Router 7
- **Icons & Styling**: Lucide React + Tailored Vanilla CSS Design Tokens (Dark Theme, Glassmorphism)
- **State Management**: React Context (`AuthProvider`) with centralized session synchronization
- **HTTP Client**: Centralized `apiClient` with automatic token injection and typed errors

### Backend API
- **Runtime**: Node.js 20 LTS + Express 5 + TypeScript
- **Database**: PostgreSQL 15 via `pg.Pool` with connection pooling
- **Authentication**: JWT (`jsonwebtoken`) + Secure Password Hashing (`bcrypt`)
- **Validation**: Schema-driven validation with `zod`
- **Security**: `helmet` (CSP, HSTS), `cors`, and `express-rate-limit`
- **Tracing**: Request ID correlation (`X-Request-Id`) across all HTTP lifecycles and structured logs

---

## 3. Architecture Blueprint

```text
React 19 Frontend SPA (Nginx / Vite)
  └── Reverse Proxy / API Gateway
      └── Express 5 API Server (Node 20)
          ├── Request ID Correlation (X-Request-Id)
          ├── Helmet CSP & Security Headers
          ├── Strict CORS Validation
          ├── Rate Limiting (Auth, AI, Export, General APIs)
          ├── Zod Schema Validation
          ├── JWT Authentication & RBAC Guards
          └── Domain Services (Auth, Events, Projects, LMS, Badges, Admin, AI)
              └── Parameterized SQL Repositories
                  └── PostgreSQL 15 Relational Database
```

Detailed architectural blueprints are available in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 4. Local Development Setup

### 4.1 Prerequisites
- **Node.js**: `v20.x LTS`
- **PostgreSQL**: `v15.x` (Local installation or Docker)
- **Docker & Docker Compose**: (Optional, for containerized run)

### 4.2 Installation
```bash
# Clone the repository
git clone https://github.com/padmanabhansb08/AI-CLUB.git
cd AI-CLUB

# Install root dependencies
npm ci

# Install server dependencies
cd server && npm ci && cd ..
```

### 4.3 Environment Configuration
```bash
# Frontend environment
cp .env.example .env

# Backend server environment
cp server/.env.example server/.env
```

### 4.4 Database Initialization
```bash
# Option A: Start PostgreSQL container
docker compose up -d db

# Option B: Run database migrations and seeds
npm run db:migrate
npm run db:seed
```

#### Pre-seeded Development Accounts
| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@aiclub.com` | `admin123` | Operations, Moderation & Admin Portal |
| **Student** | `student@aiclub.com` | `student123` | Primary student testing account |

### 4.5 Start Applications
```bash
# Start backend API (Port 5000)
cd server && npm run dev

# Start frontend development server (Port 5173) in a new terminal
npm run dev
```

---

## 5. Automated Testing & Verification

The test suite contains **205 automated tests across 64 suites (100% pass rate)** validating core domain logic, security protections, and edge cases:

```bash
# Run all tests
npm test

# Run type checks
npm run typecheck
npm --prefix server run typecheck

# Run production build validation
npm run build
npm --prefix server run build
```

---

## 6. Production Deployment & Containers

AI CLUB is fully containerized with multi-stage, non-root Docker configurations.

```bash
# Build and run complete production stack (Database, API, Frontend)
docker compose up -d --build

# Verify liveness & readiness probes
curl http://localhost:5000/health
curl http://localhost:5000/ready
```

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for Kubernetes and cloud production deployment runbooks.

---

## 7. Documentation Index

- [System Architecture](docs/ARCHITECTURE.md): Complete architecture diagram and layer breakdown.
- [Security Policy](docs/SECURITY.md): OWASP ASVS baseline, RBAC matrix, and threat modeling.
- [Deployment Guide](docs/DEPLOYMENT.md): Container deployment, zero-downtime migrations, and rollbacks.
- [Incident Response](docs/INCIDENT_RESPONSE.md): Disaster recovery runbooks and severity classification.
- [Technical Debt](docs/TECHNICAL_DEBT.md): Prioritized engineering debt ledger.
- [Release Notes](docs/RELEASE_NOTES.md): v1.0.0 feature summary and verification metrics.
- [Changelog](CHANGELOG.md): Chronological history of platform releases.
