import type { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../core/errors/app-error.js';
import { slugify } from '../../../core/utils/slug.js';
import type {
  CategoryEntity,
  CreateCategoryInput,
  ICategoryRepository,
  UpdateCategoryInput,
} from '../types/category.types.js';

const activeOnly = { deletedAt: null };

export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(userId: string): Promise<CategoryEntity[]> {
    return this.prisma.category.findMany({
      where: { userId, ...activeOnly },
      orderBy: { name: 'asc' },
    });
  }

  findById(userId: string, id: string): Promise<CategoryEntity | null> {
    return this.prisma.category.findFirst({
      where: { id, userId, ...activeOnly },
    });
  }

  findByUserAndSlug(userId: string, slug: string): Promise<CategoryEntity | null> {
    return this.prisma.category.findFirst({
      where: { userId, slug, ...activeOnly },
    });
  }

  create(data: CreateCategoryInput): Promise<CategoryEntity> {
    const slug = data.slug ?? slugify(data.name);
    return this.prisma.category.create({
      data: { userId: data.userId, name: data.name, slug, color: data.color },
    });
  }

  async update(userId: string, id: string, data: UpdateCategoryInput): Promise<CategoryEntity> {
    const updateData: UpdateCategoryInput = { ...data };
    if (data.name && !data.slug) updateData.slug = slugify(data.name);

    const result = await this.prisma.category.updateMany({
      where: { id, userId, ...activeOnly },
      data: updateData,
    });

    if (result.count === 0) throw new NotFoundError('Category');

    const updated = await this.findById(userId, id);
    if (!updated) throw new NotFoundError('Category');
    return updated;
  }

  async softDelete(userId: string, id: string): Promise<void> {
    await this.prisma.category.updateMany({
      where: { id, userId, ...activeOnly },
      data: { deletedAt: new Date() },
    });
  }

  countTransactions(userId: string, categoryId: string): Promise<number> {
    return this.prisma.expense.count({
      where: { userId, categoryId, ...activeOnly },
    });
  }
}
