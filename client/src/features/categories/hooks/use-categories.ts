import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '@/features/expenses/api/expense-api';
import type { CreateCategoryInput } from '@/types';

export const categoryKeys = {
  all: ['categories'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: categoryApi.getAll,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryInput) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
