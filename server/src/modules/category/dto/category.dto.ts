export interface CreateCategoryDto {
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon?: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
  color?: string;
}
