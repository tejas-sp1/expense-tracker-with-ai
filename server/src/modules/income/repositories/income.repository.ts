import type { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../core/errors/app-error.js';
import type { IIncomeRepository } from '../interfaces/income-repository.interface.js';
import type { CreateIncomeDto } from '../dto/create-income.dto.js';
import type { UpdateIncomeDto } from '../dto/update-income.dto.js';
import type { IncomeQueryDto } from '../dto/income-query.dto.js';
import type { IncomeSummaryQueryDto } from '../dto/income-summary-query.dto.js';
import type { IncomeEntity, IncomeSummary } from '../types/income.types.js';

const activeIncome = { deletedAt: null };

export class IncomeRepository implements IIncomeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(filters: IncomeQueryDto): Promise<{ items: IncomeEntity[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      userId: filters.userId,
      ...activeIncome,
      ...(filters.source && { source: filters.source }),
      ...(filters.startDate || filters.endDate
        ? {
            transactionDate: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' as const } },
          { description: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.income.findMany({
        where,
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.income.count({ where }),
    ]);

    return { items, total };
  }

  findById(userId: string, id: string): Promise<IncomeEntity | null> {
    return this.prisma.income.findFirst({
      where: { id, userId, ...activeIncome },
    });
  }

  create(data: CreateIncomeDto & { userId: string }): Promise<IncomeEntity> {
    return this.prisma.income.create({
      data: {
        userId: data.userId,
        title: data.title,
        amount: data.amount,
        description: data.description,
        transactionDate: data.transactionDate,
        source: data.source ?? 'OTHER',
        currency: data.currency ?? 'USD',
      },
    });
  }

  async update(userId: string, id: string, data: UpdateIncomeDto): Promise<IncomeEntity> {
    // Note: Prisma updateMany returns a count, so we use it to check ownership and existence
    const result = await this.prisma.income.updateMany({
      where: { id, userId, ...activeIncome },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.transactionDate !== undefined && { transactionDate: data.transactionDate }),
        ...(data.source !== undefined && { source: data.source }),
        ...(data.currency !== undefined && { currency: data.currency }),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Income');
    }

    const updated = await this.findById(userId, id);
    if (!updated) {
      throw new NotFoundError('Income');
    }

    return updated;
  }

  async softDelete(userId: string, id: string): Promise<void> {
    const result = await this.prisma.income.updateMany({
      where: { id, userId, ...activeIncome },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      throw new NotFoundError('Income');
    }
  }

  async getSummary(filters: IncomeSummaryQueryDto): Promise<IncomeSummary> {
    const where = {
      userId: filters.userId,
      ...activeIncome,
      ...(filters.startDate || filters.endDate
        ? {
            transactionDate: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
    };

    const [aggregate, grouped] = await Promise.all([
      this.prisma.income.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
        _avg: { amount: true },
      }),
      this.prisma.income.groupBy({
        by: ['source'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const bySource = grouped.map((g) => ({
      source: g.source,
      total: Number(g._sum.amount ?? 0),
      count: g._count,
    }));

    return {
      totalAmount: Number(aggregate._sum.amount ?? 0),
      incomeCount: aggregate._count,
      averageAmount: Number(aggregate._avg.amount ?? 0),
      bySource,
    };
  }
}
