import { ICategoryRepository } from '../interfaces/category-repository.interface.js';
import { prisma } from '../../../infrastructure/database/prisma.js';
import { Category, Prisma } from '@prisma/client';

export class CategoryRepository implements ICategoryRepository {
  async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async findByUser(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId },
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({ where: { id } });
  }
}
