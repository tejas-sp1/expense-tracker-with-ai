import type { Income } from '@prisma/client';

export type IncomeEntity = Income;

export interface IncomeSummary {
  totalAmount: number;
  incomeCount: number;
  averageAmount: number;
  bySource: Array<{
    source: string;
    total: number;
    count: number;
  }>;
}
