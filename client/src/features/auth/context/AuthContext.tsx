import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/features/auth/api/auth-api';
import type { AuthSession, AuthUser, LoginInput, RegisterInput } from '@/features/auth/types';
import { getAccessToken, setAccessToken } from '@/lib/api-client';
import { ApiError } from '@/lib/api-client';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (session: AuthSession) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((session: AuthSession) => {
    setAccessToken(session.accessToken);
    setUser(session.user);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    async function init() {
      if (getAccessToken()) {
        await refreshUser();
        setIsLoading(false);
        return;
      }

      try {
        const session = await authApi.refresh();
        setSession(session);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [refreshUser, setSession]);

  const login = useCallback(
    async (input: LoginInput) => {
      const session = await authApi.login(input);
      setSession(session);
    },
    [setSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const session = await authApi.register(input);
      setSession(session);
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user && !!getAccessToken(),
      login,
      register,
      logout,
      setSession,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, setSession, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
