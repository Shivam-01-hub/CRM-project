import { createApp } from './lib/app.js';
import { env } from './config/env.js';
import { assertDatabaseConnection } from './lib/health.js';
import { disconnectPrisma } from './lib/prisma.js';

const app = createApp();

/**
 * Gracefully shut down the HTTP server and database connection.
 *
 * - Closes the HTTP server so no new requests are accepted.
 * - Disconnects Prisma so PostgreSQL frees the connection pool.
 * - Exits the process to hand control back to the orchestrator (Docker, Render, etc.).
 */
async function shutdown(signal: string, server: ReturnType<typeof app.listen>) {
  console.log(`\nReceived ${signal}. Starting graceful shutdown…`);

  server.close(() => {
    console.log('HTTP server closed.');
  });

  try {
    await disconnectPrisma();
    console.log('Prisma disconnected.');
  } catch (error) {
    console.error('Error during Prisma disconnect:', error);
  }

  process.exit(0);
}

async function start() {
  if (!env.JWT_ACCESS_SECRET) {
    console.error('Missing JWT_ACCESS_SECRET. Auth endpoints will fail with 500 until you set it in .env');
  }

  try {
    await assertDatabaseConnection();

    const port = Number(process.env.PORT) || 4000;
    const server = app.listen(port, () => {
      console.log(`Partnership CRM API running on http://localhost:${port}`);
    });

    // Graceful shutdown hooks
    process.on('SIGTERM', () => void shutdown('SIGTERM', server));
    process.on('SIGINT', () => void shutdown('SIGINT', server));
  } catch (error) {

    if (process.env.NODE_ENV === 'production') {
      console.error('Failed to start API server. Check DATABASE_URL and PostgreSQL availability.');
      console.error(error);
      process.exit(1);
    }

    console.warn('PostgreSQL is unavailable. Starting in development fallback mode for auth.');
    const server = app.listen(env.PORT, () => {
      console.log(`Partnership CRM API running on http://localhost:${env.PORT} (dev fallback mode)`);
    });

    // Even in fallback mode, register shutdown hooks to clean up the dev-auth-store file handle.
    process.on('SIGTERM', () => void shutdown('SIGTERM', server));
    process.on('SIGINT', () => void shutdown('SIGINT', server));
  }
}

void start();
