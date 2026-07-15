import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.js';
import type { IncomeController } from '../controllers/income.controller.js';
import {
  createIncomeSchema,
  incomeIdSchema,
  incomeQuerySchema,
  summaryQuerySchema,
  updateIncomeSchema,
} from '../validators/income.validator.js';

export function createIncomeRoutes(controller: IncomeController): Router {
  const router = Router();

  router.get('/summary', validate(summaryQuerySchema, 'query'), controller.getSummary);
  router.get('/', validate(incomeQuerySchema, 'query'), controller.getAll);
  router.get('/:id', validate(incomeIdSchema, 'params'), controller.getById);
  router.post('/', validate(createIncomeSchema), controller.create);
  router.put(
    '/:id',
    validate(incomeIdSchema, 'params'),
    validate(updateIncomeSchema),
    controller.update,
  );
  router.delete('/:id', validate(incomeIdSchema, 'params'), controller.delete);

  return router;
}
