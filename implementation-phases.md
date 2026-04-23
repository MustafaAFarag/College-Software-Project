# UniReg — Implementation Phases

> Agent consumption guide. Each task: files to create/edit, inputs needed, outputs produced, acceptance criteria. Dependency IDs tell you what must finish first. Same-group tasks have no mutual dependencies.

---

## Stack Versions

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16 | `params`/`searchParams`/`cookies()`/`headers()` all async |
| Prisma | 7 | `prisma.config.ts` replaces datasource url in schema; seed in config |
| React | 19 | Ships with Next.js 16 canary |
| NextAuth | v5 beta | `await auth()` pattern |
| Tailwind | 4 | CSS-first config, no `tailwind.config.ts` needed |

---

## Design System — Linear (dark-only)

**Source of truth:** `DESIGN.md` in project root. All UI must follow it exactly.

**Non-negotiable rules (from DESIGN.md §7):**
- `font-feature-settings: "cv01", "ss03"` on ALL text — non-negotiable
- Weight 510 as default emphasis (not bold 700, not medium 500)
- Dark-only — NO light mode toggle, no `dark:` class variants needed
- Laptop/tablet first (≥768px primary target). Mobile responsive but not mobile-first
- Brand indigo ONLY on primary CTAs and active states — nothing else chromatic

**CSS variables to set in `app/globals.css`:**
```css
:root {
  --bg-page:      #08090a;
  --bg-panel:     #0f1011;
  --bg-surface:   #191a1b;
  --bg-elevated:  #28282c;
  --text-primary: #f7f8f8;
  --text-secondary: #d0d6e0;
  --text-muted:   #8a8f98;
  --text-subtle:  #62666d;
  --accent:       #5e6ad2;
  --accent-bright:#7170ff;
  --accent-hover: #828fff;
  --border:       rgba(255,255,255,0.08);
  --border-subtle:rgba(255,255,255,0.05);
  --green:        #10b981;
}

html { background: var(--bg-page); color: var(--text-primary); }
* { font-feature-settings: "cv01", "ss03"; }
```

**Font:** Inter Variable via `next/font/google`. Fallback: `system-ui`.

**shadcn/ui** — add components but override their default CSS vars with Linear palette in `globals.css`. Do not use shadcn's default light/dark theming system.

---

## Dependency Graph

```
Phase 0 (serial)
  └─ Phase 1 (3 parallel agents)
       ├─ 1-A validator + tests
       ├─ 1-B enrollment + section APIs
       └─ 1-C overrides + admin APIs
            └─ Phase 2 (3 parallel agents, after ALL Phase 1 done)
                 ├─ 2-A student pages
                 ├─ 2-B advisor pages
                 └─ 2-C admin pages
                      └─ Phase 3 (serial)
                           ├─ 3.1 PDF transcript
                           └─ 3.2 polish + checklist
```

---

## Phase 0 — Foundation (serial)

Do tasks 0.1 → 0.4 in order. Everything depends on Phase 0.

---

### Task 0.1 — Project scaffold

**Files to create:** `package.json`, `tsconfig.json`, `next.config.ts`, `.env.local`, `.gitignore`

**Install commands:**
```bash
npx create-next-app@16 . --typescript --tailwind --app --src-dir=false --import-alias="@/*"
npm install prisma@7 @prisma/client@7
npm install next-auth@beta @auth/prisma-adapter
npm install zod @react-pdf/renderer
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths tsx dotenv
npx shadcn@latest init
npx shadcn@latest add button card table badge dialog skeleton sonner tabs select
```

