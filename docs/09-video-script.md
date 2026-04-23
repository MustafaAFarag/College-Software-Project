# Video Script — ≤10 min, ≤100 MB

## Recording Setup
- Resolution: 1080p
- Encoder: H.264, CRF 23 (OBS or screen-recorder of choice)
- Mic: on (narrate live or record then voiceover)
- Browser: Chrome, zoom to 110% for readability
- Seed data: run before recording, ensure demo accounts ready

## Segment Breakdown

| # | Segment | Duration | Who speaks |
|---|---------|----------|------------|
| 1 | Intro — Problem Statement | 0:30 | Person A |
| 2 | System Description & Stakeholders | 0:45 | Person A |
| 3 | Requirements walkthrough (FR + NFR highlights) | 1:30 | Person B |
| 4 | Diagram walkthrough | 2:30 | Person C |
| 5 | Live demo | 4:00 | Person A (shares screen) |
| 6 | Conclusion | 0:30 | Person A |
| **Total** | | **~9:45** | |

---

## Segment 1 — Problem (0:30)
> "Universities face a real problem: students register for courses with time clashes, missing prerequisites, or in sections that are already full. UniReg solves this with an automated, role-aware registration system for Alexandria University."

Show: slides or just talking head.

---

## Segment 2 — System Description (0:45)
> Walk through:
- Title, problem, objectives (bullet read)
- Stakeholders table
- WBS tree

Show: open the PDF or a slide with the content.

---

## Segment 3 — Requirements (1:30)
> "We identified 12 functional requirements and 6 non-functional requirements. Key highlights..."

Highlight 3–4 notable FRs:
- FR5: validation (prereq + time + capacity + credit cap)
- FR6+FR7: waitlist + auto-promote
- FR9: advisor override workflow
- FR12: audit log

Then show conflicts section:
- C1: strict prereq vs override
- C2: capacity cap vs waitlist promote

Show: requirements table in PDF, point to specific rows.

---

## Segment 4 — Diagrams (2:30)
Switch to draw.io or exported PNGs. Walk each briefly:

**Context Diagram (0:25):** "System as black box. External actors: Student, Advisor, Admin, Instructor. Data flows in/out."

**Use Case Diagram (0:30):** "Each actor's functions. Note `<<include>>` for validation — runs on every registration. `<<extend>>` for override — only triggered when blocked."

**Activity Diagram (0:40):** Walk the register flow. "Start with login, browse, click register. System runs seven checks in order. Section full → waitlisted. All pass → enrolled."

**State Machine (0:30):** "Enrollment lifecycle. PENDING → ENROLLED or WAITLISTED. Seat frees → ENROLLED. Term ends → COMPLETED. Each transition is logged."

**Gantt + PERT (0:25):** "Planned schedule with critical path highlighted. Video is on critical path — delay here delays everything."

---

## Segment 5 — Live Demo (4:00)

**Pre-demo:** Show login page with 3 preset accounts visible.

**Flow A — Happy path (1:00):**
1. Login as `student@alex.edu`
2. Browse courses, filter by CS department
3. Click Register on CS301 → enrolled immediately
4. Show schedule grid with CS301 block

**Flow B — Blocked + Waitlist (1:00):**
1. Try to register for a full section → "Section full — added to waitlist (position 1)"
2. Switch to second student account (open incognito or show second tab)
3. That student drops the section
4. Switch back to first student → show enrollment promoted to ENROLLED
5. Check admin audit log → see DROP + PROMOTE entries

**Flow C — Override workflow (1:00):**
1. Login as student, try to register CS301 with CS201 prereq missing
2. See error: "Missing prerequisite: CS201 — Data Structures"
3. Click "Request Override", write reason, submit
4. Login as advisor@alex.edu
5. See override inbox, approve request
6. Switch back to student, re-attempt registration → succeeds

**Flow D — Admin (1:00):**
1. Login as admin@alex.edu
2. Show admin panel: create term, add section
3. Close registration window
4. Switch to student → register button disabled with "Registration closed"
5. Show audit log viewer, filter by student

---

## Segment 6 — Conclusion (0:30)
> "UniReg demonstrates full-stack implementation aligned with all 12 functional requirements. Requirement conflicts — especially the prerequisite vs override trade-off — drove our most important design decisions. Thank you."

---

## Export Checklist
- [ ] Raw recording < 12 min
- [ ] Cut to ≤ 10 min in editor
- [ ] Final MP4 file size ≤ 100 MB (re-encode if needed: `ffmpeg -i raw.mp4 -c:v libx264 -crf 23 -preset slow final.mp4`)
- [ ] Audio clear throughout
- [ ] All 4 demo flows visible and complete
- [ ] All 6 diagrams shown on screen (not just mentioned)
