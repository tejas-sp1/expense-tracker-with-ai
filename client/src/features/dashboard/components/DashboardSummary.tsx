import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DollarSign, PiggyBank, TrendingDown, TrendingUp, Wallet2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardAnalytics } from '@/features/dashboard/hooks/use-dashboard';
import { formatCurrency } from '@/lib/utils';

const MONTH_OPTIONS = [
  { value: '3', label: 'Last 3 months' },
  { value: '6', label: 'Last 6 months' },
  { value: '12', label: 'Last 12 months' },
];

interface OverviewCardProps {
  title: string;
  value: string;
  icon: typeof DollarSign;
  tone?: 'positive' | 'negative' | 'neutral';
}

function OverviewCard({ title, value, icon: Icon, tone = 'neutral' }: OverviewCardProps) {
  const toneClass =
    tone === 'positive' ? 'text-green-600' : tone === 'negative' ? 'text-destructive' : '';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${toneClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

export function DashboardSummary() {
  const [months, setMonths] = useState('6');
  const { data, isLoading, isError } = useDashboardAnalytics(Number(months));

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Unable to load dashboard analytics. Make sure the API server is running.
        </CardContent>
      </Card>
    );
  }

  const { overview, monthlyTrend, categoryBreakdown } = data;
  const hasTrendData = monthlyTrend.some((p) => p.income !== 0 || p.expense !== 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <OverviewCard
          title="Income (this month)"
          value={formatCurrency(overview.totalIncome)}
          icon={TrendingUp}
          tone="positive"
        />
        <OverviewCard
          title="Expenses (this month)"
          value={formatCurrency(overview.totalExpense)}
          icon={TrendingDown}
          tone="negative"
        />
        <OverviewCard
          title="Savings"
          value={formatCurrency(overview.savings)}
          icon={PiggyBank}
          tone={overview.savings >= 0 ? 'positive' : 'negative'}
        />
        <OverviewCard
          title="Savings Rate"
          value={`${overview.savingsRate.toFixed(1)}%`}
          icon={DollarSign}
          tone={overview.savingsRate >= 0 ? 'positive' : 'negative'}
        />
        <OverviewCard
          title="Budget Remaining"
          value={formatCurrency(overview.budgetRemaining)}
          icon={Wallet2}
          tone={overview.budgetRemaining >= 0 ? 'positive' : 'negative'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Income vs Expenses</CardTitle>
            <Select value={months} onValueChange={setMonths}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {!hasTrendData ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No income or expense data yet for this period.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" fontSize={12} tickLine={false} />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v: number) => formatCurrency(v).replace(/\.00$/, '')}
                  />
                  <Tooltip
                    formatter={(value: unknown) => formatCurrency(Number(value as number))}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No expenses recorded this month yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="total"
                    nameKey="categoryName"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.categoryColor} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => formatCurrency(Number(value as number))}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
