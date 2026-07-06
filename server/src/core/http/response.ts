import type { Response } from 'express';
import type { ApiErrorBody, ApiResponse } from './types.js';

export class ResponseFormatter {
  static success<T>(res: Response, data: T, statusCode = 200, meta?: Record<string, unknown>): Response {
    const body: ApiResponse<T> = { success: true, data, ...(meta ? { meta } : {}) };
    return res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static message(res: Response, message: string, statusCode = 200): Response {
    return this.success(res, { message }, statusCode);
  }

  static error(
    res: Response,
    statusCode: number,
    error: ApiErrorBody,
  ): Response {
    const body: ApiResponse = { success: false, error };
    return res.status(statusCode).json(body);
  }
}
