import { BaseController } from '../../../core/controllers/base.controller.js';
import { asyncHandler } from '../../../core/http/async-handler.js';
import type { IExpenseService } from '../interfaces/expense-service.interface.js';

import type { ExpenseQueryDto } from '../dto/expense-query.dto.js';
import type { ExpenseSummaryQueryDto } from '../dto/expense-summary-query.dto.js';

export class ExpenseController extends BaseController {
  constructor(private readonly service: IExpenseService) {
    super();
  }

  getAll = asyncHandler(async (req, res) => {
    const result = await this.service.getAll({
      ...(req.query as unknown as Omit<ExpenseQueryDto, 'userId'>),
      userId: req.userId,
    });
    this.ok(res, result);
  });

  getSummary = asyncHandler(async (req, res) => {
    const summary = await this.service.getSummary({
      ...(req.query as unknown as Omit<ExpenseSummaryQueryDto, 'userId'>),
      userId: req.userId,
    });
    this.ok(res, summary);
  });

  getById = asyncHandler(async (req, res) => {
    const expense = await this.service.getById(req.userId, String(req.params.id));
    this.ok(res, expense);
  });

  create = asyncHandler(async (req, res) => {
    const expense = await this.service.create({
      ...req.body,
      userId: req.userId,
    });
    this.created(res, expense);
  });

  update = asyncHandler(async (req, res) => {
    const expense = await this.service.update(req.userId, String(req.params.id), req.body);
    this.ok(res, expense);
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.userId, String(req.params.id));
    this.noContent(res);
  });
}
