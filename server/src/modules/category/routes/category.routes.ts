import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';

export function createCategoryRoutes(categoryController: CategoryController): Router {
  const router = Router();

  router.post('/', categoryController.create);
  router.get('/', categoryController.getAll);
  router.patch('/:id', categoryController.update);
  router.delete('/:id', categoryController.delete);

  return router;
}
