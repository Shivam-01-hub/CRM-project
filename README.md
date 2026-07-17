# Partnership CRM

Partnership CRM is a React + Vite + TypeScript dashboard for managing universities, startups, mentors, and partner organizations in one place.

## What it does

- Tracks organizations, contacts, meetings, notes, and next steps
- Surfaces follow-ups that need attention soon
- Shows pipeline stages and relationship health at a glance
- Lets the team update stages, add notes, and push follow-ups forward

## Screenshots

Add production screenshots here once the app is deployed or captured from a local preview.

- `docs/screenshots/dashboard.png` - main pipeline view
- `docs/screenshots/detail-panel.png` - organization detail view
- `docs/screenshots/new-partner-form.png` - intake form state

## Local setup

```bash
npm install
npm run dev
```

Frontend auth requests use `/api` in local development, and Vite proxies that to the backend on port `4000`. For production, set `VITE_API_URL` to your deployed backend URL.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Project notes

- Seed data lives in `src/data/seed-organizations.json`
- App state persists in `localStorage`
- The main dashboard is split into reusable sidebar and header components under `src/components/`
- The backend scaffold lives in `backend/` and is set up for Express, JWT auth, Prisma, and PostgreSQL

## Next steps

The app is a strong frontend prototype. The most important production upgrade is to add authentication, a database, and deployment so the CRM becomes a real multi-user product.

### Recommended stack

- Authentication: JWT login and signup
- Database: PostgreSQL
- Backend API: Node.js + Express
- Frontend deployment: Vercel
- Backend deployment: Render
- Database hosting: Managed Postgres

### Production phases

1. Add auth and user roles so admins and standard users can access different CRM data.
2. Move organizations, contacts, meetings, notes, and reminders into PostgreSQL.
3. Expose REST endpoints for search, filtering, CRUD, and reminder workflows.
4. Add email or push reminders from the backend.
5. Deploy frontend and backend separately with environment-specific configuration.
