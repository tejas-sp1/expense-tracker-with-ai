// Unused Response import removed
import type { Env } from '../../../core/config/env.js';
import { BaseController } from '../../../core/controllers/base.controller.js';
import { UnauthorizedError } from '../../../core/errors/app-error.js';
import { asyncHandler } from '../../../core/http/async-handler.js';
import {
  clearRefreshCookie,
  getRefreshTokenFromRequest,
  getSessionMeta,
  setRefreshCookie,
} from '../../../core/utils/auth-cookies.js';
import type { AuthService } from '../services/auth.service.js';

export class AuthController extends BaseController {
  constructor(
    private readonly service: AuthService,
    private readonly env: Env,
  ) {
    super();
  }

  register = asyncHandler(async (req, res) => {
    const result = await this.service.register(req.body, getSessionMeta(req));
    setRefreshCookie(res, this.env, result.refreshToken);
    this.created(res, { user: result.user, accessToken: result.accessToken });
  });

  login = asyncHandler(async (req, res) => {
    const result = await this.service.login(req.body, getSessionMeta(req));
    setRefreshCookie(res, this.env, result.refreshToken);
    this.ok(res, { user: result.user, accessToken: result.accessToken });
  });

  refresh = asyncHandler(async (req, res) => {
    const refreshToken = getRefreshTokenFromRequest(req, this.env);
    if (!refreshToken) throw new UnauthorizedError('Refresh token missing');
    const result = await this.service.refresh(refreshToken, getSessionMeta(req));
    setRefreshCookie(res, this.env, result.refreshToken);
    this.ok(res, { user: result.user, accessToken: result.accessToken });
  });

  logout = asyncHandler(async (req, res) => {
    await this.service.logout(getRefreshTokenFromRequest(req, this.env));
    clearRefreshCookie(res, this.env);
    this.noContent(res);
  });

  me = asyncHandler(async (req, res) => {
    const user = await this.service.getMe(req.userId);
    this.ok(res, user);
  });

  forgotPassword = asyncHandler(async (req, res) => {
    await this.service.forgotPassword(req.body.email);
    this.message(res, 'If an account exists, a reset link has been sent.');
  });

  resetPassword = asyncHandler(async (req, res) => {
    await this.service.resetPassword(req.body.token, req.body.password);
    this.message(res, 'Password reset successful');
  });

  verifyEmail = asyncHandler(async (req, res) => {
    await this.service.verifyEmail(req.body.token);
    this.message(res, 'Email verified successfully');
  });

  resendVerification = asyncHandler(async (req, res) => {
    await this.service.resendVerification(req.userId);
    this.message(res, 'Verification email sent');
  });

  googleAuth = asyncHandler(async (_req, res) => {
    res.redirect(this.service.getGoogleAuthUrl());
  });

  googleCallback = asyncHandler(async (req, res) => {
    const code = req.query.code as string | undefined;
    if (!code) {
      res.redirect(`${this.env.APP_URL}/login?error=oauth_failed`);
      return;
    }
    const result = await this.service.handleGoogleCallback(code, getSessionMeta(req));
    setRefreshCookie(res, this.env, result.refreshToken);
    const params = new URLSearchParams({ accessToken: result.accessToken });
    res.redirect(`${this.env.APP_URL}/auth/callback?${params.toString()}`);
  });
}
