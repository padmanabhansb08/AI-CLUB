# Database Validation & Test Plan

## Status
**BLOCKED — PostgreSQL runtime unavailable**
*The execution environment does not have native PostgreSQL or a functioning Docker engine to run the database. All schemas, migrations, and architecture have been written, but runtime verification could not be executed.*

## Test Plan (To be executed when DB is available)

### 1. Migrations & Rollback
- [ ] Run `001_initial_schema.ts` `up()`
- [ ] Verify all tables are created.
- [ ] Run `down()` and verify clean teardown.

### 2. Constraints & Integrity
- [ ] **Primary Keys**: UUID generation works on insert.
- [ ] **Foreign Keys**: `ON DELETE CASCADE` behaves correctly when removing a user or member.
- [ ] **Unique Constraints**: Cannot insert two members with the same `register_number` or `college_email`.
- [ ] **Enum/Check Constraints**: Users table restricts `role` to `student` or `admin`.

### 3. Business Rules
- [ ] **Null Progress Values**: `course_progress.progress_percent` allows NULL, indicating unknown progress, separate from 0%.
- [ ] **Duplicate Project Interests**: The composite primary key `(member_id, project_id)` rejects duplicate interests.

### 4. API & Auth
- [ ] **Registration Transaction**: Both `users` and `members` tables populate atomically on registration.
- [ ] **Authorization**: Only tokens with `role = admin` can access `PUT/POST/DELETE` endpoints.
- [ ] **API Health**: `/api/health` accurately reflects database reachability.

### 5. Queries & Scale
- [ ] **Pagination**: Endpoints respond correctly to `?page=1&limit=10`.
- [ ] **Filtering**: SQL `WHERE` clauses successfully filter `status`, `year`, `department`.
