export interface ExpenseQueryDto {
  userId: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}
