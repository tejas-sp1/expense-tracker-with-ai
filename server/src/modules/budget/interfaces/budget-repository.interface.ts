import type { BudgetEntity } from '../types/budget.types.js';
import type { CreateBudgetDto } from '../dto/create-budget.dto.js';
import type { UpdateBudgetDto } from '../dto/update-budget.dto.js';
import type { BudgetQueryDto } from '../dto/budget-query.dto.js';

export interface IBudgetRepository {
  findMany(filters: BudgetQueryDto): Promise<{ items: BudgetEntity[]; total: number }>;
  findById(userId: string, id: string): Promise<BudgetEntity | null>;
  create(data: CreateBudgetDto & { userId: string }): Promise<BudgetEntity>;
  update(userId: string, id: string, data: UpdateBudgetDto): Promise<BudgetEntity>;
  softDelete(userId: string, id: string): Promise<void>;
  getSpentAmount(
    userId: string,
    categoryId: string | null,
    start: Date,
    end: Date,
  ): Promise<number>;
}
