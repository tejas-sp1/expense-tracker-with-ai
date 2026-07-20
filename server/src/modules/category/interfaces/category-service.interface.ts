import { Category } from '@prisma/client';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto.js';

export interface ICategoryService {
  createCategory(userId: string, dto: CreateCategoryDto): Promise<Category>;
  getUserCategories(userId: string): Promise<Category[]>;
  updateCategory(id: string, userId: string, dto: UpdateCategoryDto): Promise<Category>;
  deleteCategory(id: string, userId: string): Promise<Category>;
}
