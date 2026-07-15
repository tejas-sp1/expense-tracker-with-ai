import { BaseController } from '../../../core/controllers/base.controller.js';
import { asyncHandler } from '../../../core/http/async-handler.js';
import type { IIncomeService } from '../interfaces/income-service.interface.js';

import type { IncomeQueryDto } from '../dto/income-query.dto.js';
import type { IncomeSummaryQueryDto } from '../dto/income-summary-query.dto.js';

export class IncomeController extends BaseController {
  constructor(private readonly service: IIncomeService) {
    super();
  }

  getAll = asyncHandler(async (req, res) => {
    const result = await this.service.getAll({
      ...(req.query as unknown as Omit<IncomeQueryDto, 'userId'>),
      userId: req.userId,
    });
    this.ok(res, result);
  });

  getSummary = asyncHandler(async (req, res) => {
    const summary = await this.service.getSummary({
      ...(req.query as unknown as Omit<IncomeSummaryQueryDto, 'userId'>),
      userId: req.userId,
    });
    this.ok(res, summary);
  });

  getById = asyncHandler(async (req, res) => {
    const income = await this.service.getById(req.userId, String(req.params.id));
    this.ok(res, income);
  });

  create = asyncHandler(async (req, res) => {
    const income = await this.service.create({
      ...req.body,
      userId: req.userId,
    });
    this.created(res, income);
  });

  update = asyncHandler(async (req, res) => {
    const income = await this.service.update(req.userId, String(req.params.id), req.body);
    this.ok(res, income);
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.userId, String(req.params.id));
    this.noContent(res);
  });
}
