import { z } from 'zod';
import { BudgetPeriod } from '@prisma/client';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .transform((val) => new Date(`${val}T00:00:00.000Z`));

export const createBudgetSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').trim(),
    amount: z.coerce.number().positive('Amount must be greater than zero'),
    categoryId: z.string().uuid('Invalid category ID format').optional(),
    period: z.nativeEnum(BudgetPeriod),
    startDate: dateString,
    endDate: dateString.optional(),
    alertThreshold: z.coerce.number().int().min(1).max(100).optional(),
    currency: z.string().length(3).optional(),
  })
  .refine((data) => data.period !== 'CUSTOM' || !!data.endDate, {
    message: 'endDate is required when period is CUSTOM',
    path: ['endDate'],
  });

export const updateBudgetSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  amount: z.coerce.number().positive().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  period: z.nativeEnum(BudgetPeriod).optional(),
  startDate: dateString.optional(),
  endDate: dateString.nullable().optional(),
  alertThreshold: z.coerce.number().int().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  currency: z.string().length(3).optional(),
});

export const budgetIdSchema = z.object({
  id: z.string().uuid('Invalid budget ID format (must be UUID)'),
});

export const budgetQuerySchema = z.object({
  categoryId: z.string().uuid('Invalid category ID format').optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
