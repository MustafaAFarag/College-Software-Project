# Diagrams Guide - draw.io

Maintain one `.drawio` file with six pages, one diagram per page. Export each page as PNG for the PDF and export the full file as the diagrams sheet.

## Page 1 - Context Diagram

**Type:** DFD Level 0

**Actors**
- Student
- Academic Advisor
- Admin / Registrar
- Instructor

**Main flows**
- Student <-> UniReg: login, browse/register, drop, override request, schedule, transcript, waitlist feedback
- Advisor <-> UniReg: login, pending requests, approve/reject override
- Admin <-> UniReg: login, term/course/section management, audit queries
- Instructor <-> UniReg: login, section roster access

**Why used**
Shows the system boundary and the external actors that interact with the demo.

## Page 2 - Use Case Diagram

**Core use cases**
- Login
- Browse Courses
- Register for Section
- Drop Course
- View Schedule
- View / Download Transcript
- Request Override
- Approve / Reject Override
- Manage Terms
- Manage Courses
- Manage Sections
- View Audit Log
- View Section Roster

**Relationships**
- `Register for Section` includes `Validate Enrollment`
- `Request Override` extends `Register for Section` when blocked
- `View Section Roster` belongs to the instructor actor and is supplemental to the official FR1-FR12 count

**Why used**
Shows which actor performs each system function and how the major flows relate.

## Page 3 - Activity Diagram

**Type:** Two swimlanes: Student | System

**Main flow**
- Browse courses
- Select section
- Submit registration
- Check window, duplicate, prerequisite/override, clash, credit cap, and capacity
- Create `ENROLLED` or `WAITLISTED`
- Return outcome to the student

**Secondary flow**
- Student drops enrolled section
- System logs drop
- System checks waitlist
- First valid waitlisted student is promoted and logged

**Why used**
Captures the exact decision path for the most important business flow.

## Page 4 - State Machine Diagram

**Subject:** Enrollment record in the demo

**States**
- Initial
- ENROLLED
- WAITLISTED
- DROPPED
- COMPLETED
- Final

**Transitions**
- Initial -> ENROLLED on successful registration
- Initial -> WAITLISTED when section is full
- WAITLISTED -> ENROLLED when a seat opens and revalidation passes
- WAITLISTED -> DROPPED when the student leaves the queue
- ENROLLED -> DROPPED before the deadline
- ENROLLED -> COMPLETED when the term finishes

**Note**
`PENDING` and `CANCELLED` remain in the schema for future extension but are not part of the demo state diagram.

## Page 5 - Gantt Chart

Use the real-world SDLC WBS tasks from `01-project-overview.md` (Project Initiation, Requirements Engineering, System Design, Implementation, Testing, Deployment) and show the planned schedule for developing the UniReg software system.

## Page 6 - PERT Diagram

Use the same SDLC tasks as the Gantt chart and highlight the critical path that leads from project initiation to the final production deployment and handover.

## Diagram Export Checklist

- Six pages in one `.drawio` file
- Page names match the diagram names
- Consistent font family across pages
- Each page exported as PNG for the PDF
- Full file exported as PDF for the diagrams sheet
