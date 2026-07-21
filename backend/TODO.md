# TODO - Backend Partnership CRM

## Phase 0: Foundation
- [x] Add centralized error handling middleware.
- [x] Ensure `/api` mounting alignment with frontend (Vite proxy `/api/*` → backend without prefix, backend mounts at `/auth`, `/organizations`, `/reminders`).

## Phase 1: Organizations
- [x] Implement `GET /api/organizations` list for authenticated user/admin.
- [x] Implement `POST /api/organizations` create with zod validation.
- [x] Implement `GET /api/organizations/:id` detail with authZ (owner/admin).
- [x] Implement `PATCH /api/organizations/:id` update with zod validation and authZ.

## Phase 2: Reminders
- [x] Implement `GET /api/reminders` query.
- [x] Implement `PATCH /api/reminders/:id/complete` update reminder status.

## Phase 3: Production polish
- [x] Prisma client lifecycle fixes (hot reload safe) — globalThis singleton pattern.
- [x] Graceful shutdown hooks on server exit — SIGTERM/SIGINT handlers with Prisma disconnect.
- [x] Prisma postinstall script for automatic client generation.
