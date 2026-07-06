import type { Env } from '../config/env.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface LogMeta {
  [key: string]: unknown;
}

export class Logger {
  private readonly minLevel: number;

  constructor(
    private readonly context: string,
    env?: Env,
  ) {
    const level = env?.LOG_LEVEL ?? 'info';
    this.minLevel = LEVELS[level];
  }

  debug(message: string, meta?: LogMeta): void {
    this.write('debug', message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: LogMeta): void {
    this.write('error', message, meta);
  }

  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`);
  }

  private write(level: LogLevel, message: string, meta?: LogMeta): void {
    if (LEVELS[level] < this.minLevel) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    };

    const output = JSON.stringify(entry);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }
}
