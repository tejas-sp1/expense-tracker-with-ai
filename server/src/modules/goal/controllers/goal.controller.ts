import { BaseController } from '../../../core/controllers/base.controller.js';
import { asyncHandler } from '../../../core/http/async-handler.js';
import type { IGoalService } from '../interfaces/goal-service.interface.js';
import type { GoalQueryDto } from '../dto/goal-query.dto.js';

export class GoalController extends BaseController {
  constructor(private readonly service: IGoalService) {
    super();
  }

  getAll = asyncHandler(async (req, res) => {
    const result = await this.service.getAll({
      ...(req.query as unknown as Omit<GoalQueryDto, 'userId'>),
      userId: req.userId,
    });
    this.ok(res, result);
  });

  getById = asyncHandler(async (req, res) => {
    const goal = await this.service.getById(req.userId, String(req.params.id));
    this.ok(res, goal);
  });

  create = asyncHandler(async (req, res) => {
    const goal = await this.service.create({
      ...req.body,
      userId: req.userId,
    });
    this.created(res, goal);
  });

  update = asyncHandler(async (req, res) => {
    const goal = await this.service.update(req.userId, String(req.params.id), req.body);
    this.ok(res, goal);
  });

  contribute = asyncHandler(async (req, res) => {
    const goal = await this.service.contribute(req.userId, String(req.params.id), req.body);
    this.ok(res, goal);
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.userId, String(req.params.id));
    this.noContent(res);
  });
}
