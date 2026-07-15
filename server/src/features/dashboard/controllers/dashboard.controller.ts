import { BaseController } from '../../../core/controllers/base.controller.js';
import { asyncHandler } from '../../../core/http/async-handler.js';
import type { DashboardService } from '../services/dashboard.service.js';

export class DashboardController extends BaseController {
  constructor(private readonly service: DashboardService) {
    super();
  }

  getAnalytics = asyncHandler(async (req, res) => {
    const months = req.query.months ? Number(req.query.months) : 6;
    const analytics = await this.service.getAnalytics(req.userId, months);
    this.ok(res, analytics);
  });
}
