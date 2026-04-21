'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function RegisterPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center px-6 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground text-xs font-black transition-all group-hover:scale-110">
              SB
            </div>
            <span className="text-sm font-semibold">SplitBill Pro</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center opacity-0 animate-slide-up">
            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-3">Check your inbox.</h2>
            <p className="text-sm text-muted-foreground mb-8">
              We sent a confirmation link to{' '}
              <span className="text-foreground font-medium">{email}</span>.
              {' '}Click it to activate your account.
            </p>
            <Link
              href="/auth/login"
              className="text-sm text-primary hover:underline font-medium"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground text-xs font-black transition-all group-hover:scale-110">
            SB
          </div>
          <span className="text-sm font-semibold">SplitBill Pro</span>
        </Link>
        <p className="text-xs text-muted-foreground">
          Have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm opacity-0 animate-slide-up">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Create account.
            </h1>
            <p className="text-sm text-muted-foreground">
              Free forever. No credit card required.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 border border-destructive/40 bg-destructive/5 text-destructive text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-3 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                className="w-full px-3 py-3 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirm-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                name="confirm-password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-3 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-colors"
              />
            </div>

            <button
              id="btn-register"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 active:scale-[0.99] transition-[filter,transform] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            By creating an account you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
