import type { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../core/errors/app-error.js';
import type { IBudgetRepository } from '../interfaces/budget-repository.interface.js';
import type { CreateBudgetDto } from '../dto/create-budget.dto.js';
import type { UpdateBudgetDto } from '../dto/update-budget.dto.js';
import type { BudgetQueryDto } from '../dto/budget-query.dto.js';
import type { BudgetEntity } from '../types/budget.types.js';

const activeBudget = { deletedAt: null };

export class BudgetRepository implements IBudgetRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(filters: BudgetQueryDto): Promise<{ items: BudgetEntity[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      userId: filters.userId,
      ...activeBudget,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.budget.findMany({
        where,
        include: { category: true },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.budget.count({ where }),
    ]);

    return { items, total };
  }

  findById(userId: string, id: string): Promise<BudgetEntity | null> {
    return this.prisma.budget.findFirst({
      where: { id, userId, ...activeBudget },
      include: { category: true },
    });
  }

  create(data: CreateBudgetDto & { userId: string }): Promise<BudgetEntity> {
    return this.prisma.budget.create({
      data: {
        userId: data.userId,
        name: data.name,
        amount: data.amount,
        categoryId: data.categoryId,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        alertThreshold: data.alertThreshold ?? 80,
        currency: data.currency ?? 'USD',
      },
      include: { category: true },
    });
  }

  async update(userId: string, id: string, data: UpdateBudgetDto): Promise<BudgetEntity> {
    // Note: Prisma updateMany returns a count, so we use it to check ownership and existence
    const result = await this.prisma.budget.updateMany({
      where: { id, userId, ...activeBudget },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.period !== undefined && { period: data.period }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.alertThreshold !== undefined && { alertThreshold: data.alertThreshold }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.currency !== undefined && { currency: data.currency }),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Budget');
    }

    const updated = await this.findById(userId, id);
    if (!updated) {
      throw new NotFoundError('Budget');
    }

    return updated;
  }

  async softDelete(userId: string, id: string): Promise<void> {
    const result = await this.prisma.budget.updateMany({
      where: { id, userId, ...activeBudget },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      throw new NotFoundError('Budget');
    }
  }

  async getSpentAmount(
    userId: string,
    categoryId: string | null,
    start: Date,
    end: Date,
  ): Promise<number> {
    const result = await this.prisma.expense.aggregate({
      where: {
        userId,
        deletedAt: null,
        ...(categoryId && { categoryId }),
        transactionDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    return Number(result._sum.amount ?? 0);
  }
}
