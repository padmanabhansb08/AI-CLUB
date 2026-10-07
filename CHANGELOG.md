# Changelog

All notable changes to the **AI CLUB** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-06 (Sprint 9: Production Hardening, Security, Testing, CI/CD & Deployment)

### Added
- **Request Tracing**: `X-Request-Id` correlation middleware attaching unique UUIDs across all HTTP lifecycles and structured server logs.
- **Readiness Probe**: `/ready` and `/api/ready` endpoints validating PostgreSQL connection pool availability.
- **OWASP ASVS Hardening**: Content-Security-Policy (CSP), HSTS, `X-Content-Type-Options: nosniff`, and CORP headers via `helmet`.
- **Multi-Tier Rate Limiting**: Domain limiters for authentication (`authLimiter`), AI queries (`aiLimiter`), and bulk data exports (`exportLimiter`).
- **Composite Performance Indexes (Migration 013)**: Optimized indexes for enrollments, registrations, attendance, milestones, notifications, audit logs, and AI conversations.
- **Containerization**: Multi-stage `server/Dockerfile` (Node 20 Alpine, non-root user `node`), frontend `Dockerfile` (Nginx Alpine), and isolated `docker-compose.yml`.
- **CI/CD Pipelines**: GitHub Actions `.github/workflows/ci.yml` (least-privilege `contents: read`, commit-SHA pinned actions) and `.github/workflows/cd.yml`.
- **Automated Test Suite**: 9 new production hardening tests bringing total suite to 205 passing automated tests (100% green).
- **Production Documentation**: `SECURITY.md`, `DEPLOYMENT.md`, `INCIDENT_RESPONSE.md`, `TECHNICAL_DEBT.md`, and `RELEASE_NOTES.md`.

### Changed
- Standardized error envelope across all endpoints: `{ success: false, error: { code, message, requestId, details } }`.
- Enhanced graceful shutdown in `server.ts` draining pending HTTP requests and safely terminating PostgreSQL connection pool on `SIGTERM` / `SIGINT`.
- Enforced strict origin checking in production CORS configuration.

---

## [0.8.0] - Sprint 8: AI Intelligence Layer
### Added
- Grounded multi-domain search across events, courses, and projects.
- Personalized course and event recommendations.
- Skill gap analysis and personalized learning path generation.
- Conversational AI student assistant with conversation history and context isolation.
- Administrative AI insights and LLM usage telemetry tracking.

---

## [0.7.0] - Sprint 7: Admin Control Center & Platform Analytics
### Added
- Centralized administrative dashboard with platform-wide KPIs.
- Member moderation, role elevation controls, and account status management.
- Comprehensive domain analytics (members, events, projects, courses, engagement).
- Append-only administrative audit log (`audit_logs`) tracking security-sensitive operations.
- Secure, rate-limited CSV dataset exports for administrative reporting.

---

## [0.6.0] - Sprint 6: Achievements + Notifications System
### Added
- Criteria-driven gamification and achievement engine with point tracking.
- Automated recognition awards for attendance, course completion, and team leadership.
- Real-time in-app notification center with unread counters and notification preferences.
- Administrative announcement broadcasting.

---

## [0.5.0] - Sprint 5: Courses & Learning Management System
### Added
- Multi-tier course curriculum with modules, lessons, and video content.
- Student course enrollment and atomic lesson progress tracking.
- Interactive learning workspace with rich text and video playback.
- Course completion certification and history.

---

## [0.4.0] - Sprint 4: Projects & Teams Collaboration
### Added
- Project discovery catalog with domain, status, and difficulty filtering.
- Student project join requests and lead approval workflows.
- Team creation with hard capacity limits and member role assignments.
- Team invitations and milestone progress tracking.

---

## [0.3.0] - Sprint 3: Events + Registration + Attendance
### Added
- Event catalog with capacity tracking and cancellation windows.
- Seat reservation with concurrency protection.
- QR and manual attendance check-in system for event leads and admins.

---

## [0.2.0] - Sprint 2: Student Profiles + Dashboard
### Added
- Dynamic profile customization with bio, department, and graduation year.
- Skills and technical interests catalog with tag management.
- Personalized student dashboard with aggregated activity overview.

---

## [0.1.0] - Sprint 1: Authentication + Foundation
### Added
- Stateless JWT authentication with `bcrypt` password hashing.
- Role-based authorization middleware (Student, Instructor, Admin, Super Admin).
- PostgreSQL database migrations runner and initial schema.
- Structured API response helpers and centralized error handling.
