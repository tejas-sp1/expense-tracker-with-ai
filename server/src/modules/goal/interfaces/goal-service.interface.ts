import type { PaginatedResponse } from '../../../core/http/types.js';
import type { GoalWithProgress } from '../types/goal.types.js';
import type { CreateGoalDto } from '../dto/create-goal.dto.js';
import type { UpdateGoalDto } from '../dto/update-goal.dto.js';
import type { ContributeGoalDto } from '../dto/contribute-goal.dto.js';
import type { GoalQueryDto } from '../dto/goal-query.dto.js';

export interface IGoalService {
  getAll(filters: GoalQueryDto): Promise<PaginatedResponse<GoalWithProgress>>;
  getById(userId: string, id: string): Promise<GoalWithProgress>;
  create(input: CreateGoalDto & { userId: string }): Promise<GoalWithProgress>;
  update(userId: string, id: string, input: UpdateGoalDto): Promise<GoalWithProgress>;
  contribute(userId: string, id: string, input: ContributeGoalDto): Promise<GoalWithProgress>;
  delete(userId: string, id: string): Promise<void>;
}
