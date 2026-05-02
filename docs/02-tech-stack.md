# Tech Stack & Architecture

## Stack Decisions

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 16.2 App Router | Single full-stack repo for pages, APIs, and route protection |
| Runtime | React 19.2 | Server Components + new hooks |
| Language | TypeScript 5 | Safer domain logic and Prisma integration |
| Database | SQLite + Prisma 6 | Lightweight local setup for the college demo |
| Authentication | NextAuth v5 (beta) credentials provider | Simple role-aware demo login |
| Styling | Tailwind v4 + `app/globals.css` + `react-toastify` | Fast iteration without a heavy design-system dependency |
| Validation | Zod 4 | Request validation on API boundaries |
| PDF | `@react-pdf/renderer` 4 | Server-generated transcript PDF export |
| Testing | Vitest 4 | Fast validator unit tests |
| Diagrams | draw.io | One maintained source file for all required models |

## Repository Structure

```text
app/                 route groups, pages, and API handlers
components/          reusable UI pieces
lib/                 auth, db, validator, and PDF helpers
prisma/              schema, migrations, and seed data
tests/               unit tests
types/               NextAuth type augmentation
docs/                project report source files
public/              static assets
```

## Environment

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="replace-with-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Architectural Notes

- `lib/validator.ts` centralizes enrollment decisions so UI and API behavior stay consistent.
- Enrollment, waitlist promotion, and audit writes are grouped in transactions where consistency matters.
- Role-based middleware protects `/student/*`, `/advisor/*`, `/admin/*`, and `/instructor/*`.
- Seed data includes demo accounts for student, advisor, instructor, and admin roles.
