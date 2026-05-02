# fix-these.md — UniReg UI Bug & Inconsistency Tracker

> **Rule:** Do not fix anything until all manual deliverables (diagrams, PDF report, demo video) are done.
> Each phase is ordered by impact. Sub-tasks are atomic — one file, one concern.

---

## Phase 1 — Critical Layout Bugs (broken rendering)

### 1.1 ScheduleGrid time-label misalignment
**File:** `components/ScheduleGrid.tsx`
**Problem:** Time labels on the left are positioned with `alignItems: "flex-start"` and a small `paddingTop`. Course blocks use `gridRow: span N` to span multiple rows. CSS Grid does not render empty cells for spanned rows, so the implicit row heights shift — time labels visually drift out of sync with course block edges as the day fills up.
**Sub-tasks:**
- [ ] Replace the left-column time label rendering with an absolutely-positioned overlay (fixed pixel offsets per slot) OR switch to a single CSS Grid where both labels and course blocks share the same explicit row definitions
- [ ] Define one `ROW_HEIGHT_PX` constant and derive all offsets from it
- [ ] Verify alignment visually at 4, 6, and 8 time slots

### 1.2 Waitlisted block contrast
**File:** `components/ScheduleGrid.tsx`
**Problem:** Waitlisted sections use `pal.light` (semi-transparent color) as background but hardcode `color: "white"` for text — fails contrast on lighter palette entries.
**Sub-tasks:**
- [ ] Switch waitlisted text color to `pal.dark` (the same palette dark token already used for enrolled blocks) or use a computed contrast color

---

## Phase 2 — Navigation & Layout Inconsistencies

### 2.1 Sidebar — no icons, no role indicator, weak active state
**File:** `components/layout/sidebar.tsx`
**Problem:** Links are plain text with only a color change on active. No icons. No role badge. Single-link roles (Instructor, Advisor) look like broken nav.
**Sub-tasks:**
- [ ] Add a left border accent (2–3px `var(--accent)`) to the active link
- [ ] Add a role badge (pill) below the logo showing current role in title-case
- [ ] Add simple inline SVG or lucide-react icons for each nav item

### 2.2 Header — role displayed as raw uppercase enum string
**File:** `components/layout/header.tsx`
**Problem:** Role shows as "STUDENT", "ADMIN" etc. directly from the DB enum. No avatar, no initials circle.
**Sub-tasks:**
- [ ] Map enum → title-case display string (`STUDENT` → `Student`)
- [ ] Add an initials circle (first letter of name) as a pseudo-avatar next to the role

### 2.3 Root redirect double-hop
**File:** `app/page.tsx`
**Problem:** Root always redirects to `/login` even when the user is authenticated. Middleware then immediately redirects `/login` to the role dashboard — two redirects on every authenticated page load.
**Sub-tasks:**
- [ ] In `app/page.tsx`, read session first and redirect directly to role dashboard if authenticated, `/login` otherwise

---

## Phase 3 — Student Flow Issues

### 3.1 Course browser — day-filter abbreviation mismatch
**File:** `app/(student)/student/courses/browser.tsx`
**Problem:** Day filter buttons show `"SUN"/"MON"/"TUE"` etc. The schedule grid displays `"Sunday"/"Monday"/"Tuesday"`. Two different formats for the same data.
**Sub-tasks:**
- [ ] Pick one canonical format for display (recommend full names: "Sunday") and apply consistently to both the filter buttons and ScheduleGrid day labels

### 3.2 Course browser — enroll button alignment inconsistency
**File:** `app/(student)/student/courses/browser.tsx`
**Problem:** Right column uses both `display: flex` on the button container and `textAlign: right` on the parent — mixing two alignment strategies.
**Sub-tasks:**
- [ ] Remove `textAlign: right` from parent; rely solely on `display: flex; justify-content: flex-end` on the button wrapper

### 3.3 Transcript — no GPA displayed
**File:** `app/(student)/student/transcript/page.tsx`
**Problem:** Page shows total completed credits but no GPA, even though grade data exists. Empty state style also differs from other pages (no centered container, different font size).
**Sub-tasks:**
- [ ] Add GPA calculation (weighted average of grade points × credit hours / total credits)
- [ ] Align empty state style with the pattern used in the overrides and dashboard pages

### 3.4 Overrides — redundant `msg` state alongside toast
**File:** `app/(student)/student/overrides/client.tsx`
**Problem:** Both a `msg` string state (rendered inline) and `toast()` calls are used for success/error feedback. Success detection checks `msg.includes("!")` — fragile string matching.
**Sub-tasks:**
- [ ] Remove `msg` state entirely; use only `toast.success` / `toast.error`
- [ ] Remove the inline message `<div>` render

### 3.5 Dashboard — "How to use" block feels like a placeholder
**File:** `app/(student)/student/dashboard/page.tsx`
**Problem:** Help text block visually looks like a dev note, not a polished feature. No icon, plain text, inconsistent card style vs the stat cards.
**Sub-tasks:**
- [ ] Either style it as a real info card (icon + heading + body) or remove it if the feature set is self-explanatory for a demo

