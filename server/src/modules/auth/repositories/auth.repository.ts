import { IAuthRepository } from '../interfaces/auth-repository.interface.js';
import { prisma } from '../../../infrastructure/database/prisma.js';
import { User, Prisma } from '@prisma/client';

export class AuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }
}
