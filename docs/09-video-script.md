# Video Script - <=10 min, <=100 MB

## Recording Setup
- Resolution: 1080p
- Encoder: H.264, CRF 23
- Mic: on
- Browser: Chrome at 110% zoom
- Seed data: run the seed script before recording so the current-term demo dataset is loaded

## Segment Breakdown

| # | Segment | Duration | Who speaks |
|---|---------|----------|------------|
| 1 | Intro - Problem Statement | 0:30 | Person A |
| 2 | System Description and Stakeholders | 0:45 | Person A |
| 3 | Requirements walkthrough | 1:30 | Person B |
| 4 | Diagram walkthrough | 2:30 | Person C |
| 5 | Live demo | 4:00 | Person A |
| 6 | Conclusion | 0:30 | Person A |
| **Total** | | **~9:45** | |

---

## Segment 1 - Problem (0:30)
> "Universities face a real problem: students register for courses with time clashes, missing prerequisites, or sections that are already full. UniReg solves this with an automated, role-aware registration system for Alexandria University."

## Segment 2 - System Description (0:45)
Show the title, problem, objectives, stakeholders, and WBS.

## Segment 3 - Requirements (1:30)
Highlight these points:
- Validation checks registration window, duplicates, prerequisites, clashes, credit cap, and capacity.
- Waitlist and promotion are supported.
- Advisors handle override requests.
- Admin users can audit what happened.

Then point to the requirement conflicts section, especially prerequisite enforcement versus advisor override.

## Segment 4 - Diagrams (2:30)
Walk quickly through:
- Context: Student, Advisor, Admin, and Instructor interact with UniReg.
- Use Case: validation is included in registration; override is an extension when blocked.
- Activity: show the registration decision path.
- State Machine: ENROLLED, WAITLISTED, DROPPED, and COMPLETED transitions.
- Gantt and PERT: show planning and critical path.

## Segment 5 - Live Demo (4:00)

### Flow A - Student baseline (0:35)
1. Open the login page and point out the 4 preset accounts.
2. Sign in as `student@alex.edu`.
3. Show Dashboard and My Schedule to prove the system already contains current-term data.
4. Mention that registration happens from Browse Courses and dropping happens from My Schedule.

### Flow B - Linked workflow (2:05)
1. Stay as `student@alex.edu` and open Browse Courses.
2. Register `CS301-G1`.
3. Open My Schedule and show the new `CS301` block.
4. Try `CS401-G1`.
5. Show the prerequisite error and use the inline link to submit an override request.
6. Sign in as `advisor@alex.edu`.
7. Open Override Inbox and approve Alex Student's request.

### Flow C - Admin visibility (0:50)
1. Sign in as `admin@alex.edu`.
2. Show the dashboard cards:
   - active enrollments increased after `CS301-G1`
   - pending overrides changed after the request and approval
3. Show the recent activity feed and point out the registration and override events.

### Flow D - Instructor visibility (0:30)
1. Return to `student@alex.edu` and retry `CS401-G1`.
2. Show that registration now succeeds.
3. Sign in as `instructor@alex.edu`.
4. Open the roster and show Alex Student in the active-term instructor sections.

### Optional backup (0:20)
If needed, use the pre-seeded full `MATH201-G2` section to demonstrate waitlist behavior and later promotion after a drop.

## Segment 6 - Conclusion (0:30)
> "UniReg demonstrates a connected workflow across student, advisor, admin, and instructor roles. The demo shows validation, overrides, auditability, and role-specific views working together in one consistent system. Thank you."

## Export Checklist
- [ ] Raw recording < 12 min
- [ ] Cut to <= 10 min
- [ ] Final MP4 <= 100 MB
- [ ] Audio is clear throughout
- [ ] The student, advisor, admin, and instructor handoff is visible
- [ ] All required diagrams are shown on screen
