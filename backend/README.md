# Partnership CRM — Backend API

Express + TypeScript REST API for the Partnership CRM, backed by PostgreSQL via Prisma ORM.

---

## 🧱 Stack

| Component       | Technology                        |
|-----------------|-----------------------------------|
| Runtime         | Node.js (>= 18)                   |
| Framework       | Express 4                         |
| Language        | TypeScript 5                      |
| Database        | PostgreSQL via Prisma ORM         |
| Authentication  | JWT (bcrypt + jsonwebtoken)       |
| Validation      | Zod                               |
| Dev Runner      | tsx (TypeScript watch mode)       |

---

## 📁 API Endpoints

### Root

| Method | Path       | Description              |
|--------|------------|--------------------------|
| GET    | `/`        | API info & version       |
| GET    | `/health`  | Health check             |

### Auth

| Method | Path           | Auth Required | Description              |
|--------|----------------|---------------|--------------------------|
| POST   | `/auth/signup` | No            | Create a new user        |
| POST   | `/auth/login`  | No            | Login and get JWT token  |
| GET    | `/auth/me`     | Yes (Bearer)  | Get current user session |

### Organizations

| Method | Path                 | Auth Required | Role Required | Description              |
|--------|----------------------|---------------|---------------|--------------------------|
| GET    | `/organizations`     | Yes           | —             | List user's organizations|
| POST   | `/organizations`     | Yes           | Admin         | Create an organization   |
| GET    | `/organizations/:id` | Yes           | —             | Get organization by ID   |
| PATCH  | `/organizations/:id` | Yes           | Admin         | Update organization      |

### Reminders

| Method | Path                         | Auth Required | Description                       |
|--------|------------------------------|---------------|-----------------------------------|
| GET    | `/reminders`                 | Yes           | List reminders (sorted by date)   |
| PATCH  | `/reminders/:id/complete`    | Yes           | Mark a reminder as done           |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL (optional — runs in dev fallback mode without it)

### Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/partnership_crm"
JWT_ACCESS_SECRET="your-random-secret-here"
JWT_ACCESS_TTL="1h"
PORT=4000
CORS_ORIGIN="http://localhost:5173,http://127.0.0.1:5173"
```

### Database Migration (if PostgreSQL is available)

```bash
npx prisma migrate dev
```

### Start Development Server

```bash
npm run dev
```

Server starts on `http://localhost:4000`.

---

## 💡 Dev Fallback Mode

When PostgreSQL is unavailable, the backend automatically falls back to a **file-based dev auth store** (`os.tmpdir()/partnership-crm-dev-auth-users.json`). This allows you to:

- Sign up and log in without a database
- Test the full auth flow locally
- Switch seamlessly when PostgreSQL becomes available

The server logs a warning when running in fallback mode.

---

## 🛠️ Scripts

| Script                 | Description                                    |
|------------------------|------------------------------------------------|
| `npm run dev`          | Start with tsx watch (hot reload)              |
| `npm run build`        | Compile TypeScript + generate Prisma client    |
| `npm run start`        | Start compiled production server               |
| `npm run prisma:generate` | Generate Prisma client from schema          |
| `npm run prisma:migrate`  | Run Prisma migrations (dev)                 |
| `npm run prisma:studio`   | Open Prisma Studio (GUI database browser)   |

---

## 🧪 Error Handling

All API errors follow a consistent JSON structure:

```json
{
  "message": "Human-readable error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common error codes:
- `VALIDATION_ERROR` — Invalid request payload (400)
- `UNAUTHORIZED` — Missing or invalid token (401)
- `FORBIDDEN` — Insufficient permissions (403)
- `NOT_FOUND` — Resource not found (404)
- `CONFLICT` — Duplicate resource (409)
- `DATABASE_UNAVAILABLE` — PostgreSQL connection failed (503)
- `TOKEN_SECRET_MISSING` — JWT secret not configured (500)

---

## 📄 License

MIT
