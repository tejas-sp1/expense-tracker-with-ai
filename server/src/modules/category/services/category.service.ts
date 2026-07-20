import { ICategoryService } from '../interfaces/category-service.interface.js';
import { ICategoryRepository } from '../interfaces/category-repository.interface.js';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto.js';
import { AppError } from '../../../core/errors/app-error.js';
import { Category } from '@prisma/client'; // Keep this as is (no extension for package imports)
export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async createCategory(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const slug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove all non-word characters except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single hyphen
      .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens

    return this.categoryRepository.create({
      ...dto,
      userId,
      slug,
    });
  }

  async getUserCategories(userId: string): Promise<Category[]> {
    return this.categoryRepository.findByUser(userId);
  }

  async updateCategory(id: string, userId: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findById(id);

    if (!category || (category.userId !== userId && category.userId !== null)) {
      throw new AppError(404, 'Category not found or unauthorized');
    }

    if (category.userId === null) {
      throw new AppError(403, 'System default categories cannot be modified');
    }

    return this.categoryRepository.update(id, dto);
  }

  async deleteCategory(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);

    if (!category || category.userId !== userId) {
      throw new AppError(404, 'Category not found or unauthorized');
    }

    return this.categoryRepository.delete(id);
  }
}
