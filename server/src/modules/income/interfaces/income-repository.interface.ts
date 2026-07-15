import type { IncomeEntity, IncomeSummary } from '../types/income.types.js';
import type { CreateIncomeDto } from '../dto/create-income.dto.js';
import type { UpdateIncomeDto } from '../dto/update-income.dto.js';
import type { IncomeQueryDto } from '../dto/income-query.dto.js';
import type { IncomeSummaryQueryDto } from '../dto/income-summary-query.dto.js';

export interface IIncomeRepository {
  findMany(filters: IncomeQueryDto): Promise<{ items: IncomeEntity[]; total: number }>;
  findById(userId: string, id: string): Promise<IncomeEntity | null>;
  create(data: CreateIncomeDto & { userId: string }): Promise<IncomeEntity>;
  update(userId: string, id: string, data: UpdateIncomeDto): Promise<IncomeEntity>;
  softDelete(userId: string, id: string): Promise<void>;
  getSummary(filters: IncomeSummaryQueryDto): Promise<IncomeSummary>;
}
