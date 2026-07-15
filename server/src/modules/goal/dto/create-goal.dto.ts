export interface CreateGoalDto {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate?: Date;
  currency?: string;
  initialAmount?: number;
}