**`tsconfig.json`** — strict mode required:
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./*"] }
  }
}
```

**`vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
export default defineConfig({ plugins: [tsconfigPaths()], test: { environment: 'node' } })
```

**Accept when:** `npm run dev` starts clean; `npx tsc --noEmit` passes.

---

### Task 0.2 — Prisma 7 schema + config + seed

**Depends on:** 0.1

**Source of truth:** `docs/03-database-schema.md`

**Files to create:**
- `prisma/schema.prisma`
- `prisma.config.ts` ← Prisma 7 requires this; datasource url lives here, NOT in schema
- `prisma/seed.ts`
- `lib/db.ts`

**`prisma.config.ts`** (Prisma 7 pattern — required):
```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

type Env = { DATABASE_URL: string }

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: env<Env>('DATABASE_URL'),
  },
})
```

**`prisma/schema.prisma`** — copy exact schema from `docs/03-database-schema.md`. In Prisma 7 the datasource block no longer needs `url` (it comes from `prisma.config.ts`), but keeping it as a fallback is fine:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**`lib/db.ts`** — singleton pattern:
```typescript
import { PrismaClient } from "@prisma/client"
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const db = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

**`.env.local`:**
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="replace-with-32-char-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

> Note: In Prisma 7, SQLite URL is resolved relative to `prisma.config.ts`, not `schema.prisma`. Use `file:./prisma/dev.db` to keep the DB inside the `prisma/` folder.

**Seed plan** (from `docs/03-database-schema.md`):
- 3 users: `student@alex.edu`, `advisor@alex.edu`, `admin@alex.edu` — password `demo1234` (bcrypt hash via `bcryptjs`)
- 1 department: CS
- 10 courses: CS101, CS102, CS201, CS202, CS301, CS302, CS401, CS402, MATH101, MATH201
- Prerequisites: CS201→CS101, CS301→CS201, CS302→CS201, CS401→CS301
- 1 active term: Spring 2025, `regOpensAt` past, `regClosesAt` future, `isActive: true`
- 2 sections per course, 20 seats each, varied schedules (create deliberate time conflict cases)
- 1 section at capacity (enrolled count = capacity) to demo waitlist
- Student has COMPLETED enrollment for CS101 to demo prereq satisfaction

**Run:**
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

**Accept when:** Seed completes; 3 users exist; CS101 COMPLETED enrollment exists for student.

---

### Task 0.3 — NextAuth v5 + middleware

**Depends on:** 0.2

**Files to create:**
- `lib/auth.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `middleware.ts`
- `types/next-auth.d.ts`

**Next.js 16 critical:** `cookies()` and `headers()` are async. NextAuth v5 `auth()` is already async — always `await auth()`.

**`lib/auth.ts`:**
```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z.object({ email: z.string().email(), password: z.string() }).safeParse(credentials)
        if (!parsed.success) return null
        const user = await db.user.findUnique({ where: { email: parsed.data.email } })
        if (!user) return null
        const valid = await compare(parsed.data.password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role, studentId: user.studentId }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.role = (user as any).role; token.studentId = (user as any).studentId }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      session.user.role = token.role as any
      session.user.studentId = token.studentId as any
      return session
    }
  },
  pages: { signIn: "/login" }
})
```

**`types/next-auth.d.ts`:**
```typescript
import { Role } from "@prisma/client"
declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role; studentId: string | null } & DefaultSession["user"]
  }
}
declare module "next-auth/jwt" {
  interface JWT { role: Role; studentId: string | null }
}
```

**`middleware.ts`** — route protection:
```typescript
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role

  if (!req.auth && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  if (pathname.startsWith("/student") && role !== "STUDENT")
    return NextResponse.redirect(new URL("/login", req.url))
  if (pathname.startsWith("/advisor") && role !== "ADVISOR")
    return NextResponse.redirect(new URL("/login", req.url))
  if (pathname.startsWith("/admin") && role !== "ADMIN")
    return NextResponse.redirect(new URL("/login", req.url))
  if (pathname === "/login" && req.auth) {
    const dest = role === "STUDENT" ? "/student/dashboard"
      : role === "ADVISOR" ? "/advisor/overrides"
      : "/admin/dashboard"
    return NextResponse.redirect(new URL(dest, req.url))
  }
})

export const config = { matcher: ["/((?!api|_next|favicon).*)"] }
```

**Accept when:** Login with `student@alex.edu / demo1234` works; `/admin` as student redirects to `/login`.

---

### Task 0.4 — Design system + shared layout

**Depends on:** 0.3

**Source of truth for all styles:** `DESIGN.md` in project root.

**Files to create:**
- `app/globals.css` — Linear CSS variables + global resets
- `app/layout.tsx` — root layout with Inter Variable font + SessionProvider
- `components/layout/sidebar.tsx`
- `components/layout/header.tsx`
- `app/(auth)/login/page.tsx`
- `app/(student)/layout.tsx`
- `app/(advisor)/layout.tsx`
- `app/(admin)/layout.tsx`

**`app/layout.tsx`:**
```typescript
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), system-ui" }}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

**`app/globals.css`** — set Linear palette + override shadcn vars:
```css
@import "tailwindcss";

:root {
  --bg-page:       #08090a;
  --bg-panel:      #0f1011;
  --bg-surface:    #191a1b;
  --bg-elevated:   #28282c;
  --text-primary:  #f7f8f8;
  --text-secondary:#d0d6e0;
  --text-muted:    #8a8f98;
  --text-subtle:   #62666d;
  --accent:        #5e6ad2;
  --accent-bright: #7170ff;
  --accent-hover:  #828fff;
  --border:        rgba(255,255,255,0.08);
  --border-subtle: rgba(255,255,255,0.05);
  --green:         #10b981;
  --radius:        6px;

  /* shadcn overrides */
  --background: #08090a;
  --foreground: #f7f8f8;
  --card: #191a1b;
  --card-foreground: #f7f8f8;
  --border: rgba(255,255,255,0.08);
  --input: rgba(255,255,255,0.08);
  --primary: #5e6ad2;
  --primary-foreground: #f7f8f8;
  --muted: #28282c;
  --muted-foreground: #8a8f98;
  --ring: #5e6ad2;
}

