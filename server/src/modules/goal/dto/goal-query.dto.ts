import type { GoalStatus } from '@prisma/client';

export interface GoalQueryDto {
  userId: string;
  status?: GoalStatus;
  page?: number;
  limit?: number;
}
