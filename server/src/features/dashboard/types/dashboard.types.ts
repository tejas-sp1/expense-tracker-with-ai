export interface DashboardOverview {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  savingsRate: number;
  budgetTotal: number;
  budgetSpent: number;
  budgetRemaining: number;
  periodStart: string;
  periodEnd: string;
}

export interface MonthlyTrendPoint {
  label: string; // e.g. "Jan 2026"
  year: number;
  month: number; // 1-12
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
  count: number;
}

export interface DashboardAnalytics {
  overview: DashboardOverview;
  monthlyTrend: MonthlyTrendPoint[];
  categoryBreakdown: CategoryBreakdownItem[];
}
