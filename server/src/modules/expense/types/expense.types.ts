import type { Category, Expense } from '@prisma/client';

export type ExpenseEntity = Expense & { category: Category };

export interface ExpenseSummary {
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    total: number;
    count: number;
  }>;
}
