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
|-- 1. Project Initiation & Planning
|   |-- 1.1 Define project scope and objectives
|   |-- 1.2 Identify stakeholders
|   `-- 1.3 Project scheduling and risk management
|-- 2. Requirements Engineering
|   |-- 2.1 Stakeholder elicitation
|   |-- 2.2 Requirements specification (FRs & NFRs)
|   `-- 2.3 Requirements validation
|-- 3. System Design
|   |-- 3.1 Architectural design
|   |-- 3.2 Database schema design
|   |-- 3.3 UI/UX wireframing
|   `-- 3.4 System Modeling (UML Diagrams)
|-- 4. System Implementation
|   |-- 4.1 Database setup and migrations
|   |-- 4.2 Core Validator Logic & Backend APIs
|   |-- 4.3 Student Portal (Registration, Schedule)
|   |-- 4.4 Admin & Advisor Portals
|   `-- 4.5 Waitlist engine & Audit logging
|-- 5. Testing & Quality Assurance
|   |-- 5.1 Unit testing (Registration rules)
|   |-- 5.2 System integration testing
|   `-- 5.3 User Acceptance Testing (UAT)
`-- 6. Deployment & Handover
    |-- 6.1 Production deployment
    |-- 6.2 User manuals & documentation
    `-- 6.3 Stakeholder training
```
