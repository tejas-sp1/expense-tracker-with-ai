import type { PrismaClient } from '@prisma/client';
import type { AuthUserRecord, GoogleProfile, IAuthRepository } from '../types/auth.types.js';

const activeUser = { deletedAt: null };

export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findUserByEmail(email: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), ...activeUser },
    });
  }

  findUserById(id: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findFirst({ where: { id, ...activeUser } });
  }

  findUserByGoogleId(googleId: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findFirst({ where: { googleId, ...activeUser } });
  }

  createLocalUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        authProvider: 'LOCAL',
        settings: { create: {} },
      },
    });
  }

  createGoogleUser(data: GoogleProfile) {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        googleId: data.googleId,
        authProvider: 'GOOGLE',
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
        emailVerified: data.emailVerified,
        settings: { create: {} },
      },
    });
  }

  linkGoogleAccount(userId: string, data: GoogleProfile) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId: data.googleId,
        authProvider: 'GOOGLE',
        avatarUrl: data.avatarUrl ?? undefined,
        emailVerified: data.emailVerified ? true : undefined,
      },
    });
  }

  updateLastLogin(userId: string): Promise<void> {
    return this.prisma.user
      .update({ where: { id: userId }, data: { lastLoginAt: new Date() } })
      .then(() => undefined);
  }

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<void> {
    return this.prisma.refreshToken.create({ data }).then(() => undefined);
  }

  findRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, revokedAt: true },
    });
  }

  revokeRefreshToken(id: string): Promise<void> {
    return this.prisma.refreshToken
      .update({ where: { id }, data: { revokedAt: new Date() } })
      .then(() => undefined);
  }

  revokeAllUserRefreshTokens(userId: string): Promise<void> {
    return this.prisma.refreshToken
      .updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } })
      .then(() => undefined);
  }

  createPasswordResetToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    return this.prisma.passwordResetToken.create({ data }).then(() => undefined);
  }

  findPasswordResetToken(tokenHash: string) {
    return this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
  }

  markPasswordResetTokenUsed(id: string): Promise<void> {
    return this.prisma.passwordResetToken
      .update({ where: { id }, data: { usedAt: new Date() } })
      .then(() => undefined);
  }

  updatePassword(userId: string, passwordHash: string): Promise<void> {
    return this.prisma.user
      .update({ where: { id: userId }, data: { passwordHash } })
      .then(() => undefined);
  }

  createEmailVerificationToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    return this.prisma.emailVerificationToken.create({ data }).then(() => undefined);
  }

  findEmailVerificationToken(tokenHash: string) {
    return this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
  }

  markEmailVerificationTokenUsed(id: string): Promise<void> {
    return this.prisma.emailVerificationToken
      .update({ where: { id }, data: { usedAt: new Date() } })
      .then(() => undefined);
  }

  markEmailVerified(userId: string): Promise<void> {
    return this.prisma.user
      .update({ where: { id: userId }, data: { emailVerified: true } })
      .then(() => undefined);
  }
}