html { background: var(--bg-page); color: var(--text-primary); }
*, *::before, *::after { font-feature-settings: "cv01", "ss03"; }
body { font-family: var(--font-inter), system-ui, sans-serif; }
```

**Sidebar links per role:**
- STUDENT: Dashboard · Browse Courses · My Schedule · Transcript · Override Requests
- ADVISOR: Override Inbox
- ADMIN: Dashboard · Terms · Courses · Sections · Audit Log

**Sidebar + header design** (from DESIGN.md):
- Sidebar background: `var(--bg-panel)` (`#0f1011`)
- Nav links: 13px Inter weight 510, `var(--text-secondary)`, hover → `var(--text-primary)`
- Active link: `var(--accent-bright)` text + subtle `var(--bg-surface)` background
- Header: same `var(--bg-panel)`, bottom border `var(--border-subtle)`, app name left, user name + role badge + logout right
- Role badge: pill style — transparent bg, `var(--border)` border, `var(--text-muted)` text, 9999px radius, 12px weight 510

**Login page** — must show all 3 demo accounts visibly:
```
Demo accounts (click to fill):
student@alex.edu / demo1234   [STUDENT]
advisor@alex.edu / demo1234   [ADVISOR]
admin@alex.edu / demo1234     [ADMIN]
```
Clicking a demo card pre-fills the form. Card style: `var(--bg-surface)` bg, `var(--border)` border, 8px radius.

**Accept when:** Login renders with Linear dark theme; sidebar shows correct links per role; Inter Variable loads (check DevTools font); role badge visible in header.

---

## Phase 1 — Core Logic + APIs (3 parallel agents)

Start all three after Phase 0. No dependencies on each other within Phase 1.

---

### Task 1-A — Validator + tests

**Agent A owns:**
- `lib/validator.ts`
- `tests/validator.test.ts`

**Source of truth:** `docs/06-validator-logic.md` — implement exactly as specified.

