import type { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../core/errors/app-error.js';
import type { IExpenseRepository } from '../interfaces/expense-repository.interface.js';
import type { CreateExpenseDto } from '../dto/create-expense.dto.js';
import type { UpdateExpenseDto } from '../dto/update-expense.dto.js';
import type { ExpenseQueryDto } from '../dto/expense-query.dto.js';
import type { ExpenseSummaryQueryDto } from '../dto/expense-summary-query.dto.js';
import type { ExpenseEntity, ExpenseSummary } from '../types/expense.types.js';

const activeExpense = { deletedAt: null };

export class ExpenseRepository implements IExpenseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(filters: ExpenseQueryDto): Promise<{ items: ExpenseEntity[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      userId: filters.userId,
      ...activeExpense,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
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
          { merchantName: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return { items, total };
  }

  findById(userId: string, id: string): Promise<ExpenseEntity | null> {
    return this.prisma.expense.findFirst({
      where: { id, userId, ...activeExpense },
      include: { category: true },
    });
  }

  create(data: CreateExpenseDto & { userId: string }): Promise<ExpenseEntity> {
    return this.prisma.expense.create({
      data: {
        userId: data.userId,
        title: data.title,
        amount: data.amount,
        description: data.description,
        transactionDate: data.transactionDate,
        categoryId: data.categoryId,
        merchantName: data.merchantName,
        paymentMethod: data.paymentMethod ?? 'CASH',
      },
      include: { category: true },
    });
  }

  async update(userId: string, id: string, data: UpdateExpenseDto): Promise<ExpenseEntity> {
    // Note: Prisma updateMany returns a count, so we use it to check ownership and existence
    const result = await this.prisma.expense.updateMany({
      where: { id, userId, ...activeExpense },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.transactionDate !== undefined && { transactionDate: data.transactionDate }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.merchantName !== undefined && { merchantName: data.merchantName }),
        ...(data.paymentMethod !== undefined && { paymentMethod: data.paymentMethod }),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Expense');
    }

    const updated = await this.findById(userId, id);
    if (!updated) {
      throw new NotFoundError('Expense');
    }

    return updated;
  }

  async softDelete(userId: string, id: string): Promise<void> {
    const result = await this.prisma.expense.updateMany({
      where: { id, userId, ...activeExpense },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      throw new NotFoundError('Expense');
    }
  }

  async getSummary(filters: ExpenseSummaryQueryDto): Promise<ExpenseSummary> {
    const where = {
      userId: filters.userId,
      ...activeExpense,
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
      this.prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
        _avg: { amount: true },
      }),
      this.prisma.expense.groupBy({
        by: ['categoryId'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const categoryIds = grouped.map((g) => g.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const byCategory = grouped.map((g) => {
      const category = categoryMap.get(g.categoryId);
      return {
        categoryId: g.categoryId,
        categoryName: category?.name ?? 'Unknown',
        categoryColor: category?.color ?? '#6366f1',
        total: Number(g._sum.amount ?? 0),
        count: g._count,
      };
    });

    return {
      totalAmount: Number(aggregate._sum.amount ?? 0),
      expenseCount: aggregate._count,
      averageAmount: Number(aggregate._avg.amount ?? 0),
      byCategory,
    };
  }
}
