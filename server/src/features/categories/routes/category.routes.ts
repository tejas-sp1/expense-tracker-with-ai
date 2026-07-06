import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.js';
import type { CategoryController } from '../controllers/category.controller.js';
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validation/category.schema.js';

export function createCategoryRoutes(controller: CategoryController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', validate(categoryIdSchema, 'params'), controller.getById);
  router.post('/', validate(createCategorySchema), controller.create);
  router.put(
    '/:id',
    validate(categoryIdSchema, 'params'),
    validate(updateCategorySchema),
    controller.update,
  );
  router.delete('/:id', validate(categoryIdSchema, 'params'), controller.delete);

  return router;
}
