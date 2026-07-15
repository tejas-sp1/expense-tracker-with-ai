import type { PrismaClient } from '@prisma/client';
import type { IBudgetService } from '../../../modules/budget/interfaces/budget-service.interface.js';
import type { IExpenseService } from '../../../modules/expense/interfaces/expense-service.interface.js';
import type {
  CategoryBreakdownItem,
  DashboardAnalytics,
  DashboardOverview,
  MonthlyTrendPoint,
} from '../types/dashboard.types.js';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function monthWindow(year: number, month: number): { start: Date; end: Date } {
  // month is 0-indexed (JS Date convention)
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  return { start, end };
}

export class DashboardService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly budgetService: IBudgetService,
    private readonly expenseService: IExpenseService,
  ) {}

  private async sumForWindow(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<{ income: number; expense: number }> {
    const [incomeAgg, expenseAgg] = await Promise.all([
      this.prisma.income.aggregate({
        where: { userId, deletedAt: null, transactionDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { userId, deletedAt: null, transactionDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    return {
      income: Number(incomeAgg._sum.amount ?? 0),
      expense: Number(expenseAgg._sum.amount ?? 0),
    };
  }

  private async getOverview(userId: string, start: Date, end: Date): Promise<DashboardOverview> {
    const { income, expense } = await this.sumForWindow(userId, start, end);
    const savings = income - expense;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Reuse BudgetService so "remaining" always matches what the Budgets card shows —
    // avoids two different sources of truth for the same number.
    const budgets = await this.budgetService.getAll({ userId, isActive: true, limit: 100 });
    const budgetTotal = budgets.items.reduce((sum, b) => sum + b.progress.budgetAmount, 0);
    const budgetSpent = budgets.items.reduce((sum, b) => sum + b.progress.spentAmount, 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      savings,
      savingsRate,
      budgetTotal,
      budgetSpent,
      budgetRemaining: budgetTotal - budgetSpent,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    };
  }

  private async getMonthlyTrend(userId: string, months: number): Promise<MonthlyTrendPoint[]> {
    const now = new Date();
    const points: MonthlyTrendPoint[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth();
      const { start, end } = monthWindow(year, month);
      const { income, expense } = await this.sumForWindow(userId, start, end);

      points.push({
        label: `${MONTH_NAMES[month]} ${year}`,
        year,
        month: month + 1,
        income,
        expense,
        net: income - expense,
      });
    }

    return points;
  }

  private async getCategoryBreakdown(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<CategoryBreakdownItem[]> {
    // Reuse the same summary logic the Expenses dashboard card already relies on
    const summary = await this.expenseService.getSummary({ userId, startDate: start, endDate: end });
    return summary.byCategory;
  }

  async getAnalytics(userId: string, months: number): Promise<DashboardAnalytics> {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    const [overview, monthlyTrend, categoryBreakdown] = await Promise.all([
      this.getOverview(userId, start, end),
      this.getMonthlyTrend(userId, months),
      this.getCategoryBreakdown(userId, start, end),
    ]);

    return { overview, monthlyTrend, categoryBreakdown };
  }
}
