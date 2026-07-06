import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50).trim(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code')
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryIdSchema = z.object({
  id: z.string().uuid(),
});
