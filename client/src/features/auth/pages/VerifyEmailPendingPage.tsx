import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { authApi } from '@/features/auth/api/auth-api';
import { useAuth, getAuthErrorMessage } from '@/features/auth/context/AuthContext';

export function VerifyEmailPendingPage() {
  const { user, logout } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleResend = async () => {
    setError('');
    setMessage('');
    setIsPending(true);
    try {
      const result = await authApi.resendVerification();
      setMessage(result.message);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      description={`We sent a verification link to ${user?.email ?? 'your email'}. Please verify before using the app.`}
    >
      <div className="space-y-4">
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleResend} disabled={isPending} className="w-full">
          {isPending ? 'Sending...' : 'Resend verification email'}
        </Button>
        <Button variant="outline" onClick={() => logout()} className="w-full">
          Sign out
        </Button>
      </div>
    </AuthLayout>
  );
}
