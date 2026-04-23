# Final PDF Document Structure

This is the outline for the full structured document deliverable (PDF). Write each section in Google Docs or Word, export to PDF.

---

## Document Outline

### Cover Page
- Project Title: UniReg — University Course Registration System
- Course: Software Engineering
- University: Alexandria University
- Team members (names + IDs)
- Date

### Table of Contents (auto-generated)

---

### 1. System Description

#### 1.1 Project Title
UniReg — University Course Registration System

#### 1.2 Problem Description
(2–3 paragraphs)
- Current pain: students face time clashes, prerequisite violations, over-capacity sections, unfair add/drop, no advisor oversight tooling.
- Impact: student frustration, administrative overhead, potential academic policy violations.
- Need: automated, role-aware web system to enforce all constraints and provide transparent enrollment history.

#### 1.3 System Objectives
(numbered list — copy from 01-project-overview.md)

#### 1.4 Stakeholders
(table — copy from 01-project-overview.md)

#### 1.5 Work Breakdown Structure (WBS)
(tree diagram or indented list — copy from 01-project-overview.md)

---

### 2. Requirements Engineering

#### 2.1 Functional Requirements
Table with columns: ID | Requirement Description | Type (User/System)
(12 rows — source from plan)

Note at top: "User requirements describe what users want. System requirements describe how the system fulfills them. Both written for each functional area."

#### 2.2 Non-Functional Requirements
Table with columns: ID | Requirement Description | Type (User/System) | Category
(6 rows — source from plan)

#### 2.3 Requirements Analysis

##### 2.3.1 Ambiguities Found
For each ambiguity: ID | Original Vague Statement | Resolved Form | Resolution Method

| ID | Vague | Resolved | How |
|----|-------|----------|-----|
| A1 | "Student can register for any available course" | Available = seat exists + prereq passed + no time conflict + within credit cap | Decomposed into explicit validator checks |
| A2 | "Students may drop courses" | Drop allowed only within drop window; no financial/refund semantics in scope | Explicit scope boundary |
| A3 | "System should respond fast" | Response ≤ 2s under 200 concurrent users | Quantified in NFR1 |

##### 2.3.2 Conflicts Found

| ID | Conflict | Resolution |
|----|----------|------------|
| C1 | FR5 (strict prereq) vs FR9 (advisor override) | Override is an authenticated exception logged in audit (FR12); does not bypass security |
| C2 | FR5 (capacity cap) vs FR7 (waitlist auto-promote) | Promote only when seat frees AND re-validation passes (student's current credit/time state rechecked) |
| C3 | NFR6 (Arabic localization) vs 2-day sprint | Deferred: English-first, Arabic labels for key nav only; documented explicitly |
| C4 | FIFO waitlist (FR6) vs priority by academic year | FIFO chosen for simplicity and fairness; priority scheduling documented as future enhancement |

---

### 3. System Models

#### 3.1 Context Diagram
[Embed PNG]

**Why used:** DFD Level 0 establishes the system boundary and identifies all external entities and data flows without exposing internal structure. Foundational document — every FR maps to at least one arrow.

**How it connects:** Defines the actors that appear in the Use Case Diagram. Data flows become inputs/outputs of use cases and activities.

#### 3.2 Use Case Diagram
[Embed PNG]

**Why used:** UML Use Case captures the functional scope from each actor's perspective. `<<include>>` shows mandatory sub-behavior; `<<extend>>` shows optional triggered paths.

**How it connects:** Each use case expands into one or more activity flows. Use cases map 1-to-1 with FR1–FR12.

#### 3.3 Activity Diagram
[Embed PNG — show both flows: Register + Drop/Promote]

**Why used:** Activity diagrams with decision nodes show the exact execution logic, branching, and parallelism inside each use case. Swimlanes clarify responsibility (student vs system).

**How it connects:** Decision nodes implement FR5 (validation), FR6 (waitlist), FR7 (promote), FR8 (drop), FR9 (override). States reached become inputs to the State Machine.

#### 3.4 State Machine Diagram *(Bonus 1)*
[Embed PNG]

**Why used:** Models the full lifecycle of the `Enrollment` entity — the core data artifact the system manages. Each transition corresponds to an AuditLog entry (FR12). Ensures no invalid state is reachable.

**How it connects:** States (`ENROLLED`, `WAITLISTED`, `DROPPED`, `COMPLETED`, `CANCELLED`) are the exact enum values in the database schema. Transitions are triggered by activity-diagram paths.

#### 3.5 Gantt Chart
[Embed PNG]

**Why used:** Visualizes project schedule with task dependencies and team ownership. Enables proactive identification of delays.

**How it connects:** Task list derived from WBS (Section 1.5). Dependency arrows align with PERT critical path.

#### 3.6 PERT Diagram
[Embed PNG]

**Why used:** Identifies critical path and slack per task. Confirms which tasks cannot be delayed without pushing the final deliverable.

**How it connects:** Same task set as Gantt. Critical path (Elicitation → Spec → Activity Diagram → State Machine → PDF → Video) highlighted. Non-critical tasks (Context Diagram, Gantt itself) shown with slack.

---

### 4. System Demo *(Bonus 2)*

#### 4.1 Tech Stack Summary
(one-page table — source from 02-tech-stack.md)

#### 4.2 System Architecture
(brief description + repo structure tree)

#### 4.3 Database Schema
(ER diagram or Prisma schema listing)

#### 4.4 Key Features Demonstrated
(bullet list matching F1–F12 from features PRD)

#### 4.5 Demo Scope & Limitations
(out-of-scope items — email, grades, refunds, Arabic full UI, SSO)

#### 4.6 How to Run
```bash
git clone <repo>
cd unireg
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
# Open http://localhost:3000
# Demo accounts: student@alex.edu / advisor@alex.edu / admin@alex.edu (password: demo1234)
```

---

### 5. Conclusion
- Project achieved all mandatory deliverables + both bonuses.
- Core insight: requirement conflicts (prereq vs override, capacity vs waitlist) drove the most important design decisions.
- Future work: priority-based waitlist, email notifications, Arabic UI, SSO integration, grade entry.

---

### References
- IEEE 830 Software Requirements Specification standard
- Sommerville, I. — Software Engineering, 10th ed.
- Next.js 15 documentation
- Prisma ORM documentation

---

## Formatting Notes

- Font: Times New Roman 12pt body, 14pt section headers, 16pt chapter headers.
- Page margins: 2.5 cm all sides.
- Page numbers: bottom center.
- Table borders: visible.
- Code snippets: Courier New 10pt, grey background.
- Diagrams: centered, captioned ("Figure X: Diagram Name"), 80% page width max.
- Total target length: 25–40 pages including diagrams.
