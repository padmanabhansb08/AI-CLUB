# AI CLUB — API Specification

## 1. Response Standard

All backend endpoints return responses adhering to one of the following two canonical envelopes:

### 1.1 Success Envelope

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

For list endpoints with pagination:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "message": "Operation successful"
}
```

### 1.2 Error Envelope

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description of error",
    "details": { ... }
  }
}
```

---

## 2. Health & Observability

### `GET /api/health`

- **Purpose**: Verify backend service liveness and PostgreSQL database connectivity.
- **Authentication**: None.
- **Success Response (`200 OK`)**:

  ```json
  {
    "success": true,
    "data": {
      "status": "ok",
      "database": "connected"
    },
    "message": "AI CLUB API is healthy"
  }
  ```

- **Error Response (`503 Service Unavailable`)**:

  ```json
  {
    "success": false,
    "data": {
      "status": "error",
      "database": "disconnected"
    },
    "error": {
      "code": "SERVICE_UNAVAILABLE",
      "message": "Database connection failed",
      "details": {}
    }
  }
  ```

---

## 3. Authentication Endpoints

### 3.1 `POST /api/auth/register`

- **Purpose**: Register a new student account and create their academic member profile in an atomic database transaction.
- **Authentication**: None (Rate limited: 50 requests / 15 minutes).
- **Request Body**:

  ```json
  {
    "email": "student@college.edu",
    "password": "SecurePassword123!",
    "fullName": "Jane Doe",
    "registerNumber": "21BCE1099",
    "department": "AIDS",
    "classSection": "A",
    "year": 3,
    "collegeEmail": "student@college.edu",
    "phone": "+91 9876543210"
  }
  ```

- **Validation Rules**:
  - `email`: Valid email format.
  - `password`: Minimum 8 characters.
  - `fullName`: Minimum 2 characters.
  - `registerNumber`: Minimum 2 characters.
  - `department`: Minimum 2 characters.
  - `classSection`: Minimum 1 character.
  - `year`: Integer between 1 and 5.
  - `collegeEmail`: Optional (defaults to `email`).
  - `phone`: Optional string.
- **Success Response (`201 Created`)**:

  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "c1f7b824-3456-42bc-9d9e-e3143c7b8991",
        "email": "student@college.edu",
        "role": "student",
        "memberId": "a93e8712-4211-47cc-9812-ab7e31481b09",
        "fullName": "Jane Doe",
        "registerNumber": "21BCE1099",
        "department": "AIDS",
        "classSection": "A",
        "year": 3,
        "collegeEmail": "student@college.edu",
        "phone": "+91 9876543210",
        "status": "Active"
      }
    },
    "message": "User registered successfully"
  }
  ```

- **Errors**:
  - `400 Bad Request` (`VALIDATION_ERROR`): Payload failed validation schema.
  - `409 Conflict` (`CONFLICT`): An account with this email, register number, or college email already exists.
  - `429 Too Many Requests` (`RATE_LIMITED`): Exceeded registration rate limit.

---

### 3.2 `POST /api/auth/login`

- **Purpose**: Authenticate existing student or administrator with credentials and receive a signed JWT session token.
- **Authentication**: None (Rate limited: 50 requests / 15 minutes).
- **Request Body**:

  ```json
  {
    "email": "student@aiclub.com",
    "password": "student123"
  }
  ```

- **Success Response (`200 OK`)**:

  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "060d4ce2-683a-4ef8-a3ca-fca3b0d5658e",
        "userId": "060d4ce2-683a-4ef8-a3ca-fca3b0d5658e",
        "email": "student@aiclub.com",
        "role": "student",
        "fullName": "Rahul Sharma",
        "registerNumber": "21BCE1001",
        "department": "CSE",
        "classSection": "A",
        "year": 3,
        "collegeEmail": "student@aiclub.com",
        "status": "Active"
      }
    },
    "message": "Login successful"
  }
  ```

- **Errors**:
  - `400 Bad Request` (`VALIDATION_ERROR`): Missing email or password.
  - `401 Unauthorized` (`UNAUTHORIZED`): Invalid credentials.
  - `429 Too Many Requests` (`RATE_LIMITED`): Exceeded login attempt rate limit.

---

### 3.3 `GET /api/auth/me`

- **Purpose**: Hydrate authenticated session and retrieve current user context, role, and academic profile.
- **Authentication**: `Bearer <token>` required.
- **Success Response (`200 OK`)**:

  ```json
  {
    "success": true,
    "data": {
      "id": "060d4ce2-683a-4ef8-a3ca-fca3b0d5658e",
      "userId": "060d4ce2-683a-4ef8-a3ca-fca3b0d5658e",
      "email": "student@aiclub.com",
      "role": "student",
      "fullName": "Rahul Sharma",
      "registerNumber": "21BCE1001",
      "department": "CSE",
      "classSection": "A",
      "year": 3,
      "collegeEmail": "student@aiclub.com",
      "phone": "+91 9876543210",
      "status": "Active",
      "bio": "AI enthusiast & Full Stack Developer...",
      "skills": ["Python", "PyTorch", "TypeScript", "React", "PostgreSQL"],
      "technicalInterests": ["Deep Learning", "Computer Vision", "Generative AI"]
    },
    "message": "Authenticated user context retrieved"
  }
  ```

- **Errors**:
  - `401 Unauthorized` (`UNAUTHORIZED`): Missing or expired Bearer token.
  - `404 Not Found` (`NOT_FOUND`): User record no longer exists in database.

---

### 3.4 `POST /api/auth/logout`

- **Purpose**: Terminate current authenticated session.
- **Authentication**: None or `Bearer <token>`.
- **Success Response (`200 OK`)**:

  ```json
  {
    "success": true,
    "data": {},
    "message": "Logged out successfully"
  }
  ```

