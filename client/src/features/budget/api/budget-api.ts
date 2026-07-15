import { api } from '@/lib/api-client';
import type { Budget, BudgetFilters, CreateBudgetInput, PaginatedBudgets, UpdateBudgetInput } from '@/types';

function buildQuery(params: BudgetFilters): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const budgetApi = {
  getAll: (filters: BudgetFilters = {}) =>
    api.get<PaginatedBudgets>(`/budgets${buildQuery(filters)}`),
  getById: (id: string) => api.get<Budget>(`/budgets/${id}`),
  create: (data: CreateBudgetInput) => api.post<Budget>('/budgets', data),
  update: (id: string, data: UpdateBudgetInput) => api.put<Budget>(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};
