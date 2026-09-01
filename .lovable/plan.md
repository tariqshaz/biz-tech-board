# OpenBoard — Kanban app work plan

## Verdict

Yes, this is very buildable. One correction up front: inside Lovable we don't use Fastify/Electron/Prisma/SQLite. The equivalent stack here is React + TypeScript + TanStack Start (server functions instead of Express/Fastify) + Tailwind + dnd-kit + Lovable Cloud (managed Postgres, auth, storage, realtime, AI). Same architecture, same feature set, far less setup — and it's portable Postgres underneath, so nothing is a dead end. A native Tauri+SQLite build isn't supported here, but a distributable desktop app **is** achievable via Electron packaging (`@electron/packager`), which produces a standalone app from the same Vite build — see M9.

## Milestones

**M1 — Board that actually works (1 session)**
Design system (dark-first, mobile-friendly), one board, columns, cards, add/rename/delete, dnd-kit drag between columns and reorder, persisted in local storage so a reload keeps state. Fun part first, no login.

**M2 — Card system (1 session)**
Card detail dialog: description, labels/colors, due dates, checklists, delete. Column reorder. Search/filter across the board.

**M3 — Cloud + accounts (1 session)**
Enable Lovable Cloud. Tables: profiles, workspaces, boards, lists, cards, labels, card_labels, checklist_items, comments, board_members, activity. RLS on every table via a membership helper function. Email/password auth, protected routes, migrate M1/M2 data model to the database with optimistic updates.

**M4 — Multiple boards & workspaces (1 session)**
Workspace switcher, board grid, member invites, roles (owner/admin/member/guest) in a separate role table, permission-aware UI.

**M5 — Collaboration (1–2 sessions)**
Realtime board sync, comments, @mentions, assignees, activity feed, notifications.

**M6 — Views (1 session)**
Same data as Kanban / table / calendar / timeline.

**M7 — AI (ongoing)**
"Create a project from a prompt" → generates lists + cards; "break this card into a checklist"; "what should I work on today?" ranked by due date, priority, and staleness. Runs through the built-in AI gateway, no API key needed.

**M8 — Polish & ship**
PWA/offline cache, keyboard accessibility, empty states, SEO metadata, publish.

**M9 — Distributable desktop app (.exe) (1 session)**
Package the finished web app as a standalone desktop application using Electron + `@electron/packager`. Produces installable/standalone builds for Windows (`.exe`/zip), macOS (zip), and Linux (`.tar.gz`). Done only after the web app is feature-complete so the desktop build ships the same product. See the electron-desktop-app build notes: set `base: './'` in `vite.config.ts`, `electron/main.cjs` (CommonJS), `@electron/packager` (not electron-builder), and archive outputs to `/mnt/documents` for download.

## Timeline

Each milestone above is roughly one working session with me. Calendar-wise, at 1–3 hours/day: usable Kanban day 1, M1–M4 (real multi-user app) within about a week, M1–M6 in two to three weeks, AI and polish continuing after that, then the desktop build (M9) once the web app is final.

## Technical notes

- Drag and drop: `@dnd-kit/core` + `@dnd-kit/sortable`, fractional `position` floats so a move is a single-row update.
- Data: TanStack Query for reads, optimistic mutations for drag so the board never flickers.
- Server logic: `createServerFn` for anything privileged (invites, AI calls); direct client reads through RLS for board data.
- Security: roles in a dedicated `user_roles` table checked by a security-definer function — never a column on profiles.
- Ordering: reads live in route loaders via `ensureQueryData` for instant first paint.
- Desktop packaging (M9): `@electron/packager` bundles the Vite build into a standalone app; set `base: './'` so assets load under `file://`, use `electron/main.cjs` (CommonJS) with `contextIsolation: true` + `nodeIntegration: false`. Archive per-OS outputs to `/mnt/documents` for download.

## Starting point

I'd start M1 now: design system plus a fully working single board with drag-and-drop and local persistence, so you can use it the same day before any backend exists.
