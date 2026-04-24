# Feature PRD - UniReg Demo

## Scope Note

This is a college demo system, not a production registrar. The goal is to clearly demonstrate the core requirements and keep the code, docs, and diagrams aligned.

## Student Features

### F1 - Login
- Demo credentials for student, advisor, instructor, and admin roles.
- Successful login redirects to the role-specific area.

### F2 - Dashboard
- Shows active term, registration status, enrolled credits, and waitlist count.
- Links to course browse, schedule, transcript, and overrides.

### F3 - Browse and Register
- Browse sections for the active term.
- Filters: department, level, day, and available seats only.
- Server-side validation checks registration window, duplicate enrollment, prerequisites, clashes, and credit cap.
- If full, the student is added to the waitlist with a position.

### F4 - Schedule View
- Weekly grid for Sunday-Thursday.
- Enrolled sections appear as blocks; waitlisted sections remain visible.

### F5 - Drop Course
- Drop is allowed only before the term drop deadline.
- Dropping a course triggers same-transaction waitlist promotion when possible.

### F6 - Override Requests
- Students submit a reasoned override request for blocked sections.
- Students can review request status history.

### F7 - Transcript
- Transcript page groups enrollments by term.
- PDF export includes student details, course list, statuses, and total completed credits.

## Advisor Features

### F8 - Override Inbox
- Advisors review pending requests and approve or reject them.
- Override decisions are written to the audit trail.

## Admin Features

### F9 - Term Management
- Create and edit terms.
- Set one active term and adjust registration/drop windows.

### F10 - Course Management
- Create and edit courses.
- Add or remove prerequisite links.

### F11 - Section Management
- Create and edit sections.
- Assign instructors, capacity, and schedule slots.

### F12 - Audit Viewer
- Paginated audit log with filters for student, section, action, and date range.

## Supplemental Feature

### Instructor Roster
- Instructors can sign in and view assigned section rosters.
- This is a supporting read-only demo feature and is not counted inside FR1-FR12.

## Out of Scope

- University SSO
- Real email delivery
- Grade entry
- Finance/refund handling
- Priority-based waitlist rules
