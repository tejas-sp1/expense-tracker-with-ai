import type { IncomeSource } from '@prisma/client';

export interface IncomeQueryDto {
  userId: string;
  source?: IncomeSource;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}
