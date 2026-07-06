import { Router } from 'express';
import { authenticate } from '../../../core/middleware/authenticate.js';
import { requireRole } from '../../../core/middleware/require-role.js';
import type { AdminController } from '../controllers/admin.controller.js';

export function createAdminRoutes(controller: AdminController): Router {
  const router = Router();
  router.use(authenticate());
  router.use(requireRole('ADMIN'));
  router.get('/users', controller.listUsers);
  return router;
}
