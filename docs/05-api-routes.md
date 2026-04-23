# API Routes Reference

All routes under `/api/`. All return JSON. Auth via NextAuth session cookie.

## Auth

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| POST | `/api/auth/[...nextauth]` | NextAuth handled | session cookie | credentials provider |

---

## Enrollments

### `GET /api/enrollments`
Returns current student's enrollments for active term.
```json
[
  {
    "id": "...",
    "state": "ENROLLED",
    "waitlistPos": null,
    "section": { "id": "...", "courseCode": "CS301", "scheduleJson": "..." }
  }
]
```
Auth: STUDENT only.

### `POST /api/enrollments`
Enroll in a section. Validator runs here.
```json
// request
{ "sectionId": "..." }

// success
{ "ok": true, "state": "ENROLLED" }

// waitlisted
{ "ok": true, "state": "WAITLISTED", "waitlistPos": 2 }

// blocked
{ "ok": false, "reason": "Missing prerequisite: CS201 required" }
```
Auth: STUDENT only.

### `PATCH /api/enrollments/:id`
Drop an enrollment.
```json
// request
{ "action": "DROP" }

// response
{ "ok": true, "promoted": "student-cuid-or-null" }
```
Auth: STUDENT (own enrollment only). Checks drop window.

---

## Override Requests

### `GET /api/overrides`
- STUDENT: returns own requests.
- ADVISOR: returns all PENDING requests.
Auth: STUDENT | ADVISOR.

### `POST /api/overrides`
Create override request.
```json
// request
{ "sectionId": "...", "reason": "I completed equivalent course at..." }

// response
{ "id": "...", "status": "PENDING" }
```
Auth: STUDENT only.

### `PATCH /api/overrides/:id`
Approve or reject.
```json
// request
{ "status": "APPROVED" | "REJECTED" }

// response
{ "id": "...", "status": "APPROVED" }
```
Auth: ADVISOR only.

---

## Sections (Browse)

### `GET /api/sections`
Query params: `termId?`, `departmentId?`, `level?`, `day?`, `availableOnly?`
```json
[
  {
    "id": "...",
    "course": { "code": "CS301", "title": "Data Structures", "creditHours": 3 },
    "instructor": { "name": "Dr. Mohamed Ali" },
    "capacity": 30,
    "enrolled": 28,
    "scheduleJson": "[{\"day\":\"MON\",\"startTime\":\"09:00\",\"endTime\":\"10:30\",\"room\":\"B201\"}]",
    "prerequisites": ["CS201"]
  }
]
```
Auth: any authenticated user.

---

## Transcript

### `GET /api/transcript`
Returns PDF binary stream.
Headers: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="transcript.pdf"`
Auth: STUDENT only (own transcript).

---

## Admin — Terms

### `GET /api/admin/terms` — list all terms
### `POST /api/admin/terms` — create term
### `PATCH /api/admin/terms/:id` — update term, toggle isActive
Auth: ADMIN only.

```json
// POST body
{
  "code": "2025-SPRING",
  "label": "Spring 2025",
  "startDate": "2025-02-01",
  "endDate": "2025-06-15",
  "regOpensAt": "2025-01-15T08:00:00Z",
  "regClosesAt": "2025-02-15T23:59:59Z",
  "dropClosesAt": "2025-03-01T23:59:59Z"
}
```

---

## Admin — Courses

### `GET /api/admin/courses` — list all courses
### `POST /api/admin/courses` — create course
### `PATCH /api/admin/courses/:id` — update course
### `POST /api/admin/courses/:id/prerequisites` — add prereq `{ requiredCourseId }`
### `DELETE /api/admin/courses/:id/prerequisites/:reqId` — remove prereq
Auth: ADMIN only.

---

## Admin — Sections

### `GET /api/admin/sections?termId=` — list sections for term
### `POST /api/admin/sections` — create section
### `PATCH /api/admin/sections/:id` — update section
Auth: ADMIN only.

```json
// POST body
{
  "courseId": "...",
  "termId": "...",
  "instructorId": "...",
  "capacity": 30,
  "scheduleJson": "[{\"day\":\"MON\",\"startTime\":\"09:00\",\"endTime\":\"10:30\",\"room\":\"B201\"},{\"day\":\"WED\",\"startTime\":\"09:00\",\"endTime\":\"10:30\",\"room\":\"B201\"}]"
}
```

---

## Admin — Audit Log

### `GET /api/admin/audit`
Query: `studentId?`, `action?`, `from?`, `to?`, `page?` (default 1), `limit?` (default 50)
Auth: ADMIN only.

---

## Error Format

All errors:
```json
{ "error": "Human-readable message" }
```

HTTP status codes used: 200, 201, 400, 401, 403, 404, 409, 500.
