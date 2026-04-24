# Requirements Matrix

## Functional Requirements

| ID | Requirement | Type |
|----|-------------|------|
| FR1 | Students shall sign in with demo credentials and reach a role-specific dashboard. | User |
| FR2 | Students shall browse available sections by department, level, day, and seat availability. | User |
| FR3 | The system shall let a student enroll in a section when registration rules pass. | System |
| FR4 | The system shall validate registration window, duplicate enrollment, prerequisites, time conflicts, and credit-hour cap before confirming enrollment. | System |
| FR5 | The system shall place students on a FIFO waitlist when a section is full and auto-promote the next valid student when a seat opens. | System |
| FR6 | Students shall view their schedule, current enrollments, and waitlisted sections. | User |
| FR7 | Students shall drop enrolled sections before the drop deadline. | User |
| FR8 | Students shall submit override requests and review their status history. | User |
| FR9 | Advisors shall review pending override requests and approve or reject them. | User |
| FR10 | Admins shall create and edit academic terms, including registration and drop windows. | User |
| FR11 | Admins shall create and edit courses, prerequisites, and sections, including instructor assignment. | User |
| FR12 | The system shall generate transcript PDFs and maintain an audit trail for enrollment and override actions. | System |

## Non-Functional Requirements

| ID | Requirement | Type | Category |
|----|-------------|------|----------|
| NFR1 | Core demo actions should respond within 2 seconds under classroom demo load. | User | Performance |
| NFR2 | Role-based authorization shall prevent cross-role access to protected routes. | System | Security |
| NFR3 | Validation and audit behavior shall be deterministic for the same inputs. | System | Reliability |
| NFR4 | The UI shall remain usable on laptop and mobile-width screens used in the demo. | User | Usability |
| NFR5 | Shared rules shall be centralized in reusable modules to reduce maintenance overhead. | System | Maintainability |
| NFR6 | Setup shall stay lightweight through SQLite, Prisma migrations, and seeded local accounts. | System | Portability |

## Ambiguities Found

| ID | Original ambiguity | Resolved form | Resolution |
|----|--------------------|---------------|------------|
| A1 | "Students can register for available courses." | "Available" means open window, no duplicate enrollment, passed prerequisites, no clash, within credit cap, and seat or waitlist availability. | Converted to explicit validator checks. |
| A2 | "Students may drop courses." | Drop is allowed only before `dropClosesAt`; refund logic is outside scope. | Added a clear policy boundary. |
| A3 | "System should be fast." | Core actions target a 2-second response. | Converted into NFR1. |

## Conflicts Found

| ID | Conflict | Resolution |
|----|----------|------------|
| C1 | Strict prerequisite enforcement conflicts with advisor-approved exceptions. | Approved overrides bypass only the blocked rule and are logged. |
| C2 | Capacity enforcement conflicts with fair registration after a drop. | Waitlist promotion happens only after a seat frees and revalidation passes. |
| C3 | Broad enterprise integrations conflict with demo time limits. | SSO, email delivery, and deep registrar integrations are deferred. |
| C4 | The instructor roster could push the official FR count past the rubric. | It is implemented as a supplemental read-only feature and is not counted in FR1-FR12. |
