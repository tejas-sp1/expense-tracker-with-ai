import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.js';
import type { DashboardController } from '../controllers/dashboard.controller.js';
import { dashboardQuerySchema } from '../validators/dashboard.validator.js';

export function createDashboardRoutes(controller: DashboardController): Router {
  const router = Router();
  router.get('/analytics', validate(dashboardQuerySchema, 'query'), controller.getAnalytics);
  return router;
}
