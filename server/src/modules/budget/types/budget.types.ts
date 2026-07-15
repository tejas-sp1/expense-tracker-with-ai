import type { Budget, Category } from '@prisma/client';

export type BudgetEntity = Budget & { category?: Category | null };

export interface BudgetProgress {
  periodStart: string;
  periodEnd: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
  isNearThreshold: boolean;
}

export type BudgetWithProgress = BudgetEntity & { progress: BudgetProgress };
