import { z } from 'zod';
import { IncomeSource } from '@prisma/client';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .transform((val) => new Date(`${val}T00:00:00.000Z`));

export const createIncomeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters').trim(),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').trim().optional(),
  transactionDate: dateString,
  source: z.nativeEnum(IncomeSource).optional(),
  currency: z.string().length(3).optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export const incomeIdSchema = z.object({
  id: z.string().uuid('Invalid income ID format (must be UUID)'),
});

export const incomeQuerySchema = z.object({
  source: z.nativeEnum(IncomeSource).optional(),
  startDate: dateString.optional(),
  endDate: dateString.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const summaryQuerySchema = z.object({
  startDate: dateString.optional(),
  endDate: dateString.optional(),
});
