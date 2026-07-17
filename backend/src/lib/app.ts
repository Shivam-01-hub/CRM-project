import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { authRouter } from '../routes/auth.js';
import { organizationRouter } from '../routes/organizations.js';
import { reminderRouter } from '../routes/reminders.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use('/auth', authRouter);
  app.use('/organizations', organizationRouter);
  app.use('/reminders', reminderRouter);

  app.use((_request, response) => {
    response.status(404).json({ message: 'Route not found' });
  });

  return app;
}
