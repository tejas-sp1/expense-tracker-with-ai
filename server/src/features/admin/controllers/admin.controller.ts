import type { PrismaClient } from '@prisma/client';
import { BaseController } from '../../../core/controllers/base.controller.js';
import { asyncHandler } from '../../../core/http/async-handler.js';

export class AdminController extends BaseController {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  listUsers = asyncHandler(async (_req, res) => {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    this.ok(res, users);
  });
}
