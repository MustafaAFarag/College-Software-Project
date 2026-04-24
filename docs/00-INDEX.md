# UniReg - Documentation Index

> University Course Registration System | Alexandria University | Software Engineering Final Project

## How to use this folder

These files are the maintained source for the final college submission. The PDF, diagrams sheet, demo, and video should all reflect the current repository state.

## Files

| File | Contents | Use when |
|------|----------|----------|
| [01-project-overview.md](01-project-overview.md) | Title, team roster, problem, objectives, stakeholders, and WBS | Writing the system description section |
| [02-tech-stack.md](02-tech-stack.md) | Stack decisions, repo structure, environment setup, architectural notes | Explaining implementation choices |
| [03-database-schema.md](03-database-schema.md) | Prisma schema, ER summary, rules, and seed plan | Documenting persistence and data logic |
| [04-features-prd.md](04-features-prd.md) | Final feature scope by role | Aligning the demo with the requirements |
| [05-api-routes.md](05-api-routes.md) | Implemented API surface and payloads | Describing backend behavior |
| [06-validator-logic.md](06-validator-logic.md) | Enrollment decision order and waitlist promotion logic | Explaining the core rule engine |
| [07-diagrams-guide.md](07-diagrams-guide.md) | Diagram contents, purpose statements, and connections | Updating the draw.io file and PDF model section |
| [08-pdf-document-structure.md](08-pdf-document-structure.md) | Final PDF outline and assembly notes | Preparing the submitted report |
| [09-video-script.md](09-video-script.md) | Demo script and recording flow | Recording the final video |
| [10-requirements-matrix.md](10-requirements-matrix.md) | Final FR/NFR tables, user vs system split, ambiguities, and conflicts | Writing the requirements engineering section |

## Build Order

```text
Requirements + diagrams track        Demo track
01 -> 10 -> 07 -> 08                02 -> 03 -> 04 -> 05 -> 06
                         \          /
                          09 (video)
```

## Spec Requirements Mapping

| Spec item | Covered in |
|-----------|------------|
| Project Title | 01 |
| Problem Description | 01 |
| System Objectives | 01 |
| Stakeholders | 01 |
| WBS | 01 |
| Functional Requirements (10-12) | 10 |
| Non-Functional Requirements (5-7) | 10 |
| Requirements Engineering Process | 08 |
| User vs System Requirements | 10 |
| Requirements Analysis | 10 |
| Context Diagram | 07 Page 1 |
| Use Case Diagram | 07 Page 2 |
| Activity Diagram | 07 Page 3 |
| Gantt Chart | 07 Page 5 |
| PERT Diagram | 07 Page 6 |
| State Machine Diagram (Bonus) | 07 Page 4 |
| Why each model is used and how they connect | 07 and 08 |
| Working Demo | 02, 04, 05, 06 |
| Diagrams Sheet | 07 |
| Full Structured PDF | 08 |
| Video <= 10 min, <= 100 MB | 09 |
