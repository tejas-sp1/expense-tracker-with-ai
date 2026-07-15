import type { PaginatedResponse } from '../../../core/http/types.js';
import type { IncomeEntity, IncomeSummary } from '../types/income.types.js';
import type { CreateIncomeDto } from '../dto/create-income.dto.js';
import type { UpdateIncomeDto } from '../dto/update-income.dto.js';
import type { IncomeQueryDto } from '../dto/income-query.dto.js';
import type { IncomeSummaryQueryDto } from '../dto/income-summary-query.dto.js';

export interface IIncomeService {
  getAll(filters: IncomeQueryDto): Promise<PaginatedResponse<IncomeEntity>>;
  getById(userId: string, id: string): Promise<IncomeEntity>;
  create(input: CreateIncomeDto & { userId: string }): Promise<IncomeEntity>;
  update(userId: string, id: string, input: UpdateIncomeDto): Promise<IncomeEntity>;
  delete(userId: string, id: string): Promise<void>;
  getSummary(filters: IncomeSummaryQueryDto): Promise<IncomeSummary>;
}
