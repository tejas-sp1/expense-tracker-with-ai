import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  APP_URL: z.string().default('http://localhost:5173'),
  API_URL: z.string().default('http://localhost:3001'),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REFRESH_COOKIE_NAME: z.string().default('refresh_token'),

  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('Expense Tracker <noreply@expense-tracker.local>'),

  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().default(60),
  EMAIL_VERIFY_EXPIRES_HOURS: z.coerce.number().default(24),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function loadEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten().fieldErrors);
    process.exit(1);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function getEnv(): Env {
  if (!cachedEnv) {
    throw new Error('Environment not loaded. Call loadEnv() first.');
  }
  return cachedEnv;
}
