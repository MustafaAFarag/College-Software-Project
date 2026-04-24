# Final PDF Document Structure

Use this outline when assembling the submitted report.

## Cover Page

- Project title
- University and course name
- Team member names and student IDs
- Submission date

## 1. System Description

- Project title
- Problem description
- System objectives
- Stakeholders
- Work breakdown structure

Source: `01-project-overview.md`

## 2. Requirements Engineering

### 2.1 Requirements Engineering Process

Write one short subsection for each step:

- Elicitation: identify stakeholders and collect the main system needs.
- Specification: convert the collected needs into FRs, NFRs, and user/system requirements.
- Analysis: resolve ambiguities and conflicts discovered in the case study.
- Validation: confirm that the final requirements match the models and the coded demo.

### 2.2 Requirement Tables

- Functional requirements table
- Non-functional requirements table
- User vs system requirement split
- Ambiguities found
- Conflicts found

Source: `10-requirements-matrix.md`

## 3. System Models

For each model, include:

- The diagram image
- Why this model is used
- How it connects to the other models

### 3.1 Context Diagram
- Explain the system boundary and actor data flows.

### 3.2 Use Case Diagram
- Explain actor responsibilities and the `include` / `extend` relationships.

### 3.3 Activity Diagram
- Explain the registration and drop/promote flows.

### 3.4 State Machine Diagram (Bonus)
- Explain the enrollment lifecycle used in the demo.

### 3.5 Gantt Chart
- Explain project scheduling and ownership.

### 3.6 PERT Diagram
- Explain the critical path and slack.

Source: `07-diagrams-guide.md`

## 4. System Demo (Bonus)

- Tech stack summary
- Architecture and repository structure
- Database schema summary
- Feature walkthrough for FR1-FR12
- Supplemental instructor roster feature
- Demo scope limits
- How to run the project

Sources: `02-tech-stack.md`, `03-database-schema.md`, `04-features-prd.md`, `05-api-routes.md`

## 5. Conclusion

- Confirm the completed deliverables
- Summarize the main design tradeoffs
- List realistic future improvements

## Formatting Notes

- Use visible table borders.
- Caption every figure.
- Keep terminology consistent with the repository and diagrams.
- Do not claim features that are not present in the demo.
- Keep the final PDF aligned with the current seeded workflow and the recorded video.
