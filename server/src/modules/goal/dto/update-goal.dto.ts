import type { GoalStatus } from '@prisma/client';

export interface UpdateGoalDto {
  name?: string;
  description?: string | null;
  targetAmount?: number;
  targetDate?: Date | null;
  status?: GoalStatus;
  currency?: string;
}
