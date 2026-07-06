import type { NextFunction, Request, Response } from 'express';
import type { Env } from '../config/env.js';
import { Logger } from '../logger/logger.js';

export function createRequestLogger(env: Env) {
  const logger = new Logger('HTTP', env);

  return function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      logger.info('Request completed', {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        userId: req.userId,
      });
    });

    next();
  };
}
