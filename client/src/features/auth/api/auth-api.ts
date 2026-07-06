import { api } from '@/lib/api-client';
import type { AuthSession, LoginInput, RegisterInput } from '../types';

export const authApi = {
  register: (data: RegisterInput) => api.post<AuthSession>('/auth/register', data),
  login: (data: LoginInput) => api.post<AuthSession>('/auth/login', data),
  refresh: () => api.post<AuthSession>('/auth/refresh', {}),
  logout: () => api.post<void>('/auth/logout', {}),
  me: () => api.get<AuthSession['user']>('/auth/me'),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) =>
    api.post<{ message: string }>('/auth/verify-email', { token }),
  resendVerification: () =>
    api.post<{ message: string }>('/auth/resend-verification', {}),
};

export function getGoogleAuthUrl(): string {
  const base = import.meta.env.VITE_API_URL ?? '/api';
  return `${base}/auth/google`;
}
