# Partnership CRM Backend

Express + TypeScript API for the Partnership CRM.

## Stack

- Node.js + Express
- PostgreSQL via Prisma
- JWT authentication
- Role-based access control

## Scripts

```bash
npm install
npm run dev
npm run build
npm run prisma:generate
npm run prisma:migrate
```

## Environment

Copy `.env.example` to `.env` and set your production values.

## Local development

Run the backend with:

```bash
npm run dev
```

The frontend calls `/api` during local development, and Vite proxies those requests to this backend on port `4000`.

Make sure PostgreSQL is running before starting the server. The API checks the database connection at boot and exits early if `DATABASE_URL` is wrong or the database is offline.
