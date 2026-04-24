# Database Schema

## Prisma Schema (source of truth)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(STUDENT)
  studentId    String?  @unique   // university ID number
  department   String?

  enrollments      Enrollment[]
  overrideRequests OverrideRequest[] @relation("StudentOverrides")
  advisedOverrides OverrideRequest[] @relation("AdvisorOverrides")
  taughtSections   Section[]
  auditActions     AuditLog[]

  createdAt DateTime @default(now())
}

enum Role {
  STUDENT
  ADVISOR
  ADMIN
  INSTRUCTOR
}

model Term {
  id             String   @id @default(cuid())
  code           String   @unique   // e.g. "2024-SPRING"
  label          String             // e.g. "Spring 2024"
  startDate      DateTime
  endDate        DateTime
  regOpensAt     DateTime
  regClosesAt    DateTime
  dropClosesAt   DateTime
  isActive       Boolean  @default(false)

  sections Section[]
}

model Department {
  id      String   @id @default(cuid())
  code    String   @unique   // e.g. "CS"
  name    String             // e.g. "Computer Science"

  courses Course[]
}

model Course {
  id           String  @id @default(cuid())
  code         String  @unique   // e.g. "CS301"
  title        String            // e.g. "Data Structures"
  creditHours  Int
  level        Int               // 100, 200, 300, 400 (year level)
  departmentId String

  department    Department        @relation(fields: [departmentId], references: [id])
  sections      Section[]
  prerequisites Prerequisite[]    @relation("CoursePrereqs")
  requiredBy    Prerequisite[]    @relation("RequiredFor")
}

model Prerequisite {
  courseId         String
  requiredCourseId String

  course         Course @relation("CoursePrereqs",  fields: [courseId],         references: [id])
  requiredCourse Course @relation("RequiredFor",    fields: [requiredCourseId], references: [id])

  @@id([courseId, requiredCourseId])
}

model Section {
  id           String  @id @default(cuid())
  courseId     String
  termId       String
  instructorId String?
  capacity     Int
  // JSON: [{ day: "MON", startTime: "09:00", endTime: "10:30", room: "B201" }, ...]
  scheduleJson String

  course      Course  @relation(fields: [courseId],     references: [id])
  term        Term    @relation(fields: [termId],        references: [id])
  instructor  User?   @relation(fields: [instructorId],  references: [id])

  enrollments     Enrollment[]
  overrideRequests OverrideRequest[]
}

model Enrollment {
  id          String           @id @default(cuid())
  studentId   String
  sectionId   String
  state       EnrollmentState  @default(PENDING)
  waitlistPos Int?             // null unless WAITLISTED
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  student  User    @relation(fields: [studentId],  references: [id])
  section  Section @relation(fields: [sectionId],  references: [id])
  auditLog AuditLog[]

  @@unique([studentId, sectionId])
}

enum EnrollmentState {
  PENDING      // submitted, validating
  ENROLLED     // confirmed
  WAITLISTED   // section full; holds queue position
  DROPPED      // student dropped
  COMPLETED    // term ended, grade recorded
  CANCELLED    // admin cancelled
}

model OverrideRequest {
  id         String         @id @default(cuid())
  studentId  String
  sectionId  String
  reason     String
  status     OverrideStatus @default(PENDING)
  advisorId  String?
  decidedAt  DateTime?
  createdAt  DateTime       @default(now())

  student  User    @relation("StudentOverrides", fields: [studentId], references: [id])
  advisor  User?   @relation("AdvisorOverrides", fields: [advisorId], references: [id])
  section  Section @relation(fields: [sectionId], references: [id])
}

enum OverrideStatus {
  PENDING
  APPROVED
  REJECTED
}

model AuditLog {
  id           String   @id @default(cuid())
  enrollmentId String?
  actorId      String
  fromState    String?
  toState      String
  action       String   // e.g. "ENROLL", "DROP", "WAITLIST", "PROMOTE", "OVERRIDE_APPROVE"
  metaJson     String?  // extra context as JSON string
  at           DateTime @default(now())

  enrollment Enrollment? @relation(fields: [enrollmentId], references: [id])
  actor      User        @relation(fields: [actorId],      references: [id])
}
```

## Entity-Relationship Summary

```
User ──< Enrollment >── Section ──< Prerequisite
                           │
                          Term
                           │
                         Course ──< Prerequisite
                           │
                       Department

User ──< OverrideRequest >── Section
User (advisor) ──< OverrideRequest

Enrollment ──< AuditLog >── User (actor)
```

## Credit-Hour Rules (enforced by validator)

| Rule | Value |
|------|-------|
| Min credit hours per term | 12 |
| Max credit hours per term (normal) | 18 |
| Max credit hours per term (with override) | 21 |

These are constants in `lib/validator.ts`.

## Seed Data Plan

Seed script creates:
- **4 demo users:** `student@alex.edu` (STUDENT), `advisor@alex.edu` (ADVISOR), `instructor@alex.edu` (INSTRUCTOR), `admin@alex.edu` (ADMIN) — all password `demo1234`
- **1 department:** CS
- **10 courses:** CS101, CS102, CS201, CS202, CS301, CS302, CS401, CS402, MATH101, MATH201
- **Prerequisites:** CS201 requires CS101; CS301 requires CS201; CS302 requires CS201; CS401 requires CS301
- **1 active term:** Spring 2025, registration window open
- **2 sections per course** (20 seats each, varied schedules to create time-conflict test cases)
- **1 section deliberately full** (to demo waitlist flow)
- **Student already passed CS101** (enrollment state COMPLETED) to demo prereq satisfaction
