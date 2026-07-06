import bcrypt from 'bcryptjs';
import { getEnv } from '../../core/config/env.js';

export async function hashPassword(password: string): Promise<string> {
  const env = getEnv();
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
