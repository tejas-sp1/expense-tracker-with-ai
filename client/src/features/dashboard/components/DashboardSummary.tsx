import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useExpenseSummary } from '@/features/expenses/hooks/use-expenses';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Receipt, TrendingUp } from 'lucide-react';

export function DashboardSummary() {
  const now = new Date();
  const filters = {
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  };

  const { data, isLoading, isError } = useExpenseSummary(filters);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Unable to load summary. Make sure the API server is running.
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      title: 'Total This Month',
      value: formatCurrency(data.totalAmount),
      icon: DollarSign,
      description: `${data.expenseCount} transactions`,
    },
    {
      title: 'Average Expense',
      value: formatCurrency(data.averageAmount),
      icon: TrendingUp,
      description: 'Per transaction',
    },
    {
      title: 'Categories Used',
      value: String(data.byCategory.length),
      icon: Receipt,
      description: 'Active this month',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.byCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.byCategory
              .sort((a, b) => b.total - a.total)
              .map((item) => {
                const percentage =
                  data.totalAmount > 0 ? (item.total / data.totalAmount) * 100 : 0;
                return (
                  <div key={item.categoryId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.categoryColor }}
                        />
                        <span className="font-medium">{item.categoryName}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatCurrency(item.total)} ({item.count})
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.categoryColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
