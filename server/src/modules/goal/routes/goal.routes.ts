import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.js';
import type { GoalController } from '../controllers/goal.controller.js';
import {
  contributeGoalSchema,
  createGoalSchema,
  goalIdSchema,
  goalQuerySchema,
  updateGoalSchema,
} from '../validators/goal.validator.js';

export function createGoalRoutes(controller: GoalController): Router {
  const router = Router();

  router.get('/', validate(goalQuerySchema, 'query'), controller.getAll);
  router.get('/:id', validate(goalIdSchema, 'params'), controller.getById);
  router.post('/', validate(createGoalSchema), controller.create);
  router.put(
    '/:id',
    validate(goalIdSchema, 'params'),
    validate(updateGoalSchema),
    controller.update,
  );
  router.post(
    '/:id/contribute',
    validate(goalIdSchema, 'params'),
    validate(contributeGoalSchema),
    controller.contribute,
  );
  router.delete('/:id', validate(goalIdSchema, 'params'), controller.delete);

  return router;
}