**Exports:**
```typescript
export const MIN_CREDITS = 12
export const MAX_CREDITS = 18
export const MAX_CREDITS_OVERRIDE = 21

export type ValidationResult =
  | { ok: true; state: "ENROLLED" | "WAITLISTED" }
  | { ok: false; reason: string }

export async function validateEnrollment(
  studentId: string,
  sectionId: string,
  db: PrismaClient,
  overrideGranted?: boolean
): Promise<ValidationResult>

export async function tryPromoteWaitlist(
  sectionId: string,
  db: PrismaClient
): Promise<string | null>
```

**7 checks (fail-fast order):**
1. `term.regOpensAt <= now <= term.regClosesAt` → `"Registration window is closed"`
2. No existing enrollment with state IN [ENROLLED, WAITLISTED, PENDING] → `"Already enrolled or waitlisted in this section"`
3. (skip if `overrideGranted`) All prereqs have COMPLETED enrollment → `"Missing prerequisite: {code} — {title}"`
4. No time overlap with other ENROLLED sections same term → `"Time conflict with {code} ({day} {start}–{end})"`
5. (skip if `overrideGranted`) Sum ENROLLED credits + new ≤ 18 (or 21 override) → `"Credit hour cap reached ({current}/{cap} hours)"`
6. If `enrolledCount >= capacity` → return `{ ok: true, state: "WAITLISTED" }` with `waitlistPos = max(existing) + 1`
7. → `{ ok: true, state: "ENROLLED" }`

**Time overlap helper (exact):**
```typescript
function timesOverlap(a: TimeSlot, b: TimeSlot): boolean {
  if (a.day !== b.day) return false
  return a.startTime < b.endTime && b.startTime < a.endTime
}
```

**`tryPromoteWaitlist`:**
1. Find WAITLISTED enrollment for section with lowest `waitlistPos`
2. Run `validateEnrollment` for that student
3. If passes: update to ENROLLED, clear `waitlistPos`, append `AuditLog { action: "PROMOTE" }`
4. Try up to 5 candidates on failure
5. Return promoted studentId or null
6. Accepts a transaction client — no new transaction inside

**Test cases required:**
- Window closed → blocked
- Already enrolled → blocked
- Missing prereq → blocked (and verify specific message includes course code)
- Time conflict same day overlapping → blocked
- Same time different day → passes
- Credit cap exceeded → blocked
- Credit cap bypassed with `overrideGranted: true`
- Prereq bypassed with `overrideGranted: true`
- Section at capacity → `{ ok: true, state: "WAITLISTED" }`
- All clear → `{ ok: true, state: "ENROLLED" }`

**Accept when:** `npx vitest run` — all 10 tests green; `npx tsc --noEmit` clean.

---

### Task 1-B — Enrollment + Sections APIs

**Agent B owns:**
- `app/api/enrollments/route.ts`
- `app/api/enrollments/[id]/route.ts`
- `app/api/sections/route.ts`

**Source of truth:** `docs/05-api-routes.md`

