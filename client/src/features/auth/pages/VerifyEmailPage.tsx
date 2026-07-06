import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout, AuthLink } from '@/features/auth/components/AuthLayout';
import { authApi } from '@/features/auth/api/auth-api';
import { useAuth, getAuthErrorMessage } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }
      try {
        const result = await authApi.verifyEmail(token);
        await refreshUser();
        setMessage(result.message);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(getAuthErrorMessage(err));
      }
    }
    verify();
  }, [token, refreshUser]);

  return (
    <AuthLayout title="Email verification" description="Confirming your email address">
      {status === 'loading' && <Skeleton className="h-8 w-full" />}
      {status === 'success' && (
        <div className="space-y-4">
          <p className="text-sm text-green-600">{message}</p>
          <Button className="w-full" onClick={() => navigate('/', { replace: true })}>
            Continue to dashboard
          </Button>
        </div>
      )}
      {status === 'error' && (
        <div className="space-y-4">
          <p className="text-sm text-destructive">{message}</p>
          <AuthLink to="/login">Back to sign in</AuthLink>
        </div>
      )}
    </AuthLayout>
  );
}
