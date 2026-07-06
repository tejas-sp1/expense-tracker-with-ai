import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .transform((val) => new Date(`${val}T00:00:00.000Z`));

export const createExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters').trim(),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').trim().optional(),
  transactionDate: dateString,
  categoryId: z.string().uuid('Invalid category ID format (must be UUID)'),
  merchantName: z.string().max(100, 'Merchant name cannot exceed 100 characters').trim().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseIdSchema = z.object({
  id: z.string().uuid('Invalid expense ID format (must be UUID)'),
});

export const expenseQuerySchema = z.object({
  categoryId: z.string().uuid('Invalid category ID format').optional(),
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
