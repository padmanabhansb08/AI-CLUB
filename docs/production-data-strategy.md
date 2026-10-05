# Production Data Strategy

## 1. Development vs Production Data
- **Development**: The application includes seed scripts (`server/src/db/seeds/001_initial_seed.ts`) that populate the database with mock accounts (`admin@college.edu`, `student@college.edu`), mock achievements, courses, and project interests.
- **Production**: A strict isolation mechanism ensures the seed scripts DO NOT run when `NODE_ENV=production`. Production databases start completely clean. Only explicit, manual data entry or controlled migrations modify the production schema and contents.

## 2. Seed Strategy
- Seed data exists only to simplify local testing and verify front-end components.
- The `seed.ts` script checks `process.env.NODE_ENV === 'production'` and gracefully exits `process.exit(0)` to prevent pollution.

## 3. Database Integrity Rules
- The PostgreSQL schema strictly enforces integrity using UUID primary keys, `UNIQUE` email and register numbers, and `NOT NULL` fields for crucial data points.
- `CHECK` constraints are utilized (e.g., verifying `role IN ('student', 'admin')`).
- Runtime checks in `scratch_constraints_test.cjs` confirm that the database correctly rejects duplicate records, invalid references, missing fields, and bad enum values independent of the application layer.

## 4. Ownership Relationships
- **Project Interests**: The `addInterest` API derives the authenticated user from the JWT. The SQL query explicitly uses `SELECT id, $2 FROM members WHERE user_id = $1`, guaranteeing a user can only add interests to their own member profile. Idempotency is enforced by `ON CONFLICT DO NOTHING`.
- **Course Progress**: Course progress queries (`getProgressByUserId`) explicitly filter on `WHERE m.user_id = $1`. Progress percentages properly respect `NULL` state rather than coercing unknown values to `0`.

## 5. Delete/Cascade Behavior
- All junction and dependent tables (`achievement_members`, `project_interests`, `course_progress`) enforce `ON DELETE CASCADE`. 
- Testing confirms that deleting a `user` immediately cleans up their associated `members` record and any related progress/interest records without leaving orphans.

## 6. Content Lifecycle
- Admins create educational content (Achievements, Projects, Updates, Courses).
- Validations ensure payload structures using Zod.
- The lifecycle explicitly utilizes standard CRUD (Create, Read, Update, Delete) behaviors that have been fully audited against the real backend/PostgreSQL runtime.

## 7. Migration Safety
- Migrations are sequential and timestamped.
- Operations contain corresponding `UP` and `DOWN` blocks (e.g., dropping tables using `CASCADE`).
- Existing migrations are considered immutable; any future alterations must be placed in a new timestamped migration file.

## 8. Production Data-Import Strategy
- Real member imports should bypass development seeds and be inserted either via a secured Admin API bulk-upload tool or carefully crafted production seed scripts that rely strictly on verified internal data files.
- Real production student personal info (PII) must never be committed to source code or included in automated scripts.

## 9. Known Future Requirements
- **Admin Auditability**: Currently, the system lacks `created_by` or `updated_by` relational references for content mutated by admins. While not an immediate functional integrity risk given the restricted role scope, future revisions should model and trace admin mutations for full audit compliance.

## 10. Anything Intentionally NOT Implemented
- Fake course progress percentages are not implemented. `NULL` retains its SQL semantics.
- Web scraping to synchronize external provider data automatically is excluded from this scope.
- Admin user tracing (`created_by`) is documented as a future requirement but purposely omitted from this immediate schema baseline to preserve existing API compatibility.
