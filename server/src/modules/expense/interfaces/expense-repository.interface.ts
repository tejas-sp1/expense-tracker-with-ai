import type { ExpenseEntity, ExpenseSummary } from '../types/expense.types.js';
import type { CreateExpenseDto } from '../dto/create-expense.dto.js';
import type { UpdateExpenseDto } from '../dto/update-expense.dto.js';
import type { ExpenseQueryDto } from '../dto/expense-query.dto.js';
import type { ExpenseSummaryQueryDto } from '../dto/expense-summary-query.dto.js';

export interface IExpenseRepository {
  findMany(filters: ExpenseQueryDto): Promise<{ items: ExpenseEntity[]; total: number }>;
  findById(userId: string, id: string): Promise<ExpenseEntity | null>;
  create(data: CreateExpenseDto & { userId: string }): Promise<ExpenseEntity>;
  update(userId: string, id: string, data: UpdateExpenseDto): Promise<ExpenseEntity>;
  softDelete(userId: string, id: string): Promise<void>;
  getSummary(filters: ExpenseSummaryQueryDto): Promise<ExpenseSummary>;
}
