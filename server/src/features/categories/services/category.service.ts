import { NotFoundError, ValidationError } from '../../../core/errors/app-error.js';
import { slugify } from '../../../core/utils/slug.js';
import type {
  CategoryEntity,
  CreateCategoryInput,
  ICategoryRepository,
  UpdateCategoryInput,
} from '../types/category.types.js';

export class CategoryService {
  constructor(private readonly repository: ICategoryRepository) {}

  getAll(userId: string): Promise<CategoryEntity[]> {
    return this.repository.findAll(userId);
  }

  async getById(userId: string, id: string): Promise<CategoryEntity> {
    const category = await this.repository.findById(userId, id);
    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async create(userId: string, input: Omit<CreateCategoryInput, 'userId'>): Promise<CategoryEntity> {
    const slug = input.slug ?? slugify(input.name);
    const existing = await this.repository.findByUserAndSlug(userId, slug);
    if (existing) throw new ValidationError('Category with this name already exists');
    return this.repository.create({ ...input, userId, slug });
  }

  async update(userId: string, id: string, input: UpdateCategoryInput): Promise<CategoryEntity> {
    await this.getById(userId, id);
    if (input.name) {
      const slug = input.slug ?? slugify(input.name);
      const existing = await this.repository.findByUserAndSlug(userId, slug);
      if (existing && existing.id !== id) {
        throw new ValidationError('Category with this name already exists');
      }
    }
    return this.repository.update(userId, id, input);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getById(userId, id);
    const count = await this.repository.countTransactions(userId, id);
    if (count > 0) throw new ValidationError('Cannot delete category with associated transactions');
    await this.repository.softDelete(userId, id);
  }
}
