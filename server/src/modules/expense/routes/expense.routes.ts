import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.js';
import type { ExpenseController } from '../controllers/expense.controller.js';
import {
  createExpenseSchema,
  expenseIdSchema,
  expenseQuerySchema,
  summaryQuerySchema,
  updateExpenseSchema,
} from '../validators/expense.validator.js';

export function createExpenseRoutes(controller: ExpenseController): Router {
  const router = Router();

  router.get('/summary', validate(summaryQuerySchema, 'query'), controller.getSummary);
  router.get('/', validate(expenseQuerySchema, 'query'), controller.getAll);
  router.get('/:id', validate(expenseIdSchema, 'params'), controller.getById);
  router.post('/', validate(createExpenseSchema), controller.create);
  router.put(
    '/:id',
    validate(expenseIdSchema, 'params'),
    validate(updateExpenseSchema),
    controller.update,
  );
  router.delete('/:id', validate(expenseIdSchema, 'params'), controller.delete);

  return router;
}
