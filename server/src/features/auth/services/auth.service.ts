import { OAuth2Client } from 'google-auth-library';
import type { Env } from '../../../core/config/env.js';
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '../../../core/errors/app-error.js';
import { hashPassword, verifyPassword } from '../../../infrastructure/auth/password.js';
import { signAccessToken } from '../../../infrastructure/auth/jwt.js';
import {
  addDuration,
  addHours,
  addMinutes,
  generateSecureToken,
  hashToken,
} from '../../../infrastructure/auth/tokens.js';
import { EmailService } from '../../../infrastructure/email/email.service.js';
import type {
  AuthResponse,
  AuthUserRecord,
  GoogleProfile,
  IAuthRepository,
  LoginInput,
  RegisterInput,
  SessionMeta,
} from '../types/auth.types.js';

export class AuthService {
  private readonly emailService: EmailService;

  constructor(
    private readonly repository: IAuthRepository,
    private readonly env: Env,
  ) {
    this.emailService = new EmailService(env);
  }

  private toPublicUser(user: AuthUserRecord) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
    };
  }

  private async issueTokenPair(user: AuthUserRecord, meta: SessionMeta = {}) {
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    });

    const refreshToken = generateSecureToken(48);
    const tokenHash = hashToken(refreshToken);

    await this.repository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt: addDuration(new Date(), this.env.JWT_REFRESH_EXPIRES_IN),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    return { accessToken, refreshToken };
  }

  private async buildAuthResponse(
    user: AuthUserRecord,
    meta: SessionMeta,
  ): Promise<AuthResponse & { refreshToken: string }> {
    await this.repository.updateLastLogin(user.id);
    const tokens = await this.issueTokenPair(user, meta);
    return {
      user: this.toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  register(input: RegisterInput, meta: SessionMeta = {}) {
    return this.registerInternal(input, meta);
  }

  private async registerInternal(input: RegisterInput, meta: SessionMeta) {
    const existing = await this.repository.findUserByEmail(input.email);
    if (existing) throw new ConflictError('An account with this email already exists');

    const passwordHash = await hashPassword(input.password);
    const user = await this.repository.createLocalUser({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    await this.sendVerificationEmail(user.id, user.email);
    const record = await this.repository.findUserById(user.id);
    if (!record) throw new Error('User creation failed');
    return this.buildAuthResponse(record, meta);
  }

  login(input: LoginInput, meta: SessionMeta = {}) {
    return this.loginInternal(input, meta);
  }

  private async loginInternal(input: LoginInput, meta: SessionMeta) {
    const user = await this.repository.findUserByEmail(input.email);
    if (!user?.passwordHash) throw new UnauthorizedError('Invalid email or password');
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');
    return this.buildAuthResponse(user, meta);
  }

  async refresh(refreshToken: string, meta: SessionMeta = {}) {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.repository.findRefreshToken(tokenHash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    const user = await this.repository.findUserById(stored.userId);
    if (!user) throw new UnauthorizedError('User not found');
    await this.repository.revokeRefreshToken(stored.id);
    return this.buildAuthResponse(user, meta);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    const stored = await this.repository.findRefreshToken(tokenHash);
    if (stored && !stored.revokedAt) await this.repository.revokeRefreshToken(stored.id);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.repository.revokeAllUserRefreshTokens(userId);
  }

  async getMe(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return this.toPublicUser(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.repository.findUserByEmail(email);
    if (!user?.passwordHash) return;

    const token = generateSecureToken();
    await this.repository.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: addMinutes(new Date(), this.env.PASSWORD_RESET_EXPIRES_MINUTES),
    });

    const resetUrl = `${this.env.APP_URL}/reset-password?token=${token}`;
    await this.emailService.send({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
      text: `Reset your password: ${resetUrl}`,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const stored = await this.repository.findPasswordResetToken(hashToken(token));
    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new ValidationError('Invalid or expired reset token');
    }
    await this.repository.updatePassword(stored.userId, await hashPassword(newPassword));
    await this.repository.markPasswordResetTokenUsed(stored.id);
    await this.repository.revokeAllUserRefreshTokens(stored.userId);
  }

  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    const token = generateSecureToken();
    await this.repository.createEmailVerificationToken({
      userId,
      tokenHash: hashToken(token),
      expiresAt: addHours(new Date(), this.env.EMAIL_VERIFY_EXPIRES_HOURS),
    });
    const verifyUrl = `${this.env.APP_URL}/verify-email?token=${token}`;
    await this.emailService.send({
      to: email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
      text: `Verify your email: ${verifyUrl}`,
    });
  }

  async resendVerification(userId: string): Promise<void> {
    const user = await this.repository.findUserById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    if (user.emailVerified) throw new ValidationError('Email is already verified');
    await this.sendVerificationEmail(user.id, user.email);
  }

  async verifyEmail(token: string): Promise<void> {
    const stored = await this.repository.findEmailVerificationToken(hashToken(token));
    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new ValidationError('Invalid or expired verification token');
    }
    await this.repository.markEmailVerified(stored.userId);
    await this.repository.markEmailVerificationTokenUsed(stored.id);
  }

  getGoogleAuthUrl(): string {
    const client = this.getGoogleClient();
    if (!client) throw new ValidationError('Google OAuth is not configured');
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'consent',
    });
  }

  async handleGoogleCallback(code: string, meta: SessionMeta = {}) {
    const client = this.getGoogleClient();
    if (!client) throw new ValidationError('Google OAuth is not configured');

    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) throw new UnauthorizedError('Google authentication failed');

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) throw new UnauthorizedError('Google authentication failed');

    const profile: GoogleProfile = {
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name ?? 'Google',
      lastName: payload.family_name ?? 'User',
      avatarUrl: payload.picture,
      emailVerified: payload.email_verified ?? false,
    };

    let user = await this.repository.findUserByGoogleId(profile.googleId);
    if (!user) {
      const byEmail = await this.repository.findUserByEmail(profile.email);
      if (byEmail) {
        await this.repository.linkGoogleAccount(byEmail.id, profile);
        user = await this.repository.findUserById(byEmail.id);
      } else {
        const created = await this.repository.createGoogleUser(profile);
        user = await this.repository.findUserById(created.id);
      }
    }

    if (!user) throw new Error('Failed to resolve Google user');
    if (user.deletedAt) throw new ForbiddenError('Account is disabled');
    return this.buildAuthResponse(user, meta);
  }

  private getGoogleClient(): OAuth2Client | null {
    if (!this.env.GOOGLE_CLIENT_ID || !this.env.GOOGLE_CLIENT_SECRET || !this.env.GOOGLE_CALLBACK_URL) {
      return null;
    }
    return new OAuth2Client(
      this.env.GOOGLE_CLIENT_ID,
      this.env.GOOGLE_CLIENT_SECRET,
      this.env.GOOGLE_CALLBACK_URL,
    );
  }
}
