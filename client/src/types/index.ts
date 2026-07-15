export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: string;
  description: string | null;
  date: string;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedExpenses {
  items: Expense[];
  meta: PaginationMeta;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
  count: number;
}

export interface ExpenseSummary {
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  byCategory: CategoryBreakdownItem[];
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  description?: string;
  date: string;
  categoryId: string;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export interface CreateCategoryInput {
  name: string;
  color?: string;
}

export interface ExpenseFilters {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Income
// ─────────────────────────────────────────────────────────────────────────────

export type IncomeSource = 'SALARY' | 'BUSINESS' | 'FREELANCING' | 'INVESTMENT' | 'OTHER';

export interface Income {
  id: string;
  title: string;
  amount: string;
  description: string | null;
  transactionDate: string;
  source: IncomeSource;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedIncome {
  items: Income[];
  meta: PaginationMeta;
}

export interface IncomeSummary {
  totalAmount: number;
  incomeCount: number;
  averageAmount: number;
  bySource: Array<{
    source: IncomeSource;
    total: number;
    count: number;
  }>;
}

export interface CreateIncomeInput {
  title: string;
  amount: number;
  description?: string;
  transactionDate: string;
  source?: IncomeSource;
}

export type UpdateIncomeInput = Partial<CreateIncomeInput>;

export interface IncomeFilters {
  source?: IncomeSource;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Budget
// ─────────────────────────────────────────────────────────────────────────────

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';

export interface BudgetProgress {
  periodStart: string;
  periodEnd: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
  isNearThreshold: boolean;
}

export interface Budget {
  id: string;
  name: string;
  amount: string;
  currency: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string | null;
  alertThreshold: number;
  isActive: boolean;
  categoryId: string | null;
  category: Category | null;
  progress: BudgetProgress;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBudgets {
  items: Budget[];
  meta: PaginationMeta;
}

export interface CreateBudgetInput {
  name: string;
  amount: number;
  categoryId?: string;
  period: BudgetPeriod;
  startDate: string;
  endDate?: string;
  alertThreshold?: number;
}

export type UpdateBudgetInput = Partial<CreateBudgetInput> & { isActive?: boolean };

export interface BudgetFilters {
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Savings Goals
// ─────────────────────────────────────────────────────────────────────────────

export type GoalStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface GoalProgress {
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentageComplete: number;
  isCompleted: boolean;
  daysRemaining: number | null;
  estimatedCompletionDate: string | null;
  isOnTrack: boolean | null;
}

export interface SavingsGoal {
  id: string;
  name: string;
  description: string | null;
  targetAmount: string;
  currentAmount: string;
  currency: string;
  targetDate: string | null;
  status: GoalStatus;
  completedAt: string | null;
  progress: GoalProgress;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedGoals {
  items: SavingsGoal[];
  meta: PaginationMeta;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate?: string;
  initialAmount?: number;
}

export type UpdateGoalInput = Partial<Omit<CreateGoalInput, 'initialAmount'>> & {
  status?: GoalStatus;
};

export interface ContributeGoalInput {
  amount: number;
}

export interface GoalFilters {
  status?: GoalStatus;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard analytics
// ─────────────────────────────────────────────────────────────────────────────

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
  label: string;
  year: number;
  month: number;
  income: number;
  expense: number;
  net: number;
}

export interface DashboardAnalytics {
  overview: DashboardOverview;
  monthlyTrend: MonthlyTrendPoint[];
  categoryBreakdown: CategoryBreakdownItem[];
}
