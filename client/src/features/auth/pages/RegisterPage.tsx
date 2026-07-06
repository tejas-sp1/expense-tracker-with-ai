import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout, AuthLink } from '@/features/auth/components/AuthLayout';
import { useAuth, getAuthErrorMessage } from '@/features/auth/context/AuthContext';
import { getGoogleAuthUrl } from '@/features/auth/api/auth-api';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPending(true);
    try {
      await register(form);
      navigate('/verify-email-pending', { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      description="Start tracking your expenses today"
      footer={
        <>
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
          <p className="text-xs text-muted-foreground">
            Min 8 chars with uppercase, lowercase, and a number
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Creating account...' : 'Create account'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            window.location.href = getGoogleAuthUrl();
          }}
        >
          Sign up with Google
        </Button>
      </form>
    </AuthLayout>
  );
}
