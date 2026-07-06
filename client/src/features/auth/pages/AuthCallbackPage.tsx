import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/context/AuthContext';
import { authApi } from '@/features/auth/api/auth-api';
import { setAccessToken } from '@/lib/api-client';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  useEffect(() => {
    async function handleCallback() {
      const accessToken = searchParams.get('accessToken');
      if (accessToken) {
        setAccessToken(accessToken);
        try {
          const user = await authApi.me();
          setSession({ accessToken, user });
          navigate('/', { replace: true });
          return;
        } catch {
          navigate('/login?error=oauth_failed', { replace: true });
          return;
        }
      }
      navigate('/login?error=oauth_failed', { replace: true });
    }
    handleCallback();
  }, [searchParams, navigate, setSession]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Skeleton className="h-8 w-48" />
    </div>
  );
}
