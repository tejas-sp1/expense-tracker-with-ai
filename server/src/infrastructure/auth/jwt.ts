import jwt from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { getEnv } from '../../core/config/env.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'expense-tracker',
    audience: 'expense-tracker-api',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const env = getEnv();
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'expense-tracker',
    audience: 'expense-tracker-api',
  });

  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Invalid token payload');
  }

  return {
    sub: decoded.sub,
    email: decoded.email as string,
    role: decoded.role as UserRole,
    emailVerified: decoded.emailVerified as boolean,
  };
}
