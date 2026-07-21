# Partnership CRM

A professional-grade **Partner Relationship Management** (PRM) dashboard for tracking universities, startups, mentors, and partner organizations — built with modern full-stack JavaScript.

---

## 🚀 Features

- **Pipeline Management** — Track organizations through Discovery → Qualified → Proposal → Negotiation → Active stages
- **Follow-up Queue** — Smart reminders with due dates and status tracking (Open / Done)
- **Contact Management** — Store contacts, preferred channels, and interaction history
- **Meeting Logging** — Record meeting outcomes and next steps
- **Notes System** — Add, edit, and delete contextual notes per organization
- **Health Scoring** — At-a-glance relationship health metrics
- **Authentication** — JWT-based login/signup with role-based access (admin/user)
- **Offline Demo Mode** — Guest access without a database (dev fallback)
- **Search & Filtering** — Full-text search across organizations and stage-based filtering

---

## 🧱 Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | React 18, TypeScript, Vite 5                    |
| Backend     | Node.js, Express 4, TypeScript                  |
| Database    | PostgreSQL via Prisma ORM                       |
| Auth        | JWT (bcrypt + jsonwebtoken)                     |
| Validation  | Zod                                             |
| Dev Tools   | concurrently, tsx (watch mode)                  |

---

## 📁 Project Structure

```
partnership-crm/
├── src/                          # Frontend source
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # React entry point
│   ├── styles.css                # Global styles (dark theme)
│   ├── types/crm.ts              # Shared TypeScript types
│   ├── lib/
│   │   ├── api.ts                # API client (fetch wrapper)
│   │   └── helpers.ts            # Date, ID, and utility functions
│   ├── components/
│   │   ├── AuthScreen.tsx        # Login / Signup UI
│   │   ├── DashboardHeader.tsx   # Search bar, stats, user menu
│   │   ├── Sidebar.tsx           # Stage mix, reminder queue
│   │   ├── AddPartnerForm.tsx    # New partner intake form
│   │   ├── PipelineList.tsx      # Organization cards grid
│   │   ├── FollowUpQueue.tsx     # Priority follow-ups list
│   │   └── DetailPanel.tsx       # Org details, notes, reminders
│   └── data/
│       └── seed-organizations.json
├── backend/                      # Backend source
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── src/
│   │   ├── server.ts             # Entry point + graceful shutdown
│   │   ├── config/env.ts         # Environment variable loader
│   │   ├── lib/
│   │   │   ├── app.ts            # Express app factory
│   │   │   ├── prisma.ts         # Prisma client singleton
│   │   │   ├── authz.ts          # Authorization helpers
│   │   │   ├── api-errors.ts     # Structured error classes
│   │   │   ├── errors.ts         # Error normalizer
│   │   │   ├── guards.ts         # Role guard functions
│   │   │   ├── health.ts         # DB health check
│   │   │   └── dev-auth-store.ts # File-based dev auth fallback
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT auth middleware
│   │   │   ├── error-handler.ts  # Central error handler
│   │   │   └── roles.ts          # Role-based access middleware
│   │   └── routes/
│   │       ├── auth.ts           # POST /auth/signup, /auth/login, GET /auth/me
│   │       ├── organizations.ts  # CRUD /organizations
│   │       ├── reminders.ts      # GET /reminders, PATCH /reminders/:id/complete
│   │       └── validators.ts     # Zod schemas for request validation
│   └── .env.example              # Backend env template
├── .env.example                  # Frontend env template
├── .gitignore
├── package.json                  # Root workspace scripts
├── vite.config.ts                # Vite config with API proxy
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** (optional — backend runs in dev fallback mode without it)

### 1. Clone & Install Dependencies

```bash
cd partnership-crm
npm install
cd backend && npm install && cd ..
```

### 2. Configure Environment Variables

```bash
# Frontend (root)
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set your PostgreSQL connection string and JWT secret:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/partnership_crm"
JWT_ACCESS_SECRET="your-random-secret-here"
```

### 3. Initialize the Database (Optional)

If PostgreSQL is available:

```bash
cd backend
npx prisma migrate dev
cd ..
```

### 4. Start Development Servers

```bash
npm run dev
```

This starts both servers concurrently:

| Server   | URL                          | Port |
|----------|------------------------------|------|
| Frontend | `http://localhost:5173`      | 5173 |
| Backend  | `http://localhost:4000`      | 4000 |

The frontend proxies `/api/*` requests to the backend automatically.

---

## 🧪 Running Separately

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

---

## 🏗️ Production Build

```bash
# Build frontend
npm run build

# Build backend
cd backend && npm run build && cd ..
```

Output:
- Frontend: `dist/` (static files for Vercel, Netlify, etc.)
- Backend: `backend/dist/` (Node.js server)

---

## 🔐 Authentication Flow

1. **Signup** — POST `/auth/signup` with `{ name, email, password }`
2. **Login** — POST `/auth/login` with `{ email, password }`
3. **Session** — Token stored in `localStorage`, sent as `Authorization: Bearer <token>`
4. **Guest Mode** — Click "Continue as Guest" for offline demo without backend

---

## 🐳 Database Schema

The Prisma schema includes these models:

- **User** — id, name, email, passwordHash, role (admin/user)
- **Organization** — name, type, stage, priority, health, reminders, relationships
- **Contact** — name, role, email, phone, preferredChannel
- **Meeting** — date, subject, outcome, nextStep
- **Note** — author, body, tag, timestamps
- **OrganizationTag** — key-value tags per organization

---

## 📜 Scripts Reference

| Script              | Description                                      |
|---------------------|--------------------------------------------------|
| `npm run dev`       | Start frontend + backend concurrently            |
| `npm run dev:frontend` | Start Vite dev server on port 5173            |
| `npm run dev:backend`  | Start backend with tsx watch on port 4000     |
| `npm run build`     | Production build for frontend                    |
| `npm run preview`   | Preview production build locally                 |

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
