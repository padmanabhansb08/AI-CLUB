# AI CLUB — Technical Debt Ledger

This document tracks known technical debt across architecture, testing, database, and infrastructure, prioritized for ongoing engineering iterations.

---

## 1. High Priority Debt

### 1.1 In-Memory Rate Limiter in Single Node Setup
- **Problem**: `express-rate-limit` currently utilizes default in-memory storage for sliding-window request tracking.
- **Impact**: If backend is scaled horizontally across multiple container instances behind a round-robin load balancer, rate limits are not shared between nodes.
- **Recommendation**: Introduce a distributed Redis store (`rate-limit-redis`) when multi-node clustering is deployed.
- **Priority**: High (Post-V1 Scale)

### 1.2 Automated Database Backup Cron on Ephemeral Containers
- **Problem**: Database container in `docker-compose.yml` relies on local Docker volume mounts. Automated continuous off-site WAL archiving is not configured by default.
- **Impact**: Server hardware failure could lead to data loss back to the last manual pg_dump backup.
- **Recommendation**: Deploy AWS S3 / GCP Cloud Storage automated nightly `pg_dump` backup sidecar container with 30-day retention and KMS encryption.
- **Priority**: High

---

## 2. Medium Priority Debt

### 2.1 Refresh Token Rotation & Revocation Blacklist
- **Problem**: JWT access tokens are valid for 7 days (`JWT_EXPIRES_IN=7d`). Stateless tokens cannot be individually revoked before expiration without rotating the master `JWT_SECRET`.
- **Impact**: Compromised user token remains valid until expiration unless user status is manually set to SUSPENDED.
- **Recommendation**: Adopt short-lived 15-minute access tokens paired with rotating HttpOnly refresh tokens stored in a `refresh_tokens` database table.
- **Priority**: Medium

### 2.2 Client-Side Bundle Splitting for Admin & Analytics Charts
- **Problem**: The Vite bundle bundles all routes into standard chunks. Large administrative dashboard charts could be further code-split from the primary student path.
- **Impact**: Slightly larger initial payload for student users who do not access the `/admin` portal.
- **Recommendation**: Verify React `React.lazy()` boundaries around heavy admin charting components (`AnalyticsPage.tsx`, `AdminDashboard.tsx`).
- **Priority**: Medium

---

## 3. Low Priority Debt

### 3.1 External AI Vector Database
- **Problem**: Search in Sprint 8 uses PostgreSQL full-text search and grounded domain queries rather than a dedicated vector index (e.g., `pgvector`).
- **Impact**: Sufficient for current dataset (< 10,000 documents), but semantic vector similarity queries on millions of documents would benefit from specialized vector indexing.
- **Recommendation**: Enable the PostgreSQL `pgvector` extension and generate embeddings during course/project creation.
- **Priority**: Low

### 3.2 Legacy CommonJS Scripts in Server Root
- **Problem**: Server workspace uses TypeScript with CommonJS module emission (`"type": "commonjs"` in `server/package.json`).
- **Impact**: Minor tooling divergence from the root Vite application which uses pure ESM.
- **Recommendation**: Transition server workspace to `"type": "module"` with NodeNext module resolution in future major version.
- **Priority**: Low
