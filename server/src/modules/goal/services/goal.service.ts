import { NotFoundError, ValidationError } from '../../../core/errors/app-error.js';
import type { PaginatedResponse } from '../../../core/http/types.js';
import type { IGoalService } from '../interfaces/goal-service.interface.js';
import type { IGoalRepository } from '../interfaces/goal-repository.interface.js';
import type { CreateGoalDto } from '../dto/create-goal.dto.js';
import type { UpdateGoalDto } from '../dto/update-goal.dto.js';
import type { ContributeGoalDto } from '../dto/contribute-goal.dto.js';
import type { GoalQueryDto } from '../dto/goal-query.dto.js';
import type { GoalEntity, GoalProgress, GoalWithProgress } from '../types/goal.types.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class GoalService implements IGoalService {
  constructor(private readonly repository: IGoalRepository) {}

  private buildProgress(goal: GoalEntity): GoalProgress {
    const targetAmount = Number(goal.targetAmount);
    const currentAmount = Number(goal.currentAmount);
    const remainingAmount = Math.max(targetAmount - currentAmount, 0);
    const percentageComplete =
      targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
    const isCompleted = goal.status === 'COMPLETED' || currentAmount >= targetAmount;

    const now = new Date();
    const daysRemaining = goal.targetDate
      ? Math.ceil((goal.targetDate.getTime() - now.getTime()) / MS_PER_DAY)
      : null;

    // Estimate completion using the average daily savings rate since the goal was
    // created. This is a simple heuristic (no contribution history is stored),
    // not a precise forecast — it just gives the user a rough sense of pace.
    const daysSinceCreated = Math.max((now.getTime() - goal.createdAt.getTime()) / MS_PER_DAY, 1);
    const dailyRate = currentAmount / daysSinceCreated;

    let estimatedCompletionDate: string | null = null;
    let isOnTrack: boolean | null = null;

    if (isCompleted) {
      estimatedCompletionDate = (goal.completedAt ?? now).toISOString();
      isOnTrack = goal.targetDate ? true : null;
    } else if (dailyRate > 0) {
      const daysToFinish = remainingAmount / dailyRate;
      const estimated = new Date(now.getTime() + daysToFinish * MS_PER_DAY);
      estimatedCompletionDate = estimated.toISOString();
      if (goal.targetDate) {
        isOnTrack = estimated.getTime() <= goal.targetDate.getTime();
      }
    }

    return {
      targetAmount,
      currentAmount,
      remainingAmount,
      percentageComplete,
      isCompleted,
      daysRemaining,
      estimatedCompletionDate,
      isOnTrack,
    };
  }

  private attachProgress(goal: GoalEntity): GoalWithProgress {
    return { ...goal, progress: this.buildProgress(goal) };
  }

  async getAll(filters: GoalQueryDto): Promise<PaginatedResponse<GoalWithProgress>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const { items, total } = await this.repository.findMany({ ...filters, page, limit });

    return {
      items: items.map((g) => this.attachProgress(g)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(userId: string, id: string): Promise<GoalWithProgress> {
    const goal = await this.repository.findById(userId, id);
    if (!goal) {
      throw new NotFoundError('Savings goal');
    }
    return this.attachProgress(goal);
  }

  async create(input: CreateGoalDto & { userId: string }): Promise<GoalWithProgress> {
    const created = await this.repository.create(input);
    return this.attachProgress(created);
  }

  async update(userId: string, id: string, input: UpdateGoalDto): Promise<GoalWithProgress> {
    // Check if the resource exists and belongs to the user
    await this.getById(userId, id);
    const updated = await this.repository.update(userId, id, input);
    return this.attachProgress(updated);
  }

  async contribute(
    userId: string,
    id: string,
    input: ContributeGoalDto,
  ): Promise<GoalWithProgress> {
    const goal = await this.getById(userId, id);
    const newAmount = Number(goal.currentAmount) + input.amount;

    if (newAmount < 0) {
      throw new ValidationError('Contribution would make the current amount negative');
    }

    const targetAmount = Number(goal.targetAmount);
    const isNowComplete = newAmount >= targetAmount;
    const status = isNowComplete
      ? 'COMPLETED'
      : goal.status === 'COMPLETED'
        ? 'ACTIVE'
        : goal.status;
    const completedAt = isNowComplete ? (goal.completedAt ?? new Date()) : null;

    const updated = await this.repository.updateProgress(
      userId,
      id,
      newAmount,
      status,
      completedAt,
    );
    return this.attachProgress(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    // Check if the resource exists and belongs to the user
    await this.getById(userId, id);
    await this.repository.softDelete(userId, id);
  }
}
