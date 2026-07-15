export interface BudgetQueryDto {
  userId: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
