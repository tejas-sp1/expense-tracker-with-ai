import { User } from '@prisma/client';
import { RegisterDto } from '../dto/register.dto.js';
import { LoginDto } from '../dto/login.dto.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
  register(dto: RegisterDto): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }>;
  login(dto: LoginDto): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }>;
}
