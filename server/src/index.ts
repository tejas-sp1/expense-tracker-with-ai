import 'dotenv/config';
import { createApp } from './app.js';
import { loadEnv } from './core/config/env.js';
import { Logger } from './core/logger/logger.js';
import { prisma } from './infrastructure/database/prisma.js';

const env = loadEnv();
const logger = new Logger('Bootstrap', env);
const app = createApp(env);

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`, { port: env.PORT });
});

async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
