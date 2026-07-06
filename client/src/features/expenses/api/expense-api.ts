import { api } from '@/lib/api-client';
import type {
  Category,
  CreateCategoryInput,
  PaginatedExpenses,
  ExpenseFilters,
  Expense,
  ExpenseSummary,
  CreateExpenseInput,
  UpdateExpenseInput,
} from '@/types';

function buildQuery(params: ExpenseFilters): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const expenseApi = {
  getAll: (filters: ExpenseFilters = {}) =>
    api.get<PaginatedExpenses>(`/expenses${buildQuery(filters)}`),
  getSummary: (filters: Pick<ExpenseFilters, 'startDate' | 'endDate'> = {}) =>
    api.get<ExpenseSummary>(`/expenses/summary${buildQuery(filters)}`),
  getById: (id: string) => api.get<Expense>(`/expenses/${id}`),
  create: (data: CreateExpenseInput) => api.post<Expense>('/expenses', data),
  update: (id: string, data: UpdateExpenseInput) => api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (data: CreateCategoryInput) => api.post<Category>('/categories', data),
  update: (id: string, data: Partial<CreateCategoryInput>) =>
    api.put<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};
