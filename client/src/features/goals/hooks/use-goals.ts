import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalApi } from '../api/goal-api';
import type { ContributeGoalInput, CreateGoalInput, GoalFilters, UpdateGoalInput } from '@/types';

export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (filters: GoalFilters) => [...goalKeys.lists(), filters] as const,
};

export function useGoals(filters: GoalFilters = {}) {
  return useQuery({
    queryKey: goalKeys.list(filters),
    queryFn: () => goalApi.getAll(filters),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoalInput) => goalApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalInput }) => goalApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}

export function useContributeGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContributeGoalInput }) =>
      goalApi.contribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}
