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

export interface ExpenseSummary {
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    total: number;
    count: number;
  }>;
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
