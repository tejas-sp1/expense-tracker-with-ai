import type { BudgetPeriod } from '@prisma/client';

export interface CreateBudgetDto {
  name: string;
  amount: number;
  categoryId?: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  alertThreshold?: number;
  currency?: string;
}
