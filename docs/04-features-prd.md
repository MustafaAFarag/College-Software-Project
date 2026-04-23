# Feature PRD — UniReg Demo

## Scope Note
College demo, not production. Goal: demonstrate all FRs clearly. Clean UI, smooth flow, no over-engineering.

---

## Role: Student

### F1 — Login
- Email + password form.
- On success → redirect to `/student/dashboard`.
- Show role badge in header: "Student — Ahmed Hassan".
- Landing page shows 3 preset demo accounts (email + password visible) for easy demo switching.

### F2 — Dashboard
- Active term name + registration window status (OPEN / CLOSED / DROP WINDOW).
- Credit hours enrolled this term (current / max).
- Quick links: Browse Courses, My Schedule, Transcript.
- Waitlist count badge if any.

### F3 — Browse & Register Courses
- Table/card list of all sections for active term.
- Filters: department, course level (100–400), day of week, available seats only toggle.
- Each section card shows: course code, title, instructor, schedule, room, seats filled/capacity, prerequisites.
- Register button per section. On click:
  - Client calls `POST /api/enrollments` with sectionId.
  - Validator runs server-side. Response includes `{ ok, reason }`.
  - If blocked: inline error message specific to the reason:
    - "Missing prerequisite: CS201 required"
    - "Time conflict with CS301 (Mon 09:00–10:30)"
    - "Credit hour cap reached (18/18)"
    - "Section full — you have been added to the waitlist" (auto-waitlist)
  - If enrolled: button turns to "Enrolled ✓", seat count updates.
- "Request Override" link appears when blocked by prereq or credit-cap.

### F4 — My Schedule
- Weekly grid (Sun–Thu, 8am–6pm, matching Egyptian academic calendar).
- Each enrolled section renders as a colored block.
- Waitlisted sections shown in muted/striped style.

### F5 — Drop Course
- From schedule or enrollment list: "Drop" button.
- Confirm dialog: "Drop CS301 — Section A? This cannot be undone after drop window closes."
- On confirm: `PATCH /api/enrollments/:id` with `{ state: "DROPPED" }`.
- Auto-promote: if waitlisted student exists for that section, system promotes them in same transaction.
- Drop button disabled + tooltip if drop window is closed.

### F6 — Override Request
- Form: select blocked section, write reason (free text, 20–500 chars).
- Submits to `POST /api/overrides`.
- Status page shows all submitted requests + current status (PENDING / APPROVED / REJECTED).
- On APPROVED: student can re-attempt registration and bypass the specific constraint.

### F7 — Transcript
- List of all terms + enrolled/completed courses + credit hours.
- "Download PDF" button → `GET /api/transcript` → returns PDF stream.
- PDF contains: student name, ID, department, list of courses by term, total credits.

---

## Role: Advisor

### F8 — Override Inbox
- Table of all PENDING override requests.
- Columns: student name, section, course code, reason, submitted at.
- Per row: "Approve" / "Reject" buttons.
- `PATCH /api/overrides/:id` with `{ status: "APPROVED" | "REJECTED" }`.
- Approved requests are flagged in DB; validator checks for approved override before blocking.

---

## Role: Admin

### F9 — Manage Terms
- List of terms. Create / edit term: code, label, dates (start, end, regOpens, regCloses, dropCloses).
- Toggle isActive. Only one term active at a time (enforced server-side).

### F10 — Manage Courses
- List of courses. Create / edit: code, title, creditHours, level, department.
- Manage prerequisites: add/remove prereq course links.

### F11 — Manage Sections
- List sections per term. Create / edit: course, instructor (optional), capacity, schedule (JSON builder — day + start/end time + room rows).
- "Open Registration" / "Close Registration" toggle per term.

### F12 — Audit Log Viewer
- Paginated table of all AuditLog entries.
- Filters: student, section, action type, date range.
- Columns: timestamp, actor, action, from state, to state, section, meta.

---

## Shared

### Navigation
- Sidebar (desktop) / hamburger menu (mobile) with role-appropriate links.
- Header: app name, user name + role badge, logout.

### Error States
- All API errors return `{ error: string }` JSON. UI shows toast or inline message.
- Loading skeletons on data fetch.

### Responsive
- Mobile-first. Works on 375px+ width. Schedule grid scrolls horizontally on small screens.

---

## Out of Scope (document explicitly in PDF)
- Email notifications (mocked as console.log)
- Grade entry
- Fee/refund on drop
- Multi-department prerequisites (cross-dept is supported by schema but not tested)
- Arabic UI (planned, deferred)
- SSO / LDAP integration (uses local credentials only)
