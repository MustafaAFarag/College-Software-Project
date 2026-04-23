# UniReg — Documentation Index

> University Course Registration System | Alexandria University | Software Engineering Final Project

## How to use this folder

All docs here are for **team reference and AI follow-along**. They are NOT submitted as-is. The final PDF is assembled from these + the actual diagrams + the working demo.

---

## Files

| File | Contents | Use when |
|------|----------|----------|
| [01-project-overview.md](01-project-overview.md) | Title, problem, objectives, stakeholders, WBS, deliverables checklist | Writing system description section of PDF |
| [02-tech-stack.md](02-tech-stack.md) | Stack decisions, repo structure, env vars, architectural decisions | Starting the Next.js project; answering "why this stack" in PDF |
| [03-database-schema.md](03-database-schema.md) | Full Prisma schema, ER summary, credit-hour rules, seed plan | Creating `prisma/schema.prisma` and `seed.ts` |
| [04-features-prd.md](04-features-prd.md) | Feature specs per role (F1–F12), out-of-scope list | Building each page/feature in Next.js |
| [05-api-routes.md](05-api-routes.md) | All API endpoints, request/response shapes, auth requirements | Building `app/api/` routes |
| [06-validator-logic.md](06-validator-logic.md) | Check order, function signatures, time-overlap logic, waitlist promote | Building `lib/validator.ts` |
| [07-diagrams-guide.md](07-diagrams-guide.md) | Complete spec for all 6 diagrams: elements, relationships, purpose text | Drawing in draw.io; writing model-explanation section of PDF |
| [08-pdf-document-structure.md](08-pdf-document-structure.md) | Full PDF outline with section headings, content sources, formatting rules | Assembling the final PDF in Word/Google Docs |
| [09-video-script.md](09-video-script.md) | Segment breakdown, speaker notes, 4 demo flows, export checklist | Recording the video |

---

## Build Order

```
Requirements + Diagrams track        Dev track
─────────────────────────            ─────────────────────────
01 → 07 → 08                         02 → 03 → 04 → 05 → 06
                  ↘               ↙
                   09 (video — last)
```

---

## Spec Requirements Mapping

| Spec item | Covered in |
|-----------|-----------|
| Project Title | 01 §1 |
| Problem Description | 01 §2 |
| System Objectives | 01 §3 |
| Stakeholders | 01 §4 |
| WBS | 01 §5 |
| FR (10–12) | 01 (plan), 08 §2.1 |
| NFR (5–7) | 01 (plan), 08 §2.2 |
| User vs System Requirements | 08 §2.1–2.2 (Type column) |
| Ambiguity & Conflicts | 08 §2.3 |
| Context Diagram | 07 §Page 1 |
| Use Case Diagram | 07 §Page 2 |
| Activity Diagram | 07 §Page 3 |
| Gantt Chart | 07 §Page 5 |
| PERT Diagram | 07 §Page 6 |
| State Machine (Bonus 1) | 07 §Page 4 |
| Why each model + how they connect | 08 §3.1–3.6 |
| Working Demo (Bonus 2) | 02, 03, 04, 05, 06 |
| Diagrams Sheet | 07 (export checklist) |
| Full PDF | 08 |
| Video ≤10 min / ≤100 MB | 09 |
