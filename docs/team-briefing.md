# Team Briefing — UniReg Final Submission
**Deadline: 6 May 2026**

---

## What to Review

Two files attached:

| File | What it is |
|------|-----------|
| `UniReg-Final-Report.pdf` | Main deliverable — structured doc with all sections |
| `All digrams.drawio.pdf` | Diagrams sheet — all 6 diagrams |

Code repo: https://github.com/MustafaAFarag/College-Software-Project

**Read your own section and verify it's correct. Reply with any fixes needed ASAP.**

---

## Who Does What in the Video

Script is already written — just assign names to Person A / B / C.

| Person | Segments | What to say/show |
|--------|----------|-----------------|
| **Person A** | Intro (0:30) + System Desc (0:45) + Live Demo (4:00) + Conclusion (0:30) | Speaks most. Does all live screen demo. Needs to practice the 4-flow demo. |
| **Person B** | Requirements walkthrough (1:30) | Explains FR/NFR table, validation checks, waitlist, overrides, audit. Points out the prerequisite vs override conflict. |
| **Person C** | Diagram walkthrough (2:30) | Walks through all 6 diagrams: Context → Use Case → Activity → State Machine → Gantt → PERT. |

**Total target: ~9:45. Hard limit: 10:00.**

---

## Person A — Demo Flow (practice this)

Run `npx prisma migrate reset && npx prisma db seed` before recording.

**Flow A (0:35)** — Login page → sign in as `student@alex.edu` → show Dashboard + My Schedule.

**Flow B (2:05)**
1. Browse Courses → register `CS301-G1`
2. My Schedule → show new CS301 block
3. Try `CS401-G1` → show prerequisite error → submit override request via inline link
4. Switch to `advisor@alex.edu` → Override Inbox → approve request

**Flow C (0:50)**
1. Sign in as `admin@alex.edu`
2. Show dashboard cards (enrollments up, pending overrides changed)
3. Show audit log — registration + override events visible

**Flow D (0:30)**
1. Back to `student@alex.edu` → retry `CS401-G1` → succeeds now
2. Sign in as `instructor@alex.edu` → show roster with student in it

Demo accounts (all password `demo1234`):
- `student@alex.edu`
- `advisor@alex.edu`
- `admin@alex.edu`
- `instructor@alex.edu`

---

## Recording Setup

- 1080p, H.264 CRF 23
- Mic on, Chrome at 110% zoom
- Cut to ≤10:00, compress to ≤100 MB (Handbrake: Web > Gmail Large 720p30 if needed)

---

## Final Submission Bundle (Mustafa assembles)

- [ ] `UniReg-Final-Report.pdf`
- [ ] `All digrams.drawio.pdf`
- [ ] GitHub link: https://github.com/MustafaAFarag/College-Software-Project
- [ ] Demo video MP4 ≤100 MB
- [ ] README in zip (already in repo)

---

## Reply Needed From Each Person

1. Confirm you read your section in the report — any corrections?
2. Volunteer for Person A / B / C video role (or Mustafa assigns)
3. Availability to record before **5 May 2026**
