import type { PrismaClient } from '@prisma/client';
import type { Env } from '../config/env.js';
import { AuthRepository } from '../../features/auth/repositories/auth.repository.js';
import { AuthService } from '../../features/auth/services/auth.service.js';
import { AuthController } from '../../features/auth/controllers/auth.controller.js';
import { CategoryRepository } from '../../features/categories/repositories/category.repository.js';
import { CategoryService } from '../../features/categories/services/category.service.js';
import { CategoryController } from '../../features/categories/controllers/category.controller.js';
import { ExpenseRepository } from '../../modules/expense/repositories/expense.repository.js';
import { ExpenseService } from '../../modules/expense/services/expense.service.js';
import { ExpenseController } from '../../modules/expense/controllers/expense.controller.js';
import { AdminController } from '../../features/admin/controllers/admin.controller.js';
import { HealthController } from '../../features/health/controllers/health.controller.js';
import { prisma } from '../../infrastructure/database/prisma.js';

export interface AppContainer {
  env: Env;
  prisma: PrismaClient;
  controllers: {
    auth: AuthController;
    category: CategoryController;
    expense: ExpenseController;
    admin: AdminController;
    health: HealthController;
  };
}

export function createContainer(env: Env): AppContainer {
  const authRepository = new AuthRepository(prisma);
  const authService = new AuthService(authRepository, env);
  const authController = new AuthController(authService, env);

  const categoryRepository = new CategoryRepository(prisma);
  const categoryService = new CategoryService(categoryRepository);
  const categoryController = new CategoryController(categoryService);

  const expenseRepository = new ExpenseRepository(prisma);
  const expenseService = new ExpenseService(expenseRepository);
  const expenseController = new ExpenseController(expenseService);

  const adminController = new AdminController(prisma);
  const healthController = new HealthController(prisma);

  return {
    env,
    prisma,
    controllers: {
      auth: authController,
      category: categoryController,
      expense: expenseController,
      admin: adminController,
      health: healthController,
    },
  };
}
