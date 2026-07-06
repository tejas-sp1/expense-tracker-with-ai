import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout, AuthLink } from '@/features/auth/components/AuthLayout';
import { authApi } from '@/features/auth/api/auth-api';
import { getAuthErrorMessage } from '@/features/auth/context/AuthContext';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsPending(true);
    try {
      const result = await authApi.forgotPassword(email);
      setMessage(result.message);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      description="We'll send you a link to reset your password"
      footer={
        <>
          Remember your password? <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
    </AuthLayout>
  );
}
