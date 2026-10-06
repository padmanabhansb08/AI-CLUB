# AI CLUB — Production Deployment & Operations Guide

## 1. Prerequisites

Before deploying AI CLUB to production or staging environments, ensure the following are available:
- **Node.js**: `v20.x LTS`
- **PostgreSQL**: `15.x` with `uuid-ossp` or `pgcrypto` extension support
- **Docker & Docker Compose**: `Docker 24.x+`, `Compose v2.x+` (for containerized deployments)
- **SSL/TLS Certificate**: Valid TLS certificate terminating at reverse proxy or load balancer
- **Network Access**: Internal connection between API container and PostgreSQL port 5432

---

## 2. Environment Variables Configuration

Production environments must provide environment variables via container secrets, AWS Parameter Store, GCP Secret Manager, or a secure `.env` file.

| Variable | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables production optimizations, suppresses stack traces |
| `PORT` | No | `5000` | HTTP listen port for backend API server |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/dbname?sslmode=require` | PostgreSQL connection string |
| `JWT_SECRET` | Yes | *(Cryptographically random 64-char string)* | HMAC secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime |
| `CORS_ORIGIN` | Yes | `https://aiclub.yourdomain.edu` | Trusted frontend domain |
| `AI_PROVIDER` | No | `mock` / `openai` | AI LLM provider engine |
| `AI_API_KEY` | If OpenAI | `sk-...` | Secret API key for remote AI model |
| `AI_MODEL` | No | `gpt-4o-mini` | LLM model identifier |
| `AI_TIMEOUT_MS`| No | `15000` | AI HTTP request timeout in milliseconds |

---

## 3. Database Setup & Migration Strategy

Migrations are automated, idempotent, and executed via a controlled deployment step. **Never modify production schema manually.**

### 3.1 Migration Execution Command
```bash
# From server/ directory or via root npm script
npm --prefix server run db:migrate
```

### 3.2 Backward-Compatible Zero-Downtime Migration Pattern
1. **Expand**: Add new nullable columns or tables first.
2. **Deploy Application**: Roll out new backend containers that write to both new and old fields if necessary.
3. **Backfill**: Execute background asynchronous backfill scripts.
4. **Contract**: In a subsequent release, apply constraints or retire legacy columns.

---

## 4. Production Build Process

Production builds should be reproducible and executed in clean environments using committed lockfiles:

```bash
# 1. Clean install root and server dependencies
npm ci
cd server && npm ci && cd ..

# 2. Typecheck both workspaces
npm run typecheck
npm --prefix server run typecheck

# 3. Build frontend bundle (Vite outputs to dist/)
npm run build

# 4. Build backend application (TypeScript outputs to server/dist/)
npm --prefix server run build
```

---

## 5. Deployment Options

### Option A: Docker Compose (Standard Multi-Container)
```bash
# 1. Copy production environment file
cp server/.env.example server/.env.production
# Edit server/.env.production with real production secrets

# 2. Build and launch services in background
docker compose up -d --build

# 3. Check container status
docker compose ps
```

### Option B: Kubernetes / Cloud Container Platforms
1. Deploy PostgreSQL managed cluster (e.g. AWS RDS, GCP Cloud SQL).
2. Run database migration job container:
   ```bash
   node server/dist/db/migrate.js
   ```
3. Deploy API deployment pods running `node dist/server.js`.
4. Configure Readiness probe to `GET /ready` and Liveness probe to `GET /health`.
5. Deploy static frontend pod serving Nginx with `nginx.conf`.

---

## 6. Health Checks & Verification (Smoke Test)

Immediately after deploying, verify service availability using the health endpoints:

```bash
# 1. Check API process liveness
curl -f https://aiclub.yourdomain.edu/api/health
# Expected: HTTP 200 {"success":true,"data":{"status":"ok","service":"ai-club-api"}}

# 2. Check Database connectivity readiness
curl -f https://aiclub.yourdomain.edu/api/ready
# Expected: HTTP 200 {"success":true,"data":{"status":"ready","database":"connected"}}

# 3. Check Public Content API
curl -f https://aiclub.yourdomain.edu/api/skills
# Expected: HTTP 200 with list of skills
```

---

## 7. Rollback Runbook

If a critical incident or verification failure occurs during release:

1. **Application Rollback**:
   - Revert traffic at the load balancer or deploy the previous stable container image tag (e.g., `image:v1.0.0` -> `image:v0.9.8`).
2. **Database Rollback Caution**:
   - **Do not blindly revert database migrations** if user data was written during the window.
   - If rollback is strictly necessary, execute the migration `down()` method only if no destructive loss occurs.
3. **Verify Health**:
   - Re-run `GET /health` and `GET /ready`.

---

## 8. Troubleshooting & Common Issues

| Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| `503 Service Unavailable` on `/ready` | Database pool connection failure | Verify `DATABASE_URL`, network firewalls, and PostgreSQL listener status |
| `429 Too Many Requests` on login | Rate limiter activated | Wait 15 minutes or review legitimate load in server logs via `requestId` |
| `CORS Error` on frontend | `CORS_ORIGIN` mismatch | Ensure `CORS_ORIGIN` exactly matches the browser URL scheme and hostname |
| AI features return fallback error | AI key expired or provider offline | Verify `AI_API_KEY` and check `/api/ai/status`. Core platform remains intact |
