import type { GoalStatus, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../core/errors/app-error.js';
import type { IGoalRepository } from '../interfaces/goal-repository.interface.js';
import type { CreateGoalDto } from '../dto/create-goal.dto.js';
import type { UpdateGoalDto } from '../dto/update-goal.dto.js';
import type { GoalQueryDto } from '../dto/goal-query.dto.js';
import type { GoalEntity } from '../types/goal.types.js';

const activeGoal = { deletedAt: null };

export class GoalRepository implements IGoalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(filters: GoalQueryDto): Promise<{ items: GoalEntity[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      userId: filters.userId,
      ...activeGoal,
      ...(filters.status && { status: filters.status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.savingsGoal.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.savingsGoal.count({ where }),
    ]);

    return { items, total };
  }

  findById(userId: string, id: string): Promise<GoalEntity | null> {
    return this.prisma.savingsGoal.findFirst({
      where: { id, userId, ...activeGoal },
    });
  }

  create(data: CreateGoalDto & { userId: string }): Promise<GoalEntity> {
    return this.prisma.savingsGoal.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        targetAmount: data.targetAmount,
        currentAmount: data.initialAmount ?? 0,
        targetDate: data.targetDate,
        currency: data.currency ?? 'USD',
      },
    });
  }

  async update(userId: string, id: string, data: UpdateGoalDto): Promise<GoalEntity> {
    // Note: Prisma updateMany returns a count, so we use it to check ownership and existence
    const result = await this.prisma.savingsGoal.updateMany({
      where: { id, userId, ...activeGoal },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
        ...(data.targetDate !== undefined && { targetDate: data.targetDate }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.currency !== undefined && { currency: data.currency }),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Savings goal');
    }

    const updated = await this.findById(userId, id);
    if (!updated) {
      throw new NotFoundError('Savings goal');
    }

    return updated;
  }

  async updateProgress(
    userId: string,
    id: string,
    currentAmount: number,
    status: GoalStatus,
    completedAt: Date | null,
  ): Promise<GoalEntity> {
    const result = await this.prisma.savingsGoal.updateMany({
      where: { id, userId, ...activeGoal },
      data: { currentAmount, status, completedAt },
    });

    if (result.count === 0) {
      throw new NotFoundError('Savings goal');
    }

    const updated = await this.findById(userId, id);
    if (!updated) {
      throw new NotFoundError('Savings goal');
    }

    return updated;
  }

  async softDelete(userId: string, id: string): Promise<void> {
    const result = await this.prisma.savingsGoal.updateMany({
      where: { id, userId, ...activeGoal },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      throw new NotFoundError('Savings goal');
    }
  }
}
