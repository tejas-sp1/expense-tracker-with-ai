import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '../api/expense-api';
import type { CreateExpenseInput, ExpenseFilters, UpdateExpenseInput } from '@/types';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: ExpenseFilters) => [...expenseKeys.lists(), filters] as const,
  summary: (filters: Pick<ExpenseFilters, 'startDate' | 'endDate'>) =>
    [...expenseKeys.all, 'summary', filters] as const,
};

export function useExpenses(filters: ExpenseFilters) {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => expenseApi.getAll(filters),
  });
}

export function useExpenseSummary(filters: Pick<ExpenseFilters, 'startDate' | 'endDate'> = {}) {
  return useQuery({
    queryKey: expenseKeys.summary(filters),
    queryFn: () => expenseApi.getSummary(filters),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseInput) => expenseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseInput }) =>
      expenseApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}
