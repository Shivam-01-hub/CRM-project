import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from '../config/env.js';
import { authRouter } from '../routes/auth.js';
import { organizationRouter } from '../routes/organizations.js';
import { reminderRouter } from '../routes/reminders.js';
import { errorHandler } from '../middleware/error-handler.js';

export function createApp() {
  const app = express();
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin: string) => origin.trim()).filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get('/', (_request, response) => {
    response.json({
      service: 'Partnership CRM API',
      status: 'running',
      version: '0.1.0',
      docs: {
        health: '/health',
        auth: '/auth (login, signup, me)',
        organizations: '/organizations',
        reminders: '/reminders',
      },
    });
  });

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use('/auth', authRouter);
  app.use('/organizations', organizationRouter);
  app.use('/reminders', reminderRouter);

  app.use((_request, response) => {
    response.status(404).json({ message: 'Route not found', code: 'NOT_FOUND' });
  });

  // Central error handler (must be registered after routes)
  app.use(errorHandler);

  return app;
}
