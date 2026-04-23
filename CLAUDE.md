# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**UniReg** — University Course Registration System. Alexandria University Software Engineering final project. Full-stack web app (Next.js 15 + Prisma + SQLite). See [docs/00-INDEX.md](docs/00-INDEX.md) for the full doc map.

## Commands

```bash
# Install
npm install

# DB setup + seed
npx prisma migrate dev --name init
npx prisma db seed

# Dev server
npm run dev          # http://localhost:3000

# Type check
npx tsc --noEmit

# Tests (validator unit tests)
npx vitest run
npx vitest run tests/validator.test.ts   # single file

# Regenerate Prisma client after schema change
npx prisma generate
```

## Environment Variables

```env
# .env.local
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="replace-with-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"
```

## Architecture

**Stack:** Next.js 15 App Router · TypeScript · Prisma ORM · SQLite · NextAuth v5 (credentials) · Tailwind + shadcn/ui · Zod · @react-pdf/renderer · Vitest

**Repo layout** (target state):
```
app/(auth)/login/          app/(student)/{dashboard,courses,schedule,transcript,overrides}/
app/(advisor)/overrides/   app/(admin)/{dashboard,terms,courses,sections,audit}/
app/api/{auth,enrollments,overrides,sections,transcript,admin}/
components/   lib/   prisma/{schema.prisma,seed.ts}   tests/
```

**Route groups map to roles:**
- `app/(auth)/` — login page
- `app/(student)/` — dashboard, course browse, schedule, transcript, override requests
- `app/(advisor)/` — override inbox
- `app/(admin)/` — terms, courses, sections, audit log
- `app/api/` — REST endpoints (all JSON, auth via session cookie)

`middleware.ts` enforces role-based access: redirects unauthorized roles away from each group.

**Core logic lives in `lib/`:**
- `lib/validator.ts` — two pure functions, no side effects:
  - `validateEnrollment(studentId, sectionId, db, overrideGranted?)` → `{ ok: true; state: "ENROLLED"|"WAITLISTED" } | { ok: false; reason: string }`. Runs 7 checks in order: window open → not already enrolled → prerequisites met → no time conflict → credit cap → section capacity → waitlist.
  - `tryPromoteWaitlist(sectionId, db)` → `string | null`. Called inside drop transaction. Tries up to 5 WAITLISTED candidates (ascending `waitlistPos`), re-runs validator, promotes first valid one.
  - Credit-hour cap constants: `MIN_CREDITS = 12`, `MAX_CREDITS = 18`, `MAX_CREDITS_OVERRIDE = 21`.
- `lib/db.ts` — Prisma client singleton
- `lib/auth.ts` — NextAuth config; session includes `{ user: { id, role, studentId } }`
- `lib/pdf.tsx` — react-pdf transcript template

**Every enrollment state change is atomic:** `prisma.$transaction([...])` writes `Enrollment` + `AuditLog` together. No partial state ever.

**Waitlist auto-promote** runs inside the drop transaction — no background job. On drop, scans WAITLISTED candidates (ascending `waitlistPos`), re-runs validator for each, promotes first valid one.

**EnrollmentState enum** (in Prisma schema and DB): `PENDING → ENROLLED ↔ WAITLISTED → DROPPED / COMPLETED / CANCELLED`. Terminal states: DROPPED, COMPLETED, CANCELLED.

## Key files to read before modifying

| Area | File |
|------|------|
| All API shapes + auth requirements | [docs/05-api-routes.md](docs/05-api-routes.md) |
| Validator check order + edge cases | [docs/06-validator-logic.md](docs/06-validator-logic.md) |
| Full Prisma schema + seed plan | [docs/03-database-schema.md](docs/03-database-schema.md) |
| Feature specs per role | [docs/04-features-prd.md](docs/04-features-prd.md) |

## Demo accounts (seeded)

| Email | Password | Role |
|-------|----------|------|
| student@alex.edu | demo1234 | STUDENT |
| advisor@alex.edu | demo1234 | ADVISOR |
| admin@alex.edu | demo1234 | ADMIN |

Shown on login page for easy demo switching.

## Schedule JSON format

Stored as stringified JSON in `Section.scheduleJson`:
```typescript
type TimeSlot = { day: "SUN"|"MON"|"TUE"|"WED"|"THU"; startTime: string; endTime: string; room: string };
```
`startTime`/`endTime` are `"HH:MM"` 24h strings. Lexicographic comparison valid for same-day overlap checks.

## Out of scope (do not implement)

Email notifications (console.log mock only), grade entry, fee/refund on drop, Arabic full UI, SSO/LDAP, multi-department cross-prereq testing.
