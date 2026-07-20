import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../interfaces/auth-service.interface.js';

export class AuthController {
  constructor(private authService: IAuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, tokens } = await this.authService.register(req.body);
      this.setCookieTokens(res, tokens);
      res.status(201).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, tokens } = await this.authService.login(req.body);
      this.setCookieTokens(res, tokens);
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  };

  private setCookieTokens(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 mins
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
