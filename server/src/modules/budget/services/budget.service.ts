import { NotFoundError } from '../../../core/errors/app-error.js';
import type { PaginatedResponse } from '../../../core/http/types.js';
import type { IBudgetService } from '../interfaces/budget-service.interface.js';
import type { IBudgetRepository } from '../interfaces/budget-repository.interface.js';
import type { CreateBudgetDto } from '../dto/create-budget.dto.js';
import type { UpdateBudgetDto } from '../dto/update-budget.dto.js';
import type { BudgetQueryDto } from '../dto/budget-query.dto.js';
import type { BudgetEntity, BudgetProgress, BudgetWithProgress } from '../types/budget.types.js';
import { getCurrentPeriodWindow } from '../utils/period-window.js';

export class BudgetService implements IBudgetService {
  constructor(private readonly repository: IBudgetRepository) {}

  private async attachProgress(budget: BudgetEntity): Promise<BudgetWithProgress> {
    const window = getCurrentPeriodWindow(budget.period, budget.startDate, budget.endDate);
    const spentAmount = await this.repository.getSpentAmount(
      budget.userId,
      budget.categoryId,
      window.start,
      window.end,
    );
    const budgetAmount = Number(budget.amount);
    const remainingAmount = budgetAmount - spentAmount;
    const percentageUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

    const progress: BudgetProgress = {
      periodStart: window.start.toISOString(),
      periodEnd: window.end.toISOString(),
      budgetAmount,
      spentAmount,
      remainingAmount,
      percentageUsed,
      isOverBudget: spentAmount > budgetAmount,
      isNearThreshold: percentageUsed >= budget.alertThreshold,
    };

    return { ...budget, progress };
  }

  async getAll(filters: BudgetQueryDto): Promise<PaginatedResponse<BudgetWithProgress>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const { items, total } = await this.repository.findMany({ ...filters, page, limit });
    const withProgress = await Promise.all(items.map((b) => this.attachProgress(b)));

    return {
      items: withProgress,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(userId: string, id: string): Promise<BudgetWithProgress> {
    const budget = await this.repository.findById(userId, id);
    if (!budget) {
      throw new NotFoundError('Budget');
    }
    return this.attachProgress(budget);
  }

  async create(input: CreateBudgetDto & { userId: string }): Promise<BudgetWithProgress> {
    const created = await this.repository.create(input);
    return this.attachProgress(created);
  }

  async update(userId: string, id: string, input: UpdateBudgetDto): Promise<BudgetWithProgress> {
    // Check if the resource exists and belongs to the user
    await this.getById(userId, id);
    const updated = await this.repository.update(userId, id, input);
    return this.attachProgress(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    // Check if the resource exists and belongs to the user
    await this.getById(userId, id);
    await this.repository.softDelete(userId, id);
  }
}
