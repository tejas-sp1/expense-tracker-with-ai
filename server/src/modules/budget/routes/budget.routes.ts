import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.js';
import type { BudgetController } from '../controllers/budget.controller.js';
import {
  budgetIdSchema,
  budgetQuerySchema,
  createBudgetSchema,
  updateBudgetSchema,
} from '../validators/budget.validator.js';

export function createBudgetRoutes(controller: BudgetController): Router {
  const router = Router();

  router.get('/', validate(budgetQuerySchema, 'query'), controller.getAll);
  router.get('/:id', validate(budgetIdSchema, 'params'), controller.getById);
  router.post('/', validate(createBudgetSchema), controller.create);
  router.put(
    '/:id',
    validate(budgetIdSchema, 'params'),
    validate(updateBudgetSchema),
    controller.update,
  );
  router.delete('/:id', validate(budgetIdSchema, 'params'), controller.delete);

  return router;
}
