import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout, AuthLink } from '@/features/auth/components/AuthLayout';
import { authApi } from '@/features/auth/api/auth-api';
import { getAuthErrorMessage } from '@/features/auth/context/AuthContext';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid reset link');
      return;
    }
    setError('');
    setIsPending(true);
    try {
      await authApi.resetPassword(token, password);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      description="Choose a new password for your account"
      footer={
        <>
          <AuthLink to="/login">Back to sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!token && <p className="text-sm text-destructive">Missing or invalid reset token.</p>}
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending || !token}>
          {isPending ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