---

## 4. Protected Student Endpoints

### 4.1 `GET /api/me/profile`

- **Purpose**: Retrieve student member profile and calculated profile completion score.
- **Authentication**: `Bearer <token>` (`student` or `admin`).
- **Success Response (`200 OK`)**:

  ```json
  {
    "success": true,
    "data": {
      "id": "a93e8712-4211-47cc-9812-ab7e31481b09",
      "userId": "060d4ce2-683a-4ef8-a3ca-fca3b0d5658e",
      "fullName": "Rahul Sharma",
      "registerNumber": "21BCE1001",
      "department": "CSE",
      "classSection": "A",
      "year": 3,
      "collegeEmail": "student@aiclub.com",
      "phone": "+91 9876543210",
      "bio": "AI enthusiast & Full Stack Developer...",
      "skills": ["Python", "PyTorch", "TypeScript", "React"],
      "profileCompletion": 85
    },
    "message": "Member profile retrieved"
  }
  ```

---

### 4.2 `PATCH /api/me/profile`

- **Purpose**: Update editable profile attributes (bio, links, photo, skills, interests).
- **Authentication**: `Bearer <token>` (`student`).
- **Request Body**:

  ```json
  {
    "bio": "Exploring foundation models and autonomous agents.",
    "profilePhotoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "githubUrl": "https://github.com/rahulsharma",
    "skills": ["Python", "PyTorch", "Rust", "TypeScript"],
    "technicalInterests": ["Deep Learning", "Generative AI"]
  }
  ```

- **Success Response (`200 OK`)**: Returns updated profile object with recalculated `profileCompletion`.

---

### 4.3 `GET /api/dashboard`

- **Purpose**: Retrieve aggregated personalized dashboard data (profile, profile completion, quick counts, announcements, activities).
- **Authentication**: `Bearer <token>` (`student`).
- **Success Response (`200 OK`)**:

  ```json
  {
    "success": true,
    "data": {
      "profile": { ... },
      "profileCompletion": {
        "percentage": 85,
        "completed": 9,
        "total": 11,
        "missing": ["portfolio"]
      },
      "stats": {
        "projects": 2,
        "courses": 1,
        "achievements": 1,
        "events": 0,
        "totalProjects": 5,
        "totalCourses": 4,
        "totalEvents": 2
      },
      "announcements": [ ... ],
      "recentProjects": [ ... ],
      "recentAchievements": [ ... ],
      "recentActivity": [
        {
          "id": "ach-1",
          "type": "achievement",
          "title": "Achievement Unlocked",
          "description": "First Place — National AI Hackathon",
          "timestamp": "2026-03-15",
          "icon": "🏆",
          "link": "/achievements"
        }
      ]
    },
    "message": "Personalized student dashboard data retrieved"
  }
  ```

---

### 4.4 `GET /api/members`

- **Purpose**: Public/authenticated member directory with sanitized fields (no password hashes or private credentials).
- **Authentication**: Optional / Public.
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 20, max: 100)
  - `search` (filter by student name, register number, or skill)
  - `department` (filter by academic department)
- **Success Response (`200 OK`)**:

  ```json
  {
    "success": true,
    "data": [
      {
        "id": "f9241c2a-7a44-4a25-a1cf-2269c415bef9",
        "fullName": "Rahul Sharma",
        "registerNumber": "21BCE1001",
        "department": "CSE",
        "classSection": "A",
        "year": 3,
        "bio": "AI enthusiast & Full Stack Developer...",
        "profilePhotoUrl": "https://images.unsplash.com/...",
        "githubUrl": "https://github.com/rahulsharma",
        "skills": ["Python", "PyTorch", "TypeScript"],
        "technicalInterests": ["Deep Learning", "Generative AI"],
        "joinedAt": "2026-10-05T08:00:00Z",
        "status": "Active"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "message": "Member directory retrieved"
  }
  ```

---

### 4.5 `GET /api/members/:id`

- **Purpose**: Retrieve public member profile by ID.
- **Authentication**: Optional / Public.
- **Success Response (`200 OK`)**: Returns sanitized public member profile object.

---

### 4.6 `GET /api/skills` & `GET /api/interests`

- **Purpose**: Retrieve curated catalog of engineering skills and technical interests.
- **Authentication**: None.
- **Success Response (`200 OK`)**: Returns list of `{ id, name, category }`.

---

## 5. Protected Admin Endpoints

All endpoints under `/api/admin/*` require `authenticate` and `requireAdmin` (`role === 'admin'`).

Non-admin access returns:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access forbidden: requires ADMIN or admin privileges",
    "details": {}
  }
}
```

### Key Admin Endpoints

- `GET /api/admin/members`: Paginated list of registered club members with optional `?search=` and `?department=` filters.
- `GET /api/admin/members/:id`: Specific member detail.
- `POST /api/admin/achievements`, `PUT /api/admin/achievements/:id`, `DELETE /api/admin/achievements/:id`.
- `POST /api/admin/updates`, `PUT /api/admin/updates/:id`, `DELETE /api/admin/updates/:id`.
- `POST /api/admin/projects`, `PUT /api/admin/projects/:id`, `DELETE /api/admin/projects/:id`.
- `POST /api/admin/courses`, `PUT /api/admin/courses/:id`, `DELETE /api/admin/courses/:id`.
- `POST /api/admin/events`, `PATCH /api/admin/events/:id`, `DELETE /api/admin/events/:id`.
- `POST /api/admin/announcements`, `PATCH /api/admin/announcements/:id`, `DELETE /api/admin/announcements/:id`.
