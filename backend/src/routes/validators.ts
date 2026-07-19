import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const listOrganizationsQuerySchema = z.object({
  // future-proof for pagination/filtering
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const createOrganizationBodySchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(['University', 'Startup', 'Mentor', 'Partner']),
  stage: z.enum(['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Active']),
  priority: z.enum(['High', 'Medium', 'Low']),
  health: z.coerce.number().int().min(0).max(100),
  website: z.string().min(1).max(500),
  location: z.string().min(1).max(300),
  summary: z.string().min(1).max(2000),
  lastTouch: z.coerce.date().optional(),
  nextFollowUp: z.coerce.date().optional(),
  reminderDate: z.coerce.date().optional(),
  reminderMessage: z.string().min(1).max(2000),
});

export const updateOrganizationBodySchema = createOrganizationBodySchema
  .partial()
  .extend({
    reminderStatus: z.enum(['Open', 'Done']).optional(),
  })
  .refine(
    (v) => Object.keys(v).length > 0,
    { message: 'At least one field must be provided' },
  );

export const completeReminderBodySchema = z.object({
  status: z.enum(['Done']).optional(),
});

