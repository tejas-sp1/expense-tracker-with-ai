import type { IncomeSource } from '@prisma/client';

export interface CreateIncomeDto {
  title: string;
  amount: number;
  description?: string;
  transactionDate: Date;
  source?: IncomeSource;
  currency?: string;
}
