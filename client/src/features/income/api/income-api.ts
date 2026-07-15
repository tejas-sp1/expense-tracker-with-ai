import { api } from '@/lib/api-client';
import type {
  PaginatedIncome,
  IncomeFilters,
  Income,
  IncomeSummary,
  CreateIncomeInput,
  UpdateIncomeInput,
} from '@/types';

function buildQuery(params: IncomeFilters): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const incomeApi = {
  getAll: (filters: IncomeFilters = {}) =>
    api.get<PaginatedIncome>(`/income${buildQuery(filters)}`),
  getSummary: (filters: Pick<IncomeFilters, 'startDate' | 'endDate'> = {}) =>
    api.get<IncomeSummary>(`/income/summary${buildQuery(filters)}`),
  getById: (id: string) => api.get<Income>(`/income/${id}`),
  create: (data: CreateIncomeInput) => api.post<Income>('/income', data),
  update: (id: string, data: UpdateIncomeInput) => api.put<Income>(`/income/${id}`, data),
  delete: (id: string) => api.delete(`/income/${id}`),
};
