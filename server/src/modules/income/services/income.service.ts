import { NotFoundError } from '../../../core/errors/app-error.js';
import type { PaginatedResponse } from '../../../core/http/types.js';
import type { IIncomeService } from '../interfaces/income-service.interface.js';
import type { IIncomeRepository } from '../interfaces/income-repository.interface.js';
import type { CreateIncomeDto } from '../dto/create-income.dto.js';
import type { UpdateIncomeDto } from '../dto/update-income.dto.js';
import type { IncomeQueryDto } from '../dto/income-query.dto.js';
import type { IncomeSummaryQueryDto } from '../dto/income-summary-query.dto.js';
import type { IncomeEntity, IncomeSummary } from '../types/income.types.js';

export class IncomeService implements IIncomeService {
  constructor(private readonly repository: IIncomeRepository) {}

  async getAll(filters: IncomeQueryDto): Promise<PaginatedResponse<IncomeEntity>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const { items, total } = await this.repository.findMany({ ...filters, page, limit });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(userId: string, id: string): Promise<IncomeEntity> {
    const income = await this.repository.findById(userId, id);
    if (!income) {
      throw new NotFoundError('Income');
    }
    return income;
  }

  async create(input: CreateIncomeDto & { userId: string }): Promise<IncomeEntity> {
    return this.repository.create(input);
  }

  async update(userId: string, id: string, input: UpdateIncomeDto): Promise<IncomeEntity> {
    // Check if the resource exists and belongs to the user
    await this.getById(userId, id);
    return this.repository.update(userId, id, input);
  }

  async delete(userId: string, id: string): Promise<void> {
    // Check if the resource exists and belongs to the user
    await this.getById(userId, id);
    await this.repository.softDelete(userId, id);
  }

  async getSummary(filters: IncomeSummaryQueryDto): Promise<IncomeSummary> {
    return this.repository.getSummary(filters);
  }
}
