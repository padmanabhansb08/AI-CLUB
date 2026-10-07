# Backend setup

Run commands in this directory so `.env` is loaded from the expected location.

- `npm ci`: install dependencies.
- Copy `.env.example` to `.env` only when no configuration exists, then configure PostgreSQL and JWT secrets.
- For Supabase, use the PostgreSQL connection string as `DATABASE_URL` and set `DATABASE_SSL=true`. Do not use the Supabase API keys in place of the database URL.
- `npm run db:migrate`: apply all migrations without reseeding existing data.
- `npm run dev`: start the development API with file watching.
- `npm run build`: compile the backend.
- `npm start`: run the compiled backend.
- `npm run db:seed`: optional development sample data; do not reseed an existing database to preserve member data.
- `npm run typecheck` and `npm test`: run type and integration checks. Use an isolated development database for tests; the existing suites create and update demo records.

The health endpoint `/api/health` verifies the database and returns HTTP 503 when the connection fails. Database connection and query waits are bounded. JWT authorization checks the account's current role and session version, so deleted accounts, changed roles, and password resets cannot reuse old access tokens.

Password-reset links last 30 minutes; verification links last 24 hours. Only hashes of random link tokens are stored. Tokens are consumed atomically and cannot be reused. Password changes require the current password and revoke previous sessions. Requests for mail require the SMTP configuration documented in `.env.example`; they do not send simulated emails.

Frontend and backend builds, deployment packaging, pending launch services, and verification results are documented in the root README and `docs/launch-readiness.md`.
