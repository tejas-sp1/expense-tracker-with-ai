import type { PaginatedResponse } from '../../../core/http/types.js';
import type { BudgetWithProgress } from '../types/budget.types.js';
import type { CreateBudgetDto } from '../dto/create-budget.dto.js';
import type { UpdateBudgetDto } from '../dto/update-budget.dto.js';
import type { BudgetQueryDto } from '../dto/budget-query.dto.js';

export interface IBudgetService {
  getAll(filters: BudgetQueryDto): Promise<PaginatedResponse<BudgetWithProgress>>;
  getById(userId: string, id: string): Promise<BudgetWithProgress>;
  create(input: CreateBudgetDto & { userId: string }): Promise<BudgetWithProgress>;
  update(userId: string, id: string, input: UpdateBudgetDto): Promise<BudgetWithProgress>;
  delete(userId: string, id: string): Promise<void>;
}