**Next.js 16 critical patterns:**
```typescript
// Route handler auth — cookies is async
import { auth } from "@/lib/auth"
const session = await auth()  // always await

// Dynamic params — async in Next.js 16
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

**`GET /api/sections`:**
- Query: `termId?`, `departmentId?`, `level?`, `day?`, `availableOnly?`
- Default to active term if no `termId`
- Response per section: `{ id, course: { code, title, creditHours }, instructor: { name } | null, capacity, enrolled: number, scheduleJson, prerequisites: string[] }`
- `availableOnly=true` → filter `enrolled < capacity`

**`GET /api/enrollments`** — STUDENT only:
- Returns own enrollments for active term
- Include section → course data

**`POST /api/enrollments`** — STUDENT only:
- Body: `{ sectionId: string }` (Zod)
- Check `OverrideRequest` where `studentId + sectionId + status = "APPROVED"` → set `overrideGranted`
- Call `validateEnrollment`
- On `ok: true`: `prisma.$transaction` → create Enrollment + AuditLog `{ action: "ENROLL", toState: state }`
- If WAITLISTED: `waitlistPos = max existing + 1` inside transaction
- Return shapes from `docs/05-api-routes.md`

**`PATCH /api/enrollments/:id`:**
- Body: `{ action: "DROP" }` (Zod)
- Verify enrollment belongs to session user → 403
- Check `term.dropClosesAt > now` → 400 `"Drop window is closed"`
- `prisma.$transaction`: set DROPPED + AuditLog + `tryPromoteWaitlist(sectionId, tx)`
- Return `{ ok: true, promoted: string | null }`

**Error shape:** `{ error: string }` with correct HTTP status (400/401/403/404/409/500).

**Accept when:** `npx tsc --noEmit` clean; POST enroll returns ok; duplicate POST returns blocked; PATCH drop returns `promoted: null`.

---

### Task 1-C — Overrides + Admin APIs

**Agent C owns:**
- `app/api/overrides/route.ts`
- `app/api/overrides/[id]/route.ts`
- `app/api/admin/terms/route.ts`
- `app/api/admin/terms/[id]/route.ts`
- `app/api/admin/courses/route.ts`
- `app/api/admin/courses/[id]/route.ts`
- `app/api/admin/courses/[id]/prerequisites/route.ts`
- `app/api/admin/courses/[id]/prerequisites/[reqId]/route.ts`
- `app/api/admin/sections/route.ts`
- `app/api/admin/sections/[id]/route.ts`
- `app/api/admin/audit/route.ts`

**Source of truth:** `docs/05-api-routes.md`

**Next.js 16:** all dynamic `params` are `Promise<{...}>` — must `await params`.

**Override rules:**
- `GET /api/overrides`: STUDENT → own; ADVISOR → all PENDING
- `POST /api/overrides`: STUDENT; Zod validate `reason` 20–500 chars
- `PATCH /api/overrides/:id`: ADVISOR only; set `advisorId = session.user.id`, `decidedAt = new Date()`

**Admin auth guard (every admin route):**
```typescript
const session = await auth()
if (!session || session.user.role !== "ADMIN")
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
```

**Term isActive toggle:** `PATCH /api/admin/terms/:id` with `{ isActive: true }` must wrap in `prisma.$transaction`:
1. `updateMany` all terms → `isActive: false`
2. `update` target term → `isActive: true`

**Audit route:**
- Query: `studentId?`, `action?`, `from?` (ISO), `to?` (ISO), `page?` (default 1), `limit?` (default 50)
- `findMany` with `take: limit, skip: (page-1)*limit` always

**Accept when:** `npx tsc --noEmit` clean; override PATCH updates status; term toggle deactivates others.

---

## Phase 2 — Pages (3 parallel agents)

Start after ALL Phase 1 tasks accepted. Each agent owns one role.

**Next.js 16 pattern for all pages with params/searchParams:**
```typescript
// Page with searchParams
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
}

// Page with params
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

**Design rules for all pages (from DESIGN.md):**
- Page background: `var(--bg-page)` (`#08090a`)
- Cards: `rgba(255,255,255,0.02)` bg + `var(--border)` border + 8px radius
- Tables: `var(--bg-panel)` bg, row hover → `var(--bg-surface)`, header text `var(--text-muted)` 12px weight 510
- Inputs: `rgba(255,255,255,0.02)` bg, `var(--border)` border, 6px radius, `var(--text-secondary)` text
- Primary CTA buttons: `var(--accent)` bg, `var(--text-primary)` text, 6px radius
- Ghost buttons: `rgba(255,255,255,0.02)` bg, `var(--border)` border
- Status badges: pill style (9999px radius), 12px weight 510

---

### Task 2-A — Student pages

