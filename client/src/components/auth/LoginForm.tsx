import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/utils/api';
import { Lock, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch {
      // Error handled by AuthContext toast
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-white text-2xl font-bold shadow-lg shadow-[var(--primary)]/30">
          💬
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Welcome to WebChat</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Sign in to your account to start chatting</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--muted-foreground)]">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-9 bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--muted-foreground)]">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-9 bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)]"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] hover:bg-[var(--accent-violet-hover)] text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-[var(--primary)]/20 transition-all"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="border-t w-full border-[var(--border)]" />
        <span className="bg-[var(--card)] px-3 text-xs uppercase text-[var(--muted-foreground)] font-semibold absolute">
          Or continue with
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 border-[var(--border)] bg-[var(--secondary)] hover:bg-white/10 text-[var(--foreground)] py-2.5 rounded-xl transition-all"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
          />
        </svg>
        Sign in with Google
      </Button>

      <p className="text-center text-xs text-[var(--muted-foreground)]">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-[var(--primary)] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
