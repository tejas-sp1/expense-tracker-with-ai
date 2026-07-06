// Unused Express imports removed
import { verifyAccessToken } from '../../infrastructure/auth/jwt.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { asyncHandler } from '../http/async-handler.js';

export function authenticate() {
  return asyncHandler(async (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.userId = user.id;
    req.user = user;
    next();
  });
}
