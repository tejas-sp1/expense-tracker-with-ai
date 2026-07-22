import { ICategoryService } from '../interfaces/category-service.interface.js';
import { ICategoryRepository } from '../interfaces/category-repository.interface.js';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto.js';
import { NotFoundError, ValidationError } from '../../../core/errors/app-error.js';
import { Category, Prisma } from '@prisma/client';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove all non-word characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
}

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async createCategory(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const slug = slugify(dto.name);

    const existing = await this.categoryRepository.findByUserAndSlug(userId, slug);
    if (existing) {
      throw new ValidationError('A category with this name already exists');
    }

    try {
      return await this.categoryRepository.create({
        ...dto,
        userId,
        slug,
      });
    } catch (error) {
      // Fallback guard in case of a race between the check above and the insert
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ValidationError('A category with this name already exists');
      }
      throw error;
    }
  }

  async getUserCategories(userId: string): Promise<Category[]> {
    return this.categoryRepository.findByUser(userId);
  }

  async updateCategory(id: string, userId: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findById(id);

    if (!category || category.userId !== userId) {
      throw new NotFoundError('Category');
    }

    const updateData: Prisma.CategoryUpdateInput = { ...dto };

    if (dto.name) {
      const slug = slugify(dto.name);
      const existing = await this.categoryRepository.findByUserAndSlug(userId, slug);
      if (existing && existing.id !== id) {
        throw new ValidationError('A category with this name already exists');
      }
      updateData.slug = slug;
    }

    return this.categoryRepository.update(id, updateData);
  }

  async deleteCategory(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);

    if (!category || category.userId !== userId) {
      throw new NotFoundError('Category');
    }

    const expenseCount = await this.categoryRepository.countExpenses(id);
    if (expenseCount > 0) {
      throw new ValidationError('Cannot delete category with associated transactions');
    }

    return this.categoryRepository.softDelete(id);
  }
}
