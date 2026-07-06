import type { Application } from 'express';
import type { AppContainer } from '../core/di/container.js';
import { authenticate } from '../core/middleware/authenticate.js';
import { requireVerifiedEmail } from '../core/middleware/require-verified-email.js';
import { ResponseFormatter } from '../core/http/response.js';
import { createAuthRoutes } from '../features/auth/routes/auth.routes.js';
import { createAdminRoutes } from '../features/admin/routes/admin.routes.js';
import { createCategoryRoutes } from '../features/categories/routes/category.routes.js';
import { createExpenseRoutes } from '../modules/expense/routes/expense.routes.js';
import { createHealthRoutes } from '../features/health/routes/health.routes.js';

export function registerRoutes(app: Application, container: AppContainer): void {
  const { controllers } = container;
  const protectedMiddleware = [authenticate(), requireVerifiedEmail];

  app.get('/api', (_req, res) => {
    ResponseFormatter.success(res, { name: 'Expense Tracker API', version: '1.0.0' });
  });

  app.use('/api/health', createHealthRoutes(controllers.health));
  app.use('/api/auth', createAuthRoutes(controllers.auth));
  app.use('/api/admin', createAdminRoutes(controllers.admin));
  app.use('/api/categories', ...protectedMiddleware, createCategoryRoutes(controllers.category));
  app.use('/api/expenses', ...protectedMiddleware, createExpenseRoutes(controllers.expense));
}