---

## Phase 4 — Admin Flow Issues

### 4.1 Admin dashboard — 5-column grid too narrow
**File:** `app/(admin)/admin/dashboard/page.tsx`
**Problem:** Stat cards sit in a 5-col grid. At typical laptop widths (1280px) each card is ~200px wide — text truncates. Also: enrollment state transitions show raw ASCII `->` arrow instead of `→`.
**Sub-tasks:**
- [ ] Switch to 3-col grid (or 2+3 split); let cards breathe
- [ ] Replace all `"->"` strings with `"→"` (U+2192)

### 4.2 Terms — `window.confirm()` for destructive action
**File:** `app/(admin)/admin/terms/client.tsx`
**Problem:** "Set Active" (which deactivates all other terms) uses `window.confirm()`. Elsewhere (ScheduleGrid drop) an inline confirm UI is used. Inconsistent pattern.
**Sub-tasks:**
- [ ] Replace `window.confirm()` with an inline confirmation row (show "Are you sure? [Yes] [Cancel]" within the table row or a small modal)

### 4.3 Sections — no remove-slot button in schedule builder
**File:** `app/(admin)/admin/sections/client.tsx`
**Problem:** Schedule slot builder has an "+ Add Slot" button but no way to remove a slot. If admin adds an extra slot by accident they cannot remove it without cancelling the whole form.
**Sub-tasks:**
- [ ] Add a "×" remove button to each slot row (disable remove when only 1 slot remains)

### 4.4 Sections — `groupLabel` not editable in form
**File:** `app/(admin)/admin/sections/client.tsx`
**Problem:** `groupLabel` is returned from the API and displayed in the table but is absent from the create/edit form. Admins cannot set or change it through the UI.
**Sub-tasks:**
- [ ] Add an optional `groupLabel` text input to both create and edit forms

### 4.5 Courses — no search or filter on course list
**File:** `app/(admin)/admin/courses/client.tsx`
**Problem:** Course list shows all courses with no search. With 30+ courses this becomes unusable.
**Sub-tasks:**
- [ ] Add a client-side text filter input that filters by `code` or `title` (no server round-trip needed)

---

## Phase 5 — Advisor & Instructor Flow Issues

### 5.1 Advisor override inbox — stale list after action
**File:** `app/(advisor)/advisor/overrides/inbox.tsx`
**Problem:** After approving or rejecting a request, the row stays visible (badge updates to Approved/Rejected) but the list is never refreshed from the server. If the advisor acts on multiple requests in sequence, stale data accumulates.
**Sub-tasks:**
- [ ] Either filter out acted-on rows from local state immediately, OR add a "Refresh" button, OR `router.refresh()` after each action

### 5.2 Advisor override inbox — no page `<h1>`
**File:** `app/(advisor)/advisor/overrides/inbox.tsx`
**Problem:** Page has no heading. All other admin pages have an `<h1>` with consistent font size/weight. Advisor inbox is missing one entirely.
**Sub-tasks:**
- [ ] Add `<h1>Override Requests</h1>` with same style as admin page headings (`fontSize: "20px", fontWeight: 510, color: "var(--text-primary)"`)

### 5.3 Instructor roster — single-link sidebar looks broken
**File:** `app/(instructor)/instructor/roster/page.tsx` + sidebar
**Problem:** Instructor and Advisor roles have one nav link. Sidebar looks like an error state (giant empty space below one link).
**Sub-tasks:**
- [ ] Add a role-appropriate landing message or second utility link (e.g. "Profile") to fill the sidebar
- [ ] Alternatively, reduce sidebar width for single-link roles

---

## Phase 6 — Minor Polish

### 6.1 Consistent empty-state styling
**Files:** transcript, advisor inbox, sections table, audit log
**Problem:** Empty states across pages differ — some are centered with `var(--text-muted)`, some are left-aligned plain text, some are missing entirely.
**Sub-tasks:**
- [ ] Define one empty-state pattern: centered, `var(--text-muted)`, 13px, 30px vertical padding
- [ ] Apply to all table empty states and the transcript page

### 6.2 `fontWeight: 510` — verify browser support
**Files:** all client components
**Problem:** `510` is a non-standard variable font weight. Falls back to `500` in non-variable font stacks. Inconsistent rendering across machines without the project's font loaded.
**Sub-tasks:**
- [ ] Audit which font is loaded and confirm it supports intermediate weights
- [ ] If not, normalize to `500` or `600` throughout

### 6.3 No dark/light mode toggle
**File:** `app/globals.css`
**Problem:** Design is dark-only. No `prefers-color-scheme` media query. Not critical for demo but worth noting.
**Sub-tasks:**
- [ ] (Optional / post-submission) Add a light theme token set and toggle button in header

---

## Order of Attack (when coding starts)

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
```

Phase 1 is the only one that causes broken rendering visible in a demo. Fix it first.
Phases 2–5 are all self-contained file edits. No shared state changes.
Phase 6 is cosmetic — do last or skip if time is short.
