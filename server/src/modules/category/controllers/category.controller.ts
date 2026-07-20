import { Request, Response, NextFunction } from 'express';
import { ICategoryService } from '../interfaces/category-service.interface.js';

export class CategoryController {
  constructor(private categoryService: ICategoryService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      const category = await this.categoryService.createCategory(userId, req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      const categories = await this.categoryService.getUserCategories(userId);
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const userId = req.userId;
      const category = await this.categoryService.updateCategory(id, userId, req.body);
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const userId = req.userId;
      await this.categoryService.deleteCategory(id, userId);
      res.status(200).json({ success: true, message: 'Category removed successfully' });
    } catch (error) {
      next(error);
    }
  };
}
