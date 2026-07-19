# TODO - Partnership CRM

## Backend
- [x] Add centralized error handling middleware (normalize Zod/Prisma/JWT errors; consistent JSON error shape).

- [ ] Refactor auth, organizations, reminders routes to rely on error middleware (remove repetitive try/catch where safe).
- [ ] (Next after error middleware) Implement organizations endpoints with Prisma + zod validation.
- [ ] (Next after organizations) Implement reminders endpoints with Prisma + business rules.
- [ ] Verify API path alignment between frontend and backend (`/api` proxy + server route mounts).
- [ ] Improve Prisma client lifecycle + graceful shutdown.

## Frontend
- [ ] Modularize API layer by domain (auth/organizations/reminders) once backend endpoints are completed.
- [ ] Replace local-only organization state with API-backed calls incrementally.

