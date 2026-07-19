import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { idParamSchema, completeReminderBodySchema } from './validators.js';
import { assertOwnerOrAdmin } from '../lib/authz.js';

export const reminderRouter = Router();

reminderRouter.use(requireAuth);

reminderRouter.get('/', async (request, response) => {
  // Reminders are stored as Organization.reminderStatus/message/date fields.
  const organizations = await prisma.organization.findMany({
    where: {
      ownerId: request.user!.userId,
    },
    orderBy: { reminderDate: 'asc' },
  });

  const items = organizations.map((o) => ({
    id: o.id,
    reminderStatus: o.reminderStatus,
    reminderDate: o.reminderDate,
    reminderMessage: o.reminderMessage,
    organizationId: o.id,
    organizationName: o.name,
  }));

  response.json({ items });
});

reminderRouter.patch('/:id/complete', async (request, response) => {
  const parsedId = idParamSchema.safeParse(request.params);
  if (!parsedId.success) {
    throw parsedId.error;
  }

  const parsedBody = completeReminderBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    throw parsedBody.error;
  }

  const organization = await prisma.organization.findUnique({
    where: { id: parsedId.data.id },
  });

  if (!organization) {
    response.status(404).json({ message: 'Reminder not found', code: 'NOT_FOUND' });
    return;
  }

  assertOwnerOrAdmin(request, organization.ownerId);

  const updated = await prisma.organization.update({
    where: { id: parsedId.data.id },
    data: {
      reminderStatus: 'Done',
    },
  });

  response.json({
    item: {
      id: updated.id,
      reminderStatus: updated.reminderStatus,
      reminderDate: updated.reminderDate,
      reminderMessage: updated.reminderMessage,
    },
  });
});

