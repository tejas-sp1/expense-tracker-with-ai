import type { GoalStatus } from '@prisma/client';
import type { GoalEntity } from '../types/goal.types.js';
import type { CreateGoalDto } from '../dto/create-goal.dto.js';
import type { UpdateGoalDto } from '../dto/update-goal.dto.js';
import type { GoalQueryDto } from '../dto/goal-query.dto.js';

export interface IGoalRepository {
  findMany(filters: GoalQueryDto): Promise<{ items: GoalEntity[]; total: number }>;
  findById(userId: string, id: string): Promise<GoalEntity | null>;
  create(data: CreateGoalDto & { userId: string }): Promise<GoalEntity>;
  update(userId: string, id: string, data: UpdateGoalDto): Promise<GoalEntity>;
  updateProgress(
    userId: string,
    id: string,
    currentAmount: number,
    status: GoalStatus,
    completedAt: Date | null,
  ): Promise<GoalEntity>;
  softDelete(userId: string, id: string): Promise<void>;
}
