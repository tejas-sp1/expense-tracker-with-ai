import { Category, Prisma } from '@prisma/client';

export interface ICategoryRepository {
  create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByUserAndSlug(userId: string, slug: string): Promise<Category | null>;
  findByUser(userId: string): Promise<Category[]>;
  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
  softDelete(id: string): Promise<Category>;
  countExpenses(id: string): Promise<number>;
}
