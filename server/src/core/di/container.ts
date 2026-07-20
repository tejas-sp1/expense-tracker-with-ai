import type { PrismaClient } from '@prisma/client';
import type { Env } from '../config/env.js';
import { AuthRepository } from '../../modules/auth/repositories/auth.repository.js';
import { AuthService } from '../../modules/auth/services/auth.service.js';
import { AuthController } from '../../modules/auth/controllers/auth.controller.js';
import { CategoryRepository } from '../../modules/category/repositories/category.repository.js';
import { CategoryService } from '../../modules/category/services/category.service.js';
import { CategoryController } from '../../modules/category/controllers/category.controller.js';
import { ExpenseRepository } from '../../modules/expense/repositories/expense.repository.js';
import { ExpenseService } from '../../modules/expense/services/expense.service.js';
import { ExpenseController } from '../../modules/expense/controllers/expense.controller.js';
import { IncomeRepository } from '../../modules/income/repositories/income.repository.js';
import { IncomeService } from '../../modules/income/services/income.service.js';
import { IncomeController } from '../../modules/income/controllers/income.controller.js';
import { BudgetRepository } from '../../modules/budget/repositories/budget.repository.js';
import { BudgetService } from '../../modules/budget/services/budget.service.js';
import { BudgetController } from '../../modules/budget/controllers/budget.controller.js';
import { GoalRepository } from '../../modules/goal/repositories/goal.repository.js';
import { GoalService } from '../../modules/goal/services/goal.service.js';
import { GoalController } from '../../modules/goal/controllers/goal.controller.js';
import { DashboardService } from '../../features/dashboard/services/dashboard.service.js';
import { DashboardController } from '../../features/dashboard/controllers/dashboard.controller.js';
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
    income: IncomeController;
    budget: BudgetController;
    goal: GoalController;
    dashboard: DashboardController;
    admin: AdminController;
    health: HealthController;
  };
}

export function createContainer(env: Env): AppContainer {
  // Auth Module: passing only 1 expected argument to the new service constructor
  const authRepository = new AuthRepository();
  const authService = new AuthService(authRepository);
  const authController = new AuthController(authService);

  // Category Module
  const categoryRepository = new CategoryRepository();
  const categoryService = new CategoryService(categoryRepository);
  const categoryController = new CategoryController(categoryService);

  // Expense Module
  const expenseRepository = new ExpenseRepository(prisma);
  const expenseService = new ExpenseService(expenseRepository);
  const expenseController = new ExpenseController(expenseService);

  // Income Module
  const incomeRepository = new IncomeRepository(prisma);
  const incomeService = new IncomeService(incomeRepository);
  const incomeController = new IncomeController(incomeService);

  // Budget Module
  const budgetRepository = new BudgetRepository(prisma);
  const budgetService = new BudgetService(budgetRepository);
  const budgetController = new BudgetController(budgetService);

  // Goal Module
  const goalRepository = new GoalRepository(prisma);
  const goalService = new GoalService(goalRepository);
  const goalController = new GoalController(goalService);

  // Dashboard reuses the budget and expense services
  const dashboardService = new DashboardService(prisma, budgetService, expenseService);
  const dashboardController = new DashboardController(dashboardService);

  const adminController = new AdminController(prisma);
  const healthController = new HealthController(prisma);

  return {
    env,
    prisma,
    controllers: {
      auth: authController,
      category: categoryController,
      expense: expenseController,
      income: incomeController,
      budget: budgetController,
      goal: goalController,
      dashboard: dashboardController,
      admin: adminController,
      health: healthController,
    },
  };
}
