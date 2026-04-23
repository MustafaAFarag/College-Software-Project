# Tech Stack & Architecture

## Stack Decisions

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 (App Router) | Single repo full-stack: frontend + API routes. No separate backend. |
| Language | TypeScript | Type safety on schema + validator logic. |
| Database | SQLite via Prisma ORM | Zero-config, file-based, ships with repo. Prisma handles migrations + type-safe queries. |
| Auth | NextAuth.js v5 (credentials provider) | Minimal setup. Role stored in session. |
| UI | Tailwind CSS + shadcn/ui | Clean components, zero design effort. |
| Validation | Zod | Schema validation on API inputs. |
| PDF | @react-pdf/renderer | Transcript PDF generation server-side. |
| Testing | Vitest | Unit tests for the validator module. |
| Diagrams | draw.io | All 6 diagrams in one master file, one page each, same stencil set. |

## Repository Structure

```
unireg/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (student)/
│   │   ├── dashboard/page.tsx
│   │   ├── courses/page.tsx          ← browse + register
│   │   ├── schedule/page.tsx         ← weekly grid
│   │   ├── transcript/page.tsx       ← PDF download
│   │   └── overrides/page.tsx        ← submit override request
│   ├── (advisor)/
│   │   └── overrides/page.tsx        ← approve/reject inbox
│   ├── (admin)/
│   │   ├── dashboard/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── sections/page.tsx
│   │   └── audit/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── enrollments/
│   │   │   ├── route.ts              ← POST enroll, GET my enrollments
│   │   │   └── [id]/
│   │   │       └── route.ts          ← PATCH drop
│   │   ├── overrides/
│   │   │   ├── route.ts              ← POST create request
│   │   │   └── [id]/route.ts         ← PATCH approve/reject
│   │   ├── sections/route.ts         ← GET (browse with filters)
│   │   ├── transcript/route.ts       ← GET PDF
│   │   └── admin/
│   │       ├── terms/route.ts
│   │       ├── courses/route.ts
│   │       └── sections/route.ts
│   └── layout.tsx
├── components/
│   ├── CourseCard.tsx
│   ├── ScheduleGrid.tsx
│   ├── OverrideInbox.tsx
│   └── AuditLogTable.tsx
├── lib/
│   ├── validator.ts                  ← core: prereq / time / capacity / credit-cap checks
│   ├── auth.ts                       ← NextAuth config
│   ├── db.ts                         ← Prisma client singleton
│   └── pdf.tsx                       ← react-pdf transcript template
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   └── validator.test.ts
├── docs/                             ← this folder
├── .env.local
└── package.json
```

## Environment Variables

```env
# .env.local
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="replace-with-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"
```

## Key Architectural Decisions

### Validator as pure function
`lib/validator.ts` exports `validateEnrollment(studentId, sectionId, db)` → `{ ok: true } | { ok: false, reason: string }`. Pure, no side effects. Tested in isolation. Called by both enroll endpoint and UI for instant feedback.

### Atomic transactions
Every enrollment state change writes `Enrollment` + `AuditLog` in a single `prisma.$transaction([...])`. No partial state.

### Role-based routing
NextAuth session includes `role`. Middleware in `middleware.ts` redirects unauthorized roles away from `/student/*`, `/advisor/*`, `/admin/*`.

### Waitlist auto-promote
On drop: same transaction that sets enrollment to `DROPPED` scans for `WAITLISTED` enrollment with lowest `waitlistPos` for that section, re-runs validator (checks new time/credit state for that student), promotes if valid. No background job needed for demo.
