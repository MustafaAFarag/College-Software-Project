# Diagrams Guide — draw.io

One master `.drawio` file. Six pages, one diagram each. Same stencil set: UML shape library. Export each page as PNG at 150 DPI for PDF, then export full file as PDF for diagrams sheet.

---

## Page 1 — Context Diagram

**Type:** DFD Level 0 (system as black box)

**Elements:**
- Center rectangle: `UniReg System`
- External entities (rectangles, labeled):
  - `Student`
  - `Academic Advisor`
  - `Admin / Registrar`
  - `Instructor`
  - `Email Service` (mocked)
  - `University SSO` (mocked / out of scope)
- Arrows with labels (data flows):

| From | To | Flow |
|------|----|------|
| Student | System | Login credentials, registration request, drop request, override request |
| System | Student | Schedule, transcript PDF, enrollment confirmation, waitlist status, error messages |
| Advisor | System | Login credentials, override decision (approve/reject) |
| System | Advisor | Override request list |
| Admin | System | Login credentials, term/course/section data, window open/close |
| System | Admin | Audit log, system status |
| Instructor | System | Login credentials |
| System | Instructor | Section roster |
| System | Email Service | Waitlist promotion notification (mocked) |

**Purpose text for PDF:** "Shows system boundary. Establishes all external actors and data flows without exposing internal structure. Foundational — every FR maps to an arrow here."

---

## Page 2 — Use Case Diagram

**Type:** UML Use Case

**Actors (left side):**
- `Student`
- `Academic Advisor`
- `Admin`
- `Instructor`

**Use cases (ovals):**
- Browse Courses
- Register for Section
- Drop Course
- View Schedule
- View/Download Transcript
- Request Override
- View Waitlist Status
- Login *(shared)*
- Validate Enrollment *(system, no actor arrow — included)*
- Approve/Reject Override
- Manage Terms
- Manage Courses & Sections
- Open/Close Registration Window
- View Audit Log
- View Section Roster

**Relationships:**
- Student → Browse Courses
- Student → Register for Section `<<include>>` Validate Enrollment
- Student → Drop Course
- Student → View Schedule
- Student → View/Download Transcript
- Student → Request Override `<<extend>>` Register for Section (extends when blocked)
- Student → View Waitlist Status
- Advisor → Approve/Reject Override
- Admin → Manage Terms
- Admin → Manage Courses & Sections
- Admin → Open/Close Registration Window
- Admin → View Audit Log
- Instructor → View Section Roster
- All actors → Login

**Purpose text for PDF:** "Maps each FR to a user-visible function. `<<include>>` shows mandatory sub-behavior (validation always runs). `<<extend>>` shows optional path (override only triggered when enrollment blocked)."

---

## Page 3 — Activity Diagram (two swimlanes)

**Type:** UML Activity Diagram

**Swimlanes:** `Student` | `System`

**Flow 1 (main): Register for a Course**

```
Student lane:
  [Start] → Open "Browse Courses" → Select section → Click "Register"

System lane:
  Receive request
  → [Decision] Registration window open?
      No → Return error "Window closed" → [End path]
      Yes ↓
  → [Decision] Already enrolled?
      Yes → Return error "Already enrolled" → [End path]
      No ↓
  → [Decision] Prerequisites met? (or override approved?)
      No → Return error "Missing prereq: X" → [End path]
      Yes ↓
  → [Decision] Time conflict?
      Yes → Return error "Conflict with Y" → [End path]
      No ↓
  → [Decision] Credit cap reached? (or override approved?)
      Yes → Return error "Cap reached" → [End path]
      No ↓
  → [Decision] Section full?
      Yes → Create WAITLISTED enrollment → Assign waitlist position → Return "Waitlisted (pos N)" → [End]
      No ↓
  → Create ENROLLED enrollment → Write AuditLog → Return "Enrolled ✓" → [End]

Student lane:
  ← Receive result → Display inline message
```

**Flow 2 (secondary): Drop with Auto-Promote**

```
Student: Click "Drop" → Confirm dialog → Confirm

System:
  → Set enrollment to DROPPED → Write AuditLog(DROP)
  → [Decision] Any WAITLISTED students for this section?
      No → Done
      Yes ↓
  → Get top waitlist candidate
  → Re-run validator for candidate
  → [Decision] Still valid?
      No → Try next candidate
      Yes ↓
  → Set candidate enrollment to ENROLLED → Clear waitlistPos → Write AuditLog(PROMOTE)
  → Done
```

**Purpose text for PDF:** "Shows exact execution path for the system's most complex flow. Decision nodes map directly to validator checks in FR5–FR7. Swimlanes show responsibility split between user action and system enforcement."

---

## Page 4 — State Machine Diagram (BONUS 1)

**Type:** UML State Machine

**Subject:** `Enrollment` entity for a (student, section) pair

**States:**
- `[Initial]` (filled circle)
- `PENDING` — submitted, validator running
- `ENROLLED` — confirmed seat
- `WAITLISTED` — section full, in queue
- `DROPPED` — student dropped
- `COMPLETED` — term ended, credit counted
- `CANCELLED` — admin cancelled
- `[Final]` (filled circle + ring)

**Transitions:**

