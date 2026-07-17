import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export const reminderRouter = Router();

reminderRouter.use(requireAuth);

reminderRouter.get('/', (_request, response) => {
  response.json({
    items: [],
    message: 'Reminder queries will be backed by PostgreSQL and a scheduled job.',
  });
});

reminderRouter.patch('/:id/complete', (_request, response) => {
  response.json({ message: 'Reminder completion endpoint scaffolded.' });
});
