import { BaseController } from '../../../core/controllers/base.controller.js';
import { asyncHandler } from '../../../core/http/async-handler.js';
import type { CategoryService } from '../services/category.service.js';

export class CategoryController extends BaseController {
  constructor(private readonly service: CategoryService) {
    super();
  }

  getAll = asyncHandler(async (req, res) => {
    const categories = await this.service.getAll(req.userId);
    this.ok(res, categories);
  });

  getById = asyncHandler(async (req, res) => {
    const category = await this.service.getById(req.userId, String(req.params.id));
    this.ok(res, category);
  });

  create = asyncHandler(async (req, res) => {
    const category = await this.service.create(req.userId, req.body);
    this.created(res, category);
  });

  update = asyncHandler(async (req, res) => {
    const category = await this.service.update(req.userId, String(req.params.id), req.body);
    this.ok(res, category);
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.userId, String(req.params.id));
    this.noContent(res);
  });
}