**Agent A owns:**
- `app/(student)/dashboard/page.tsx`
- `app/(student)/courses/page.tsx`
- `app/(student)/schedule/page.tsx`
- `app/(student)/transcript/page.tsx`
- `app/(student)/overrides/page.tsx`
- `components/CourseCard.tsx`
- `components/ScheduleGrid.tsx`

**Dashboard (F2):**
- Server component — fetch active term, fetch enrollments
- Show: term name, window status badge (OPEN green / CLOSED red / DROP WINDOW amber)
- Credit hours: `{enrolled} / {MAX_CREDITS}` — import `MAX_CREDITS` from `lib/validator.ts`
- Waitlist count badge if any WAITLISTED enrollments
- Quick links: Browse Courses, My Schedule, Transcript

**Courses page (F3):**
- Server component for initial data; filter bar as `'use client'` leaf
- Filters: department select, level select (100/200/300/400), day checkboxes, available-only toggle
- CourseCard: code, title, instructor, schedule (formatted), room, `{enrolled}/{capacity}` seats, prereq chips
- Register button: client mutation → `POST /api/enrollments`
  - Success ENROLLED: button → disabled "Enrolled ✓" (green)
  - Success WAITLISTED: button → "Waitlisted #{pos}" (amber) + sonner toast
  - Blocked: inline error message below card (exact `reason` from API)
  - "Request Override" link appears on prereq/credit-cap block; links to `/student/overrides?sectionId=...`

**Schedule page (F4):**
- `ScheduleGrid` client component: Sun–Thu columns, 08:00–18:00, 30-min row slots
- ENROLLED sections: colored block — use `hashColor(courseCode)` → one of 6 accent hues derived from `var(--accent-bright)` family
- WAITLISTED: same block but striped / lower opacity
- Drop button on block → shadcn Dialog confirm → `PATCH /api/enrollments/:id`
- Drop button disabled + tooltip "Drop window closed" if `term.dropClosesAt <= now`
- Grid scrolls horizontally on <768px

**Transcript page (F7):**
- Server component — list all terms with enrollments (exclude PENDING)
- Group by term, show course code/title/credits/state
- "Download PDF" button → client `fetch('/api/transcript')` → `createObjectURL(blob)` → trigger download

**Overrides page (F6):**
- List own requests: table with section, reason excerpt, status badge, submitted date
- Submit form: section selector (pre-fill from `?sectionId=` searchParam), reason textarea 20–500 chars + live counter
- Submit → `POST /api/overrides` → sonner toast success/error

**Accept when:** Register flow works end-to-end; schedule grid renders correct blocks; drop works with confirm dialog.

---

### Task 2-B — Advisor pages

**Agent B owns:**
- `app/(advisor)/overrides/page.tsx`
- `components/OverrideInbox.tsx`

**Override inbox (F8):**
- Server component fetches all PENDING override requests; `OverrideInbox` is client component
- Table: student name, course code (from section), reason (truncated 80 chars + expand), submitted date
- Approve / Reject buttons per row → `PATCH /api/overrides/:id`
- Optimistic update: grey out row + show pending spinner; revert on error
- After action: row gets APPROVED (green badge) or REJECTED (red badge)
- Empty state: centered message "No pending override requests" in `var(--text-muted)` 15px

**Accept when:** Approve sets status; APPROVED flag enables student to bypass validator.

---

### Task 2-C — Admin pages

**Agent C owns:**
- `app/(admin)/dashboard/page.tsx`
- `app/(admin)/terms/page.tsx`
- `app/(admin)/courses/page.tsx`
- `app/(admin)/sections/page.tsx`
- `app/(admin)/audit/page.tsx`
- `components/AuditLogTable.tsx`

**Dashboard:** stat cards — total students, active term label, total sections, pending overrides count.

