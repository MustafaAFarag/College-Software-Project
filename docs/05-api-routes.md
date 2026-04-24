# API Routes Reference

All routes live under `/api`. Unless noted otherwise, they return JSON and use the NextAuth session cookie for authorization.

## Auth

- `POST /api/auth/[...nextauth]`
  Credentials-based sign-in handled by NextAuth.

## Enrollments

- `GET /api/enrollments`
  Returns the current student's active-term enrollments.

- `POST /api/enrollments`
  Request: `{ "sectionId": "..." }`
  Response:
  - `{ "ok": true, "state": "ENROLLED", "enrollmentId": "..." }`
  - `{ "ok": true, "state": "WAITLISTED", "waitlistPos": 2, "enrollmentId": "..." }`
  - `{ "error": "Human-readable reason" }`

- `PATCH /api/enrollments/[id]`
  Request: `{ "action": "DROP" }`
  Response: `{ "ok": true, "promoted": "student-id-or-null" }`

## Override Requests

- `GET /api/overrides`
  - Student: own requests
  - Advisor: pending requests

- `POST /api/overrides`
  Request: `{ "sectionId": "...", "reason": "20-500 chars" }`

- `PATCH /api/overrides/[id]`
  Request: `{ "status": "APPROVED" | "REJECTED" }`
  Also writes an audit log entry for the decision.

## Browse Sections

- `GET /api/sections`
  Query params: `termId`, `departmentId`, `level`, `day`, `availableOnly`
  Auth: any signed-in user

## Transcript

- `GET /api/transcript`
  Returns a generated PDF stream with `Content-Type: application/pdf`.
  Auth: student only

## Admin - Terms

- `GET /api/admin/terms`
- `POST /api/admin/terms`
- `PATCH /api/admin/terms/[id]`

## Admin - Courses

- `GET /api/admin/courses`
- `POST /api/admin/courses`
- `PATCH /api/admin/courses/[id]`
- `POST /api/admin/courses/[id]/prerequisites`
- `DELETE /api/admin/courses/[id]/prerequisites/[reqId]`

## Admin - Sections

- `GET /api/admin/sections`
- `POST /api/admin/sections`
- `PATCH /api/admin/sections/[id]`

## Admin - Audit

- `GET /api/admin/audit`
  Query params: `studentId`, `sectionId`, `action`, `from`, `to`, `page`, `limit`

## Error Format

```json
{ "error": "Human-readable message" }
```
