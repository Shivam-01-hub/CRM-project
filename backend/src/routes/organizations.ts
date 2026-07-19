import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { assertOwnerOrAdmin } from '../lib/authz.js';
import {
  createOrganizationBodySchema,
  idParamSchema,
  listOrganizationsQuerySchema,
  updateOrganizationBodySchema,
} from './validators.js';

export const organizationRouter = Router();

organizationRouter.use(requireAuth);

organizationRouter.get('/', async (request, response) => {
  const parsed = listOrganizationsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw parsed.error;
  }

  const { limit, offset } = parsed.data;

  const organizations = await prisma.organization.findMany({
    where: {
      ownerId: request.user!.userId,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  response.json({ items: organizations });
});

organizationRouter.post('/', requireRole('admin'), async (request, response) => {
  const parsed = createOrganizationBodySchema.safeParse(request.body);
  if (!parsed.success) {
    throw parsed.error;
  }

  const userId = request.user!.userId;

  const organization = await prisma.organization.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      stage: parsed.data.stage,
      ownerId: userId,
      priority: parsed.data.priority,
      health: parsed.data.health,
      website: parsed.data.website,
      location: parsed.data.location,
      summary: parsed.data.summary,
      lastTouch: parsed.data.lastTouch ?? new Date(),
      nextFollowUp: parsed.data.nextFollowUp ?? new Date(),
      reminderDate: parsed.data.reminderDate ?? new Date(),
      reminderMessage: parsed.data.reminderMessage,
      reminderStatus: 'Open',
    },
  });

  response.status(201).json({ item: organization });
});

organizationRouter.get('/:id', async (request, response) => {
  const parsed = idParamSchema.safeParse(request.params);
  if (!parsed.success) {
    throw parsed.error;
  }

  const organization = await prisma.organization.findUnique({
    where: { id: parsed.data.id },
  });

  if (!organization) {
    response.status(404).json({ message: 'Organization not found', code: 'NOT_FOUND' });
    return;
  }

  assertOwnerOrAdmin(request, organization.ownerId);

  response.json({ item: organization });
});

organizationRouter.patch('/:id', requireRole('admin'), async (request, response) => {
  const parsedId = idParamSchema.safeParse(request.params);
  if (!parsedId.success) {
    throw parsedId.error;
  }

  const parsedBody = updateOrganizationBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    throw parsedBody.error;
  }

  const existing = await prisma.organization.findUnique({
    where: { id: parsedId.data.id },
  });

  if (!existing) {
    response.status(404).json({ message: 'Organization not found', code: 'NOT_FOUND' });
    return;
  }

  // Admin-only route: still enforce owner/admin in case role rules evolve.
  assertOwnerOrAdmin(request, existing.ownerId);

  const organization = await prisma.organization.update({
    where: { id: parsedId.data.id },
    data: {
      ...('name' in parsedBody.data ? { name: parsedBody.data.name } : {}),
      ...('type' in parsedBody.data ? { type: parsedBody.data.type } : {}),
      ...('stage' in parsedBody.data ? { stage: parsedBody.data.stage } : {}),
      ...('priority' in parsedBody.data ? { priority: parsedBody.data.priority } : {}),
      ...('health' in parsedBody.data ? { health: parsedBody.data.health } : {}),
      ...('website' in parsedBody.data ? { website: parsedBody.data.website } : {}),
      ...('location' in parsedBody.data ? { location: parsedBody.data.location } : {}),
      ...('summary' in parsedBody.data ? { summary: parsedBody.data.summary } : {}),
      ...('lastTouch' in parsedBody.data ? { lastTouch: parsedBody.data.lastTouch } : {}),
      ...('nextFollowUp' in parsedBody.data ? { nextFollowUp: parsedBody.data.nextFollowUp } : {}),
      ...('reminderDate' in parsedBody.data ? { reminderDate: parsedBody.data.reminderDate } : {}),
      ...('reminderMessage' in parsedBody.data ? { reminderMessage: parsedBody.data.reminderMessage } : {}),
      ...('reminderStatus' in parsedBody.data ? { reminderStatus: parsedBody.data.reminderStatus } : {}),
    } as any,
  });

  response.json({ item: organization });
});

