import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout, AuthLink } from '@/features/auth/components/AuthLayout';
import { useAuth, getAuthErrorMessage } from '@/features/auth/context/AuthContext';
import { getGoogleAuthUrl } from '@/features/auth/api/auth-api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPending(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      description="Enter your credentials to access your account"
      footer={
        <>
          Don&apos;t have an account? <AuthLink to="/register">Sign up</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <AuthLink to="/forgot-password">Forgot password?</AuthLink>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            window.location.href = getGoogleAuthUrl();
          }}
        >
          Continue with Google
        </Button>
      </form>
    </AuthLayout>
  );
}
