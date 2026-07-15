import { api } from '@/lib/api-client';
import type {
  ContributeGoalInput,
  CreateGoalInput,
  GoalFilters,
  PaginatedGoals,
  SavingsGoal,
  UpdateGoalInput,
} from '@/types';

function buildQuery(params: GoalFilters): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const goalApi = {
  getAll: (filters: GoalFilters = {}) => api.get<PaginatedGoals>(`/goals${buildQuery(filters)}`),
  getById: (id: string) => api.get<SavingsGoal>(`/goals/${id}`),
  create: (data: CreateGoalInput) => api.post<SavingsGoal>('/goals', data),
  update: (id: string, data: UpdateGoalInput) => api.put<SavingsGoal>(`/goals/${id}`, data),
  contribute: (id: string, data: ContributeGoalInput) =>
    api.post<SavingsGoal>(`/goals/${id}/contribute`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};
