import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import type { Env } from './core/config/env.js';
import { createContainer, type AppContainer } from './core/di/container.js';
import { createErrorHandler } from './core/errors/error-handler.js';
import { createRequestLogger } from './core/middleware/request-logger.js';
import { registerRoutes } from './routes/index.js';

export function createApp(env: Env) {
  const app = express();
  const container: AppContainer = createContainer(env);

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(createRequestLogger(env));

  registerRoutes(app, container);
  app.use(createErrorHandler(env));

  return app;
}
