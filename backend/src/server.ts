import { createApp } from './lib/app.js';
import { env } from './config/env.js';
import { assertDatabaseConnection } from './lib/health.js';

const app = createApp();

async function start() {
  if (!env.JWT_ACCESS_SECRET) {
    console.error('Missing JWT_ACCESS_SECRET. Auth endpoints will fail with 500 until you set it in .env');
  }

  try {
    await assertDatabaseConnection();

    app.listen(env.PORT, () => {
      console.log(`Partnership CRM API running on http://localhost:${env.PORT}`);
    });
  } catch (error) {

    if (process.env.NODE_ENV === 'production') {
      console.error('Failed to start API server. Check DATABASE_URL and PostgreSQL availability.');
      console.error(error);
      process.exit(1);
    }

    console.warn('PostgreSQL is unavailable. Starting in development fallback mode for auth.');
    app.listen(env.PORT, () => {
      console.log(`Partnership CRM API running on http://localhost:${env.PORT} (dev fallback mode)`);
    });
  }
}

void start();
