import type { Category } from '@prisma/client';

export type CategoryEntity = Category;

export interface CreateCategoryInput {
  userId: string;
  name: string;
  color?: string;
  slug?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
  slug?: string;
}

export interface ICategoryRepository {
  findAll(userId: string): Promise<CategoryEntity[]>;
  findById(userId: string, id: string): Promise<CategoryEntity | null>;
  findByUserAndSlug(userId: string, slug: string): Promise<CategoryEntity | null>;
  create(data: CreateCategoryInput): Promise<CategoryEntity>;
  update(userId: string, id: string, data: UpdateCategoryInput): Promise<CategoryEntity>;
  softDelete(userId: string, id: string): Promise<void>;
  countTransactions(userId: string, categoryId: string): Promise<number>;
}
