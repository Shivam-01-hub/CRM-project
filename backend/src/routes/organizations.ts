import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

export const organizationRouter = Router();

organizationRouter.use(requireAuth);

organizationRouter.get('/', (_request, response) => {
  response.json({
    items: [],
    message: 'Organizations endpoint scaffolded. Connect this to PostgreSQL queries next.',
  });
});

organizationRouter.post('/', requireRole('admin'), (_request, response) => {
  response.status(201).json({ message: 'Create organization endpoint scaffolded.' });
});

organizationRouter.get('/:id', (_request, response) => {
  response.json({ message: 'Organization detail endpoint scaffolded.' });
});

organizationRouter.patch('/:id', requireRole('admin'), (_request, response) => {
  response.json({ message: 'Update organization endpoint scaffolded.' });
});
