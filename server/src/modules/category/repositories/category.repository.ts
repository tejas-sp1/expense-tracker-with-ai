import { ICategoryRepository } from '../interfaces/category-repository.interface.js';
import { prisma } from '../../../infrastructure/database/prisma.js';
import { Category, Prisma } from '@prisma/client';

export class CategoryRepository implements ICategoryRepository {
  async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findFirst({ where: { id, deletedAt: null } });
  }

  async findByUserAndSlug(userId: string, slug: string): Promise<Category | null> {
    return prisma.category.findFirst({ where: { userId, slug, deletedAt: null } });
  }

  async findByUser(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<Category> {
    return prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async countExpenses(id: string): Promise<number> {
    return prisma.expense.count({ where: { categoryId: id, deletedAt: null } });
  }
}
