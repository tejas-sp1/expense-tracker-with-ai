import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeApi } from '../api/income-api';
import type { CreateIncomeInput, IncomeFilters, UpdateIncomeInput } from '@/types';

export const incomeKeys = {
  all: ['income'] as const,
  lists: () => [...incomeKeys.all, 'list'] as const,
  list: (filters: IncomeFilters) => [...incomeKeys.lists(), filters] as const,
  summary: (filters: Pick<IncomeFilters, 'startDate' | 'endDate'>) =>
    [...incomeKeys.all, 'summary', filters] as const,
};

export function useIncomeList(filters: IncomeFilters) {
  return useQuery({
    queryKey: incomeKeys.list(filters),
    queryFn: () => incomeApi.getAll(filters),
  });
}

export function useIncomeSummary(filters: Pick<IncomeFilters, 'startDate' | 'endDate'> = {}) {
  return useQuery({
    queryKey: incomeKeys.summary(filters),
    queryFn: () => incomeApi.getSummary(filters),
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIncomeInput) => incomeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncomeInput }) =>
      incomeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all });
    },
  });
}
