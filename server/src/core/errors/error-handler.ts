import type { Env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import { ResponseFormatter } from '../http/response.js';
import { Logger } from '../logger/logger.js';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function createErrorHandler(env: Env) {
  const logger = new Logger('ErrorHandler', env);

  return function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
    if (err instanceof AppError) {
      logger.warn(err.message, {
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
      });

      ResponseFormatter.error(res, err.statusCode, {
        message: err.message,
        code: err.code,
        details: err.details,
      });
      return;
    }

    if (err instanceof ZodError) {
      ResponseFormatter.error(res, 400, {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.flatten().fieldErrors,
      });
      return;
    }

    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    ResponseFormatter.error(res, 500, {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  };
}
