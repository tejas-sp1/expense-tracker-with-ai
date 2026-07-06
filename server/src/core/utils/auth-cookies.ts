import type { CookieOptions, Request, Response } from 'express';
import type { Env } from '../config/env.js';

export function getSessionMeta(req: Request) {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
}

export function setRefreshCookie(res: Response, env: Env, refreshToken: string): void {
  const options: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, options);
}

export function clearRefreshCookie(res: Response, env: Env): void {
  res.clearCookie(env.REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
  });
}

export function getRefreshTokenFromRequest(req: Request, env: Env): string | undefined {
  return req.cookies?.[env.REFRESH_COOKIE_NAME] as string | undefined;
}
