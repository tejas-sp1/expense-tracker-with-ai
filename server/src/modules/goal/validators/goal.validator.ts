import { z } from 'zod';
import { GoalStatus } from '@prisma/client';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .transform((val) => new Date(`${val}T00:00:00.000Z`));

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').trim(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').trim().optional(),
  targetAmount: z.coerce.number().positive('Target amount must be greater than zero'),
  targetDate: dateString.optional(),
  initialAmount: z.coerce.number().min(0).optional(),
  currency: z.string().length(3).optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).trim().nullable().optional(),
  targetAmount: z.coerce.number().positive().optional(),
  targetDate: dateString.nullable().optional(),
  status: z.nativeEnum(GoalStatus).optional(),
  currency: z.string().length(3).optional(),
});

export const contributeGoalSchema = z.object({
  amount: z.coerce.number().refine((v) => v !== 0, 'Amount must not be zero'),
});

export const goalIdSchema = z.object({
  id: z.string().uuid('Invalid goal ID format (must be UUID)'),
});

export const goalQuerySchema = z.object({
  status: z.nativeEnum(GoalStatus).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
