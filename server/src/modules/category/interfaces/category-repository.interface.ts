import { Category, Prisma } from '@prisma/client';

export interface ICategoryRepository {
  create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByUser(userId: string): Promise<Category[]>;
  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
  delete(id: string): Promise<Category>;
}
