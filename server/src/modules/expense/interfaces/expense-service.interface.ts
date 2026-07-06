import type { PaginatedResponse } from '../../../core/http/types.js';
import type { ExpenseEntity, ExpenseSummary } from '../types/expense.types.js';
import type { CreateExpenseDto } from '../dto/create-expense.dto.js';
import type { UpdateExpenseDto } from '../dto/update-expense.dto.js';
import type { ExpenseQueryDto } from '../dto/expense-query.dto.js';
import type { ExpenseSummaryQueryDto } from '../dto/expense-summary-query.dto.js';

export interface IExpenseService {
  getAll(filters: ExpenseQueryDto): Promise<PaginatedResponse<ExpenseEntity>>;
  getById(userId: string, id: string): Promise<ExpenseEntity>;
  create(input: CreateExpenseDto & { userId: string }): Promise<ExpenseEntity>;
  update(userId: string, id: string, input: UpdateExpenseDto): Promise<ExpenseEntity>;
  delete(userId: string, id: string): Promise<void>;
  getSummary(filters: ExpenseSummaryQueryDto): Promise<ExpenseSummary>;
}
