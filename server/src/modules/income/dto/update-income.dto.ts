import type { IncomeSource } from '@prisma/client';

export interface UpdateIncomeDto {
  title?: string;
  amount?: number;
  description?: string | null;
  transactionDate?: Date;
  source?: IncomeSource;
  currency?: string;
}
