import { Router } from 'express';
import { authenticate } from '../../../core/middleware/authenticate.js';
import { validate } from '../../../core/middleware/validate.js';
import type { AuthController } from '../controllers/auth.controller.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validation/auth.schema.js';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/register', validate(registerSchema), controller.register);
  router.post('/login', validate(loginSchema), controller.login);
  router.post('/refresh', controller.refresh);
  router.post('/logout', controller.logout);
  router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
  router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
  router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);

  router.get('/google', controller.googleAuth);
  router.get('/google/callback', controller.googleCallback);

  router.get('/me', authenticate(), controller.me);
  router.post('/resend-verification', authenticate(), controller.resendVerification);

  return router;
}
