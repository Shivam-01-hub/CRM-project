# Full-Stack Roadmap

Recommended direction for turning Partnership CRM into a production app:

## Chosen stack

- Frontend: React + Vite + TypeScript
- Auth: JWT login/signup
- API: Node.js + Express
- Database: PostgreSQL
- Frontend deployment: Vercel
- Backend deployment: Render
- Database hosting: Managed Postgres

## Phase 1: Authentication

- Add user registration and login endpoints.
- Issue JWT access tokens from the backend.
- Protect CRM routes with authenticated requests.
- Add roles for `admin` and `user`.

## Phase 2: Database

- Model organizations, contacts, meetings, notes, follow-ups, and reminders in PostgreSQL.
- Replace `localStorage` persistence with API-backed storage.
- Add migrations and seed scripts.

## Phase 3: Backend API

- Build REST endpoints for CRUD operations.
- Add query parameters for search and filtering.
- Include endpoints for reminders and note updates.
- Return role-aware data based on the signed-in user.

## Phase 4: Notifications

- Send email reminders for upcoming follow-ups.
- Optionally add push notifications later.
- Run reminder jobs on a schedule.

## Phase 5: Deployment

- Deploy the frontend to Vercel.
- Deploy the backend API to Render.
- Use a managed PostgreSQL instance for production.
- Configure environment variables for tokens, database URLs, and email credentials.

## Suggested endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `GET /organizations`
- `POST /organizations`
- `GET /organizations/:id`
- `PATCH /organizations/:id`
- `POST /organizations/:id/notes`
- `POST /organizations/:id/meetings`
- `GET /reminders`
- `PATCH /reminders/:id`

## Suggested tables

- `users`
- `organizations`
- `contacts`
- `meetings`
- `notes`
- `reminders`
- `organization_tags`
