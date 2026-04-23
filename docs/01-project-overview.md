# UniReg — Project Overview

## Project Identity

| Field | Value |
|-------|-------|
| Title | UniReg — University Course Registration System |
| University | Alexandria University, Egypt |
| Course | Software Engineering Final Project |
| Team size | 3 (growing to 5–7) |
| Sprint | 1–2 days |

## Problem Statement

Students at Alexandria University face manual/fragmented course registration: time clashes go undetected, prerequisite violations happen without enforcement, sections overfill, add/drop is unfair, and advisors have no oversight tooling. UniReg solves this with a web-based system that enforces all constraints automatically and gives each stakeholder a clear interface.

## System Objectives

1. Students register and drop courses within an open registration window.
2. System auto-enforces prerequisites, time conflicts, credit-hour caps, and section capacity.
3. Waitlist with FIFO auto-promotion when a seat frees.
4. Advisor approval workflow for override requests (prereq waiver, credit overload).
5. Admin manages terms, courses, sections, schedules, and opens/closes registration windows.
6. Transparent enrollment history and unofficial transcript generation.

## Stakeholders

| Stakeholder | Role | Interaction |
|-------------|------|-------------|
| Student | Primary user | Browse, register, drop, waitlist, override request, transcript |
| Academic Advisor | Secondary user | Review + approve/reject override requests |
| Department Admin / Registrar | Secondary user | Manage terms, courses, sections, windows |
| Instructor | Read-only | View roster for assigned sections |
| System Admin | Technical | User management, system health |
| Dean | Indirect | Aggregate reports (out of demo scope) |
| IT Support | Indirect | Deployment, maintenance |

## WBS (Work Breakdown Structure)

```
UniReg Project
├── 1. Project Management
│   ├── 1.1 Planning & scheduling
│   ├── 1.2 Task tracking
│   └── 1.3 Team coordination
├── 2. Requirements Engineering
│   ├── 2.1 Elicitation (stakeholder analysis)
│   ├── 2.2 Specification (FR + NFR, user/system)
│   └── 2.3 Analysis (ambiguity + conflicts)
├── 3. System Modeling
│   ├── 3.1 Context Diagram
│   ├── 3.2 Use Case Diagram
│   ├── 3.3 Activity Diagram(s)
│   ├── 3.4 State Machine Diagram (Bonus 1)
│   ├── 3.5 Gantt Chart
│   └── 3.6 PERT Diagram
├── 4. Design
│   ├── 4.1 Architecture (Next.js full-stack)
│   ├── 4.2 Database schema
│   └── 4.3 UI wireframes (rough)
├── 5. Implementation (Bonus 2)
│   ├── 5.1 Auth + role routing
│   ├── 5.2 Course browse
│   ├── 5.3 Registration validator
│   ├── 5.4 Enroll / drop / waitlist
│   ├── 5.5 Override workflow
│   ├── 5.6 Admin panel
│   └── 5.7 Transcript + audit log
├── 6. Testing
│   ├── 6.1 Validator unit tests
│   └── 6.2 End-to-end smoke test flows
├── 7. Documentation
│   ├── 7.1 Final PDF assembly
│   └── 7.2 Diagrams sheet export
└── 8. Demo + Video
    ├── 8.1 Seed demo data
    └── 8.2 Record ≤10 min / ≤100 MB video
```

## Deliverables Checklist

- [ ] Diagrams Sheet (A3/A2, all 6 diagrams, draw.io export)
- [ ] Full Structured Document PDF
  - [ ] System Description (title, problem, objectives, stakeholders, WBS)
  - [ ] Requirements (FR×12, NFR×6, user/system split, ambiguity/conflicts)
  - [ ] Model explanations (why each + how they connect)
  - [ ] All 6 diagrams embedded
- [ ] Coding Demo (working web app)
- [ ] Video ≤10 min, ≤100 MB (problem → diagrams → demo flows → close)
