import type { Response } from 'express';
import { ResponseFormatter } from '../http/response.js';

export abstract class BaseController {
  protected ok<T>(res: Response, data: T): Response {
    return ResponseFormatter.success(res, data);
  }

  protected created<T>(res: Response, data: T): Response {
    return ResponseFormatter.created(res, data);
  }

  protected noContent(res: Response): Response {
    return ResponseFormatter.noContent(res);
  }

  protected message(res: Response, message: string, statusCode = 200): Response {
    return ResponseFormatter.message(res, message, statusCode);
  }
}