**Terms page (F9):**
- List terms; create/edit via shadcn Dialog
- Active term gets green "Active" badge
- Toggle isActive → confirm Dialog "This will deactivate all other terms" → `PATCH /api/admin/terms/:id`
- All date fields: `<input type="datetime-local">`, convert to ISO on submit

**Courses page (F10):**
- List with department + level column
- Create/edit Dialog: code, title, creditHours (number), level (100/200/300/400 select), department select
- Prerequisite management: within edit Dialog, chip list of current prereqs with × remove; add-prereq select dropdown

**Sections page (F11):**
- Term filter (default active term) as controlled select
- Create/edit Dialog: course select, instructor optional, capacity number
- Schedule builder: dynamic rows — each row: day select (SUN–THU), startTime, endTime, room text
  - "Add slot" button adds a row
  - Validate endTime > startTime per row before submit
  - Serializes to `JSON.stringify(rows)` for `scheduleJson`

**Audit log (F12):**
- `AuditLogTable` — client component
- `page` param in URL (use `useSearchParams` — single param, OK per CLAUDE.md rule)
- Filters: studentId text, action select, from/to date inputs
- Columns: timestamp, actor name, action badge, from→to state, section code, meta (collapsed)
- Prev/next page buttons at bottom

**Accept when:** Term toggle deactivates others in DB; schedule builder serializes correct JSON; audit log paginates.

---

## Phase 3 — PDF + Polish (serial)

After all Phase 2 tasks accepted.

---

### Task 3.1 — PDF transcript

**Files:**
- `lib/pdf.tsx`
- `app/api/transcript/route.ts`

**`lib/pdf.tsx`** — `@react-pdf/renderer` Document:
- Props: `{ student: User, enrollments: (Enrollment & { section: Section & { course: Course, term: Term } })[], generatedAt: Date }`
- Layout:
  - Header: "Alexandria University — UniReg" + generated date
  - Student block: name, studentId, department
  - Per term: term label as section header, table of (code, title, credits, state)
  - Footer: total credits completed
- Style: minimal, black text on white (PDF is always light), clean table borders

**`GET /api/transcript`:**
```typescript
import { auth } from "@/lib/auth"
import { renderToStream } from "@react-pdf/renderer"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "STUDENT")
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
  // ... fetch + render
  const stream = await renderToStream(<TranscriptDoc ... />)
  return new Response(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="transcript-${session.user.studentId}.pdf"`,
    },
  })
}
```

**Accept when:** Download button produces valid PDF with correct student data.

---

### Task 3.2 — Integration polish

**Touch any file as needed.**

**Checklist:**
- [ ] All server-fetched pages have `<Skeleton>` loading state (use Next.js `loading.tsx` per segment or Suspense)
- [ ] All form submit buttons: disabled + spinner during pending (shadcn Button `disabled` prop)
- [ ] All API errors surface as sonner toasts
- [ ] `middleware.ts` redirects unauthenticated `/` → `/login`
- [ ] Login `/login` redirects already-authed users to role dashboard
- [ ] Schedule grid horizontal scroll on <768px verified
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npx vitest run` — all tests green
- [ ] Demo flows all work:
  - Student: login → browse → register CS201 (prereq CS101 COMPLETED) → see in schedule → drop
  - Student: try to register full section → see waitlist state
  - Student: submit override request
  - Advisor: login → approve override → student can now bypass validator
  - Admin: login → toggle term → create section with schedule builder
  - Admin: view audit log with filters

**Accept when:** All checklist items pass; clean console on every demo flow page.

---

## Agent Hand-off Protocol

**Claiming a task:**
```
STARTING task {ID} — {title}
Reading: {source docs listed in task}
```

**Completing:**
```
DONE task {ID}
Created: {list files}
Edited: {list files}
```

**Blocked:**
```
BLOCKED task {ID} — waiting on {dep ID}
```

**File ownership rule:** Parallel agents MUST NOT edit files owned by another parallel task. Shared utilities go in `lib/utils.ts` — note it in hand-off so the next agent knows it exists.
