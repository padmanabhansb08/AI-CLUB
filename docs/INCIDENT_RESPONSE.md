# AI CLUB — Incident Response & Disaster Recovery Runbook

## 1. Incident Management Framework

This runbook defines operational protocols for identifying, containing, mitigating, and recovering from production incidents.

Every production incident progresses through six structured phases:
```
1. Detection ──> 2. Containment ──> 3. Communication ──> 4. Recovery ──> 5. Verification ──> 6. Postmortem
```

---

## 2. Severity Classification

| Level | Definition | Response SLA | Examples |
| :--- | :--- | :--- | :--- |
| **SEV-1 (Critical)** | Core platform down, data loss, or active credential compromise | Immediate (< 15 mins) | DB unreachable, auth broken, data leak |
| **SEV-2 (High)** | Major feature degraded, workarounds available | < 1 hour | LMS video playback down, registrations failing |
| **SEV-3 (Medium)** | Minor feature failure, isolated to few users | < 4 hours | AI recommendations timeout, export CSV slow |
| **SEV-4 (Low)** | Non-blocking cosmetic bug | Next business day | Minor dashboard chart styling glitch |

---

## 3. Incident Scenarios & Response Runbooks

### 3.1 Database Outage (SEV-1)
- **Detection**: `/ready` probe returns HTTP 503; error logs show `ECONNREFUSED` or connection pool timeouts.
- **Containment**:
  1. Route traffic to maintenance page if DB restart is required.
  2. Inspect PostgreSQL container/instance status (`systemctl status postgresql` or `docker compose ps db`).
- **Recovery**:
  1. Check disk space (`df -h`) and RAM utilization.
  2. Restart database service if hung.
  3. Verify connection limits (`SELECT count(*) FROM pg_stat_activity;`).
- **Verification**: Query `/ready` endpoint until HTTP 200 with `database: connected` is received.

### 3.2 Security Breach & Credential Compromise (SEV-1)
- **Detection**: Suspicious audit logs (`audit_logs`), token forgery attempts, or leaked secret reported.
- **Containment**:
  1. Invalidate compromised credentials immediately at cloud or database provider.
  2. Rotate `JWT_SECRET` across all application instances (forces all sessions to re-authenticate).
  3. Terminate active suspicious user sessions (`UPDATE users SET status = 'SUSPENDED' WHERE id = $1`).
- **Recovery**:
  1. Deploy updated environment configuration containing newly rotated secrets.
  2. Review Git history and remove any committed secret artifacts using git-filter-repo.
- **Verification**: Confirm rejected unauthorized requests and clean authentication logs.

### 3.3 AI Provider Outage or Rate Limit Spike (SEV-3)
- **Detection**: AI endpoints return `PROVIDER_ERROR` or `TIMEOUT`; `AI_STATUS` is degraded.
- **Containment**:
  - The AI subsystem is isolated by architectural design. Core functions (Login, Events, Courses, Projects, Dashboard) continue operating normally without degradation.
- **Recovery**:
  1. Switch `AI_PROVIDER=mock` or configure alternate model in environment settings if primary provider is down.
  2. Clear temporary AI rate limiting caps.
- **Verification**: Run `GET /api/ai/status` and verify fallback message delivery.

### 3.4 Data Corruption Incident (SEV-1)
- **Detection**: Inconsistent foreign keys, missing records reported by users, or corrupted table state.
- **Containment**:
  1. Freeze write operations by temporarily placing application in read-only maintenance mode.
  2. Take an immediate snapshot of current PostgreSQL database state for forensics.
- **Recovery**:
  1. Restore from the most recent known-good backup snapshot.
  2. Replay transaction audit logs (`audit_logs`) to reconstruct lost records if viable.
- **Verification**: Run data integrity checks across `users`, `members`, `event_registrations`, and `course_enrollments`.

### 3.5 Deployment Failure (SEV-2)
- **Detection**: Post-deployment smoke test fails; containers crash-loop with non-zero exit codes.
- **Containment**:
  1. Halt continuous deployment pipeline immediately.
  2. Revert traffic to the preceding stable deployment image tag.
- **Recovery**:
  1. Inspect container logs via `docker compose logs server` or Kubernetes pod logs.
  2. Resolve missing environment variables or invalid configuration schemas.
- **Verification**: Run `npm test` and execute smoke tests against the restored deployment.

---

## 4. Postmortem & Corrective Actions

Within 48 hours of any SEV-1 or SEV-2 incident, the engineering team must produce a blameless postmortem:
1. **Summary & Timeline**: Exact timestamps of detection, escalation, mitigation, and resolution.
2. **Root Cause Analysis (5 Whys)**: Underlying technical or process failure that allowed the incident.
3. **What Went Well / What Went Poorly**: Team response and tooling effectiveness.
4. **Action Items (Preventative)**: JIRA/GitHub tickets assigned to prevent recurrence (e.g., adding automated regression tests, alerts, or composite indexes).
