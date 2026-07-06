import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../errors/app-error.js';

export function requireVerifiedEmail(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.emailVerified) {
    next(new ForbiddenError('Email verification required'));
    return;
  }
  next();
}
