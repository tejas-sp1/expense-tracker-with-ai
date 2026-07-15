import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { DashboardAnalytics } from '@/types';

export function useDashboardAnalytics(months = 6) {
  return useQuery({
    queryKey: ['dashboard', 'analytics', months] as const,
    queryFn: () => api.get<DashboardAnalytics>(`/dashboard/analytics?months=${months}`),
  });
}
