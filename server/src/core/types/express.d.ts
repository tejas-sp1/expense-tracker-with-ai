import type { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
}

declare global {
  namespace Express {
    interface Request {
      userId: string;
      user: AuthUser;
    }
  }
}

export {};
