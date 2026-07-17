import { createApp } from './lib/app.js';
import { env } from './config/env.js';
import { assertDatabaseConnection } from './lib/health.js';

const app = createApp();

async function start() {
  try {
    await assertDatabaseConnection();

    app.listen(env.PORT, () => {
      console.log(`Partnership CRM API running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start API server. Check DATABASE_URL and PostgreSQL availability.');
    console.error(error);
    process.exit(1);
  }
}

void start();
