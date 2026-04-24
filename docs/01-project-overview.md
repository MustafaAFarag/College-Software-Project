# UniReg - Project Overview

## Project Identity

| Field | Value |
|-------|-------|
| Title | UniReg - University Course Registration System |
| University | Alexandria University, Egypt |
| Course | Requirements Engineering and System Modeling |
| Team Size | 6 Students |

## Team Members

| Name | Student ID |
|------|------------|
| Mostafa Ashraf Saad | 23012069 |
| Youssef Sherif Mohamed Samir | 23011187 |
| Mohaimen Hany Mohamed | 23011572 |
| Albert Atef Shafik | 23011225 |
| Mohamed Salama Mohamed Ali El-Gebaly | 23011134 |
| Ahmed Salem El-Saeed | 22010019 |

## Problem Statement

Students at Alexandria University face a fragmented registration process where time clashes, prerequisite violations, and full sections are handled inconsistently. UniReg solves this with a role-aware web system that applies registration rules automatically and gives each stakeholder a clear interface.

## System Objectives

1. Allow students to register and drop courses within an active registration window.
2. Enforce prerequisites, time conflicts, credit-hour limits, and section capacity.
3. Support FIFO waitlisting with automatic promotion when a seat becomes free.
4. Provide an advisor override workflow for blocked registrations.
5. Allow admins to manage terms, courses, sections, schedules, and registration windows.
6. Maintain transparent enrollment history, transcripts, and audit records.

## Stakeholders

| Stakeholder | Role | Interaction |
|-------------|------|-------------|
| Student | Primary user | Browse, register, drop, waitlist, request override, view transcript |
| Academic Advisor | Secondary user | Review and approve or reject override requests |
| Admin / Registrar | Secondary user | Manage terms, courses, sections, schedules, and audit logs |
| Instructor | Supporting user | View assigned section rosters |
| IT Support | Indirect | Maintain deployment and environment setup |

## Work Breakdown Structure (WBS)

```text
UniReg Project
|-- 1. Project Management
|   |-- 1.1 Planning and scheduling
|   |-- 1.2 Task tracking
|   `-- 1.3 Team coordination
|-- 2. Requirements Engineering
|   |-- 2.1 Elicitation
|   |-- 2.2 Specification
|   `-- 2.3 Analysis and validation
|-- 3. System Modeling
|   |-- 3.1 Context Diagram
|   |-- 3.2 Use Case Diagram
|   |-- 3.3 Activity Diagram
|   |-- 3.4 State Machine Diagram
|   |-- 3.5 Gantt Chart
|   `-- 3.6 PERT Diagram
|-- 4. System Design
|   |-- 4.1 Architecture
|   |-- 4.2 Database schema
|   `-- 4.3 Interface design
|-- 5. Implementation
|   |-- 5.1 Authentication and role routing
|   |-- 5.2 Student registration flow
|   |-- 5.3 Waitlist and drop flow
|   |-- 5.4 Advisor override workflow
|   |-- 5.5 Admin management features
|   `-- 5.6 Transcript and audit log
|-- 6. Testing
|   |-- 6.1 Validator tests
|   `-- 6.2 Demo smoke tests
|-- 7. Documentation
|   |-- 7.1 Final report assembly
|   `-- 7.2 Diagram exports
`-- 8. Demo and Video
    |-- 8.1 Demo seed preparation
    `-- 8.2 Final video recording
```
