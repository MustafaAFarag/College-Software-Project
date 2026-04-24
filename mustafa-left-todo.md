# Mustafa Left To Do

This file lists only the manual steps left before final submission.

## 1. Finalize the diagrams

- Open `docs/UniReg-Diagrams.drawio`.
- Confirm it has exactly 6 pages:
  - Context Diagram
  - Use Case Diagram
  - Activity Diagram
  - State Machine Diagram
  - Gantt Chart
  - PERT Diagram
- Make sure the actor names match the report:
  - Student
  - Academic Advisor
  - Admin / Registrar
  - Instructor
- Make sure the state machine uses the demo states only:
  - ENROLLED
  - WAITLISTED
  - DROPPED
  - COMPLETED
- Export each page as PNG.
- Export the full file as the diagrams sheet PDF.

## 2. Assemble the final PDF

Use this order:

1. Cover page
2. System Description
3. Requirements Engineering Process
4. Functional and Non-Functional Requirements
5. User vs System Requirements
6. Ambiguities and Conflicts
7. System Models
8. System Demo summary
9. Conclusion

Use these source files:

- `docs/01-project-overview.md`
- `docs/10-requirements-matrix.md`
- `docs/07-diagrams-guide.md`
- `docs/08-pdf-document-structure.md`
- `docs/02-tech-stack.md`
- `docs/03-database-schema.md`
- `docs/04-features-prd.md`
- `docs/05-api-routes.md`

## 3. Build the cover page

Put exactly this team list on the cover:

- Mostafa Ashraf Saad - 23012069
- Youssef Sherif Mohamed Samir - 23011187
- Mohaimen Hany Mohamed - 23011572
- Albert Atef Shafik - 23011225
- Mohamed Salama Mohamed Ali El-Gebaly - 23011134
- Ahmed Salem El-Saeed - 22010019

Also include:

- UniReg - University Course Registration System
- Alexandria University
- Requirements Engineering and System Modeling
- Submission date ( don't include it )

## 4. Keep the PDF aligned with the real demo

When writing the demo section, use the current seeded story:

1. Student logs in and already has a current schedule.
2. Student registers `CS301-G1`.
3. Student attempts `CS401-G1` and gets blocked.
4. Student submits an override request.
5. Advisor approves it.
6. Admin dashboard shows the new activity.
7. Student retries and succeeds.
8. Instructor roster shows the updated student list.

## 5. Record the video

- Use `docs/09-video-script.md`.
- Keep it under 10 minutes.
- Keep the final exported file under 100 MB.
- Make sure the handoff between student, advisor, admin, and instructor is visible.

## 6. Final submission check

Before submitting, confirm:

- The PDF uses the same terminology as the diagrams.
- Every diagram shown in the PDF matches the final `.drawio` export.
- The FR/NFR counts stay inside the required range.
- The report explicitly explains why each model is used and how the models connect.
- The video matches the seeded demo state.
- The app still runs with the seeded accounts:
  - `student@alex.edu`
  - `advisor@alex.edu`
  - `instructor@alex.edu`
  - `admin@alex.edu`
- Password for all demo accounts: `demo1234`
