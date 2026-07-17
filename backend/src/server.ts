import { createApp } from './lib/app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Partnership CRM API running on http://localhost:${env.PORT}`);
});
