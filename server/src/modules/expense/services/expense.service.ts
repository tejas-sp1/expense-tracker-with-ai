import { NotFoundError } from '../../../core/errors/app-error.js';
import type { PaginatedResponse } from '../../../core/http/types.js';
import type { IExpenseService } from '../interfaces/expense-service.interface.js';
import type { IExpenseRepository } from '../interfaces/expense-repository.interface.js';
import type { CreateExpenseDto } from '../dto/create-expense.dto.js';
import type { UpdateExpenseDto } from '../dto/update-expense.dto.js';
import type { ExpenseQueryDto } from '../dto/expense-query.dto.js';
import type { ExpenseSummaryQueryDto } from '../dto/expense-summary-query.dto.js';
import type { ExpenseEntity, ExpenseSummary } from '../types/expense.types.js';

export class ExpenseService implements IExpenseService {
  constructor(private readonly repository: IExpenseRepository) {}

  async getAll(filters: ExpenseQueryDto): Promise<PaginatedResponse<ExpenseEntity>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const { items, total } = await this.repository.findMany({ ...filters, page, limit });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(userId: string, id: string): Promise<ExpenseEntity> {
    const expense = await this.repository.findById(userId, id);
    if (!expense) {
      throw new NotFoundError('Expense');
    }
    return expense;
  }

  async create(input: CreateExpenseDto & { userId: string }): Promise<ExpenseEntity> {
    return this.repository.create(input);
  }

  async update(userId: string, id: string, input: UpdateExpenseDto): Promise<ExpenseEntity> {
    // Check if the resource exists and belongs to the user
    await this.getById(userId, id);
    return this.repository.update(userId, id, input);
  }

  async delete(userId: string, id: string): Promise<void> {
    // Check if the resource exists and belongs to the user
    await this.getById(userId, id);
    await this.repository.softDelete(userId, id);
  }

  async getSummary(filters: ExpenseSummaryQueryDto): Promise<ExpenseSummary> {
    return this.repository.getSummary(filters);
  }
}
