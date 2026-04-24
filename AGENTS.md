# Repository Guidelines

## Project Structure & Module Organization
`app/` contains the Next.js App Router UI and API routes. Route groups such as `app/(student)`, `app/(advisor)`, and `app/(admin)` separate role-specific pages, while `app/api/` holds server endpoints. Reusable UI lives in `components/`, shared server logic in `lib/`, Prisma schema, migrations, and seed data in `prisma/`, and type augmentations in `types/`. Unit tests currently live in `tests/`, and static assets belong in `public/`. Project notes and design docs are under `docs/`.

## Build, Test, and Development Commands
Use `npm run dev` to start the local Next.js app, `npm run build` to verify a production build, and `npm run start` to serve the built app. Run `npm run lint` for ESLint checks and `npm run test` for the Vitest suite. Database changes should go through Prisma: `npx prisma migrate dev` creates and applies a migration, and `npx prisma db seed` loads seed data from `prisma/seed.ts`.

## Coding Style & Naming Conventions
This repo uses TypeScript with `strict` mode and the `@/*` path alias. Follow the existing style: 2-space indentation, double quotes, and no semicolons. Keep React components and layout files in PascalCase where they are shared (`components/ScheduleGrid.tsx`), and use framework conventions for route files (`page.tsx`, `layout.tsx`, `route.ts`). Put shared business rules in `lib/` rather than duplicating them across pages and APIs.

## Testing Guidelines
Vitest runs in a Node environment. Add tests in `tests/` with the `*.test.ts` naming pattern shown by `tests/validator.test.ts`. Prefer focused unit tests for validator, auth, and database-adjacent logic, and cover both success and rejection paths for enrollment rules. Run `npm run test` before opening a PR.

## Commit & Pull Request Guidelines
Current history uses short, imperative commit subjects such as `Add .gitignore with worktrees...` and `Initial commit: docs...`. Keep that pattern: start with a verb, describe the behavior change, and keep the subject concise. PRs should explain the user-facing impact, list any schema or env changes, link the related issue if one exists, and include screenshots for UI updates across student, advisor, or admin screens.

## Security & Configuration Tips
Do not commit `.env` or `.env.local` secrets. When changing auth, middleware, or Prisma schema, document required environment variables and migration steps in the PR so others can reproduce the setup safely.