| From | Trigger | Guard | To |
|------|---------|-------|----|
| [Initial] | submit() | all checks pass | ENROLLED |
| [Initial] | submit() | section full | WAITLISTED |
| PENDING | system validates | pass | ENROLLED |
| PENDING | system validates | fail | [rejected — no state created] |
| WAITLISTED | seat_frees() | re-validation passes | ENROLLED |
| WAITLISTED | student_drops_waitlist() | — | DROPPED |
| ENROLLED | drop() | within drop window | DROPPED |
| ENROLLED | term_ends() | — | COMPLETED |
| ENROLLED | admin_cancel() | — | CANCELLED |
| WAITLISTED | admin_cancel() | — | CANCELLED |
| DROPPED | — | — | [Final] |
| COMPLETED | — | — | [Final] |
| CANCELLED | — | — | [Final] |

**Purpose text for PDF:** "Captures full lifecycle of an enrollment record. Each transition corresponds to a logged AuditLog entry (FR12). Directly informs the DB EnrollmentState enum and validator logic."

---

## Page 5 — Gantt Chart

**Type:** Gantt (draw.io table or use horizontal bar chart stencil)

**Tasks (use WBS IDs), assign 2-week timeline (even if sprint is shorter — Gantt represents planned project effort, not wall-clock):**

| Task | Owner | Start | Duration | Dependency |
|------|-------|-------|----------|------------|
| 1.1 Planning | PM | Day 1 | 1d | — |
| 2.1 Elicitation | Team | Day 1 | 1d | 1.1 |
| 2.2 FR+NFR Spec | Team | Day 2 | 2d | 2.1 |
| 2.3 Analysis | Team | Day 3 | 1d | 2.2 |
| 3.1 Context Diagram | Docs | Day 2 | 1d | 2.1 |
| 3.2 Use Case Diagram | Docs | Day 3 | 1d | 2.2 |
| 3.3 Activity Diagram | Docs | Day 4 | 1d | 3.2 |
| 3.4 State Machine | Docs | Day 5 | 1d | 3.3 |
| 3.5 Gantt | Docs | Day 5 | 1d | 2.2 |
| 3.6 PERT | Docs | Day 6 | 1d | 3.5 |
| 4.1 Architecture | Dev | Day 2 | 1d | 2.1 |
| 4.2 DB Schema | Dev | Day 2 | 1d | 4.1 |
| 5.1–5.3 Auth+Browse+Validator | Dev | Day 3 | 2d | 4.2 |
| 5.4 Enroll/Drop/Waitlist | Dev | Day 5 | 2d | 5.1 |
| 5.5–5.7 Override+Admin+Audit | Dev | Day 7 | 2d | 5.4 |
| 6.1 Validator tests | Dev | Day 5 | 1d | 5.1 |
| 6.2 E2E smoke test | Dev | Day 9 | 1d | 5.7 |
| 7.1 Final PDF | Docs | Day 8 | 2d | 3.6 |
| 7.2 Diagrams sheet | Docs | Day 9 | 1d | 3.6 |
| 8.1 Seed demo data | Dev | Day 9 | 0.5d | 5.7 |
| 8.2 Video recording | All | Day 10 | 1d | 7.1, 8.1 |

**Purpose text for PDF:** "Shows planned schedule across WBS tasks with dependencies and team ownership. Critical path runs through: Requirements → Use Case → Activity → Implementation → PDF → Video."

---

## Page 6 — PERT Diagram

**Type:** PERT/CPM network diagram

**Critical path (longest path):**
```
Start → Elicitation → FR+NFR Spec → Activity Diagram → State Machine → Final PDF → Video → End
```

**Nodes to draw** (circles with task ID + duration):
- Use the same task list from Gantt, show early start / late start / slack per node.
- Highlight critical path nodes in red/bold.

**Key numbers for nodes (EST / LST / Slack):**

| Task | Duration | EST | LST | Slack |
|------|----------|-----|-----|-------|
| Elicitation | 1 | 0 | 0 | 0 (critical) |
| FR+NFR Spec | 2 | 1 | 1 | 0 (critical) |
| Context Diagram | 1 | 1 | 2 | 1 |
| Use Case Diagram | 1 | 3 | 3 | 0 (critical) |
| Activity Diagram | 1 | 4 | 4 | 0 (critical) |
| State Machine | 1 | 5 | 5 | 0 (critical) |
| Gantt | 1 | 3 | 4 | 1 |
| PERT | 1 | 4 | 5 | 1 |
| Auth+Browse+Val | 2 | 2 | 3 | 1 |
| Enroll/Drop | 2 | 4 | 4 | 0 (critical) |
| Override+Admin | 2 | 6 | 6 | 0 (critical) |
| Final PDF | 2 | 6 | 6 | 0 (critical) |
| Video | 1 | 8 | 8 | 0 (critical) |

**Purpose text for PDF:** "Identifies critical path and task slack for project scheduling. Confirms video recording is on critical path — delay there delays final delivery. Non-critical diagrams (Context, Gantt) have 1-day slack."

---

## Diagram Export Checklist (draw.io)

- [ ] All 6 pages in one `.drawio` file
- [ ] Page names match diagram names
- [ ] Same UML stencil library used throughout (no mixed icon packs)
- [ ] Export each page: PNG 150 DPI → embed in PDF doc
- [ ] Export full file: PDF → diagrams sheet (arrange all 6 on A2 layout page in draw.io before export)
- [ ] Fonts: use built-in draw.io fonts (Helvetica or Arial) — ensures PDF embeds correctly
