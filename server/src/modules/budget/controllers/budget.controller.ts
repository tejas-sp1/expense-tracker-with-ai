import { BaseController } from '../../../core/controllers/base.controller.js';
import { asyncHandler } from '../../../core/http/async-handler.js';
import type { IBudgetService } from '../interfaces/budget-service.interface.js';
import type { BudgetQueryDto } from '../dto/budget-query.dto.js';

export class BudgetController extends BaseController {
  constructor(private readonly service: IBudgetService) {
    super();
  }

  getAll = asyncHandler(async (req, res) => {
    const result = await this.service.getAll({
      ...(req.query as unknown as Omit<BudgetQueryDto, 'userId'>),
      userId: req.userId,
    });
    this.ok(res, result);
  });

  getById = asyncHandler(async (req, res) => {
    const budget = await this.service.getById(req.userId, String(req.params.id));
    this.ok(res, budget);
  });

  create = asyncHandler(async (req, res) => {
    const budget = await this.service.create({
      ...req.body,
      userId: req.userId,
    });
    this.created(res, budget);
  });

  update = asyncHandler(async (req, res) => {
    const budget = await this.service.update(req.userId, String(req.params.id), req.body);
    this.ok(res, budget);
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.userId, String(req.params.id));
    this.noContent(res);
  });
}
