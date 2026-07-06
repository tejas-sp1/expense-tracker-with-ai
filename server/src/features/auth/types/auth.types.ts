import type { AuthProvider, User, UserRole } from '@prisma/client';

export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  authProvider: AuthProvider;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  avatarUrl: string | null;
  deletedAt: Date | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    emailVerified: boolean;
    avatarUrl: string | null;
  };
  accessToken: string;
}

export interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<AuthUserRecord | null>;
  findUserById(id: string): Promise<AuthUserRecord | null>;
  findUserByGoogleId(googleId: string): Promise<AuthUserRecord | null>;
  createLocalUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<User>;
  createGoogleUser(data: GoogleProfile): Promise<User>;
  linkGoogleAccount(userId: string, data: GoogleProfile): Promise<User>;
  updateLastLogin(userId: string): Promise<void>;
  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<void>;
  findRefreshToken(tokenHash: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null>;
  revokeRefreshToken(id: string): Promise<void>;
  revokeAllUserRefreshTokens(userId: string): Promise<void>;
  createPasswordResetToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  findPasswordResetToken(tokenHash: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    usedAt: Date | null;
  } | null>;
  markPasswordResetTokenUsed(id: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  createEmailVerificationToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  findEmailVerificationToken(tokenHash: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    usedAt: Date | null;
  } | null>;
  markEmailVerificationTokenUsed(id: string): Promise<void>;
  markEmailVerified(userId: string): Promise<void>;
}
