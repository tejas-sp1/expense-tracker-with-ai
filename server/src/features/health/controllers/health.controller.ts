import type { PrismaClient } from '@prisma/client';
import { BaseController } from '../../../core/controllers/base.controller.js';
import { asyncHandler } from '../../../core/http/async-handler.js';
import { ResponseFormatter } from '../../../core/http/response.js';

export class HealthController extends BaseController {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  check = asyncHandler(async (_req, res) => {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.ok(res, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      });
    } catch {
      ResponseFormatter.error(res, 503, {
        message: 'Service unavailable',
        code: 'UNHEALTHY',
      });
    }
  });
}
