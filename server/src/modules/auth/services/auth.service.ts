import { IAuthService, AuthTokens } from '../interfaces/auth-service.interface.js';
import { IAuthRepository } from '../interfaces/auth-repository.interface.js';
import { RegisterDto } from '../dto/register.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { AppError } from '../../../core/errors/app-error.js';
import { signAccessToken } from '../../../infrastructure/auth/jwt.js';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

export class AuthService implements IAuthService {
  constructor(private authRepository: IAuthRepository) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    const existingUser = await this.authRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    // Split the space-separated string into discrete firstName and lastName pieces
    // Split the space-separated string into discrete firstName and lastName pieces
    const [firstName, ...lastNameParts] = (dto.name || '').trim().split(' ');
    const lastName = lastNameParts.join(' ');

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.authRepository.create({
      email: dto.email,
      passwordHash: hashedPassword,
      firstName: firstName || 'First', // Standard backup default if input is empty
      lastName: lastName || 'Last', // Standard backup default if no space provided
    });

    const tokens = this.generateTokens(user);
    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Check against passwordHash, but fallback to an empty string if null (e.g., Google OAuth users)
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash || '');

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }
  private generateTokens(
    user: Pick<User, 'id' | 'email' | 'role' | 'emailVerified'>,
  ): AuthTokens {
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    });
    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' },
    );
    return { accessToken, refreshToken };
  }
}
