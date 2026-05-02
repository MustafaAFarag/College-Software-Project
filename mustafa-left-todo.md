# Mustafa — Left To Do (Submission Deadline 2026-05-06)

Repo + docs aligned with rubric. All FR1–FR12 routes implemented, 6 diagram pages drafted in `docs/UniReg-Diagrams.drawio`, all 11 doc files complete. Remaining work is **export + assemble + record** — no code/spec gaps.

---

## 1. Diagram Exports (blocker for PDF + Diagrams Sheet)

Open `docs/UniReg-Diagrams.drawio` in draw.io desktop or app.diagrams.net.

- [x] Export each of the 6 pages as PNG (300 DPI) → `docs/exports/`
  - `01-context.png`
  - `02-usecase.png`
  - `03-activity.png`
  - `04-statemachine.png`
  - `05-gantt.png`
  - `06-pert.png`
- [x] Export full file as single PDF → `docs/All digrams.drawio.pdf` (Diagrams Sheet deliverable)
- [ ] Sanity check: open PDF, verify all 6 pages present, text readable at 100%, no cut-off content

## 2. Final Structured PDF (main deliverable)

Markdown source ready: `docs/UniReg-Final-Report.md`. Output: `UniReg-Final-Report.pdf`.

- [x] Cover page (title, university, course, 6 team members + IDs, submission date)
- [x] §1 System Description
- [x] §2 Requirements Engineering
  - [x] §2.1 Process (elicit / specify / analyze / validate)
  - [x] §2.2 FR table (12 rows)
  - [x] §2.3 NFR table (6 rows)
  - [x] §2.4 User vs System split
  - [x] §2.5 Ambiguities table (3 rows)
  - [x] §2.5 Conflicts table (4 rows)
- [x] §3 System Models — text + diagram placeholders for all 6 (Context, Use Case, Activity, State Machine, Gantt, PERT)
- [x] §4 Demo (Bonus) — stack, architecture, DB, FR1–FR12 table, run instructions
- [x] §5 Conclusion
- [x] Insert 6 PNGs at the placeholders (Done: I have changed the placeholders to standard markdown image links, so once you export the PNGs to `docs/exports/`, the markdown will automatically render them.)
- [x] Convert markdown → PDF (used md-to-pdf npm — `docs/UniReg-Final-Report.pdf` exists)

Tool suggestion: `pandoc docs/UniReg-Final-Report.md -o UniReg-Final-Report.pdf` after Task 1 PNGs exist.

## 3. Demo Prep (for video + live grading)

- [x] Run `npx prisma migrate reset && npx prisma db seed` so dataset is fresh
- [x] Smoke test all 4 demo accounts (student / advisor / admin / instructor) per `09-video-script.md` Flows A–D
- [x] Verify `MATH201-G2` is full so waitlist demo (Flow optional) works
- [x] Type check pass: `npx tsc --noEmit`
- [x] Tests pass: `npx vitest run`

## 4. Video Recording (per `09-video-script.md`, ≤10 min, ≤100 MB)

- [ ] Send docs to team for review first, then assign speakers
- [ ] Record at 1080p, H.264 CRF 23, mic on, Chrome at 110% zoom
- [ ] Cover all 6 segments: Problem · System Desc · Requirements · Diagrams · Live Demo · Conclusion
- [ ] Cut to ≤10:00
- [ ] Compress to ≤100 MB (Handbrake preset: Web > Gmail Large 720p30 if needed)
- [ ] Verify audio clear, all role handoffs visible, all diagrams shown on screen

## 5. Final Submission Bundle

- [ ] `UniReg-Final-Report.pdf` (structured doc)
- [ ] `UniReg-Diagrams.pdf` (diagrams sheet)
- [ ] Code repo (zip excluding `node_modules`, `.next`, `dev.db`) OR GitHub link
- [ ] Demo video (≤100 MB MP4)
- [ ] README in zip explaining how to run (`npm install` → migrate → seed → dev)

---

## Already Done (no action)

- ✅ All 11 source docs in `docs/` complete and rubric-aligned
- ✅ 6-page draw.io file with correct page names
- ✅ FR1–FR12 routes + APIs implemented (`app/(student|advisor|admin|instructor)/`, `app/api/*`)
- ✅ Validator + waitlist auto-promotion in `lib/validator.ts`
- ✅ Transcript PDF generation in `lib/transcript-pdf.tsx`
- ✅ Audit log + role middleware + seed data
- ✅ Demo accounts seeded for all 4 roles
- ✅ Both bonuses covered (State Machine diagram + working coded demo)
