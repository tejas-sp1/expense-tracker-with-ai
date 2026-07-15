import type { BudgetPeriod } from '@prisma/client';

export interface UpdateBudgetDto {
  name?: string;
  amount?: number;
  categoryId?: string | null;
  period?: BudgetPeriod;
  startDate?: Date;
  endDate?: Date | null;
  alertThreshold?: number;
  isActive?: boolean;
  currency?: string;
}
