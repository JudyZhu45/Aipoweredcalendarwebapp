import React, { useState } from 'react';

type Mode = 'login' | 'register' | 'confirm';

interface AuthPageProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
  onConfirm: (code: string, password: string) => void;
  onResendCode: () => void;
  isLoading: boolean;
  error: string | null;
  pendingEmail: string | null;
}

export function AuthPage({
  onLogin,
  onRegister,
  onConfirm,
  onResendCode,
  isLoading,
  error,
  pendingEmail,
}: AuthPageProps) {
  const [mode, setMode] = useState<Mode>(pendingEmail ? 'confirm' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');

  // Switch to confirm mode if parent signals pending email
  React.useEffect(() => {
    if (pendingEmail) setMode('confirm');
  }, [pendingEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin(email, password);
    } else if (mode === 'register') {
      if (password !== confirmPassword) return;
      onRegister(email, password);
    } else if (mode === 'confirm') {
      onConfirm(code, password);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--calendar-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🦫</div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">BeaverAI</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Your AI-powered planner</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[var(--calendar-border)] p-6">
          {/* Tab switcher (login / register) */}
          {mode !== 'confirm' && (
            <div className="flex rounded-lg bg-[var(--accent)] p-1 mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-white text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all ${
                  mode === 'register'
                    ? 'bg-white text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Confirm email header */}
          {mode === 'confirm' && (
            <div className="text-center mb-6">
              <div className="text-2xl mb-2">📧</div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Check your email</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                We sent a code to{' '}
                <span className="font-medium text-[var(--foreground)]">{pendingEmail}</span>
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            {mode !== 'confirm' && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className="w-full border border-[var(--calendar-border)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/60 disabled:bg-[var(--accent)]"
                />
              </div>
            )}

            {/* Password */}
            {mode !== 'confirm' && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? '8+ chars, upper, lower, number, symbol' : '••••••••'}
                  required
                  disabled={isLoading}
                  className="w-full border border-[var(--calendar-border)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/60 disabled:bg-[var(--accent)]"
                />
              </div>
            )}

            {/* Confirm Password (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  disabled={isLoading}
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/60 disabled:bg-[var(--accent)] ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-300'
                      : 'border-[var(--calendar-border)]'
                  }`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            )}

            {/* Verification Code */}
            {mode === 'confirm' && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  required
                  disabled={isLoading}
                  maxLength={6}
                  className="w-full border border-[var(--calendar-border)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/60 disabled:bg-[var(--accent)] text-center tracking-widest text-lg font-mono"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1 text-center">Enter the 6-digit code from your email</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={
                isLoading ||
                (mode === 'register' && password !== confirmPassword) ||
                (mode === 'confirm' && code.length < 6)
              }
              className="w-full text-white font-medium py-2 rounded-lg text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)' }}
            >
              {isLoading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                ? 'Create Account'
                : 'Verify Email'}
            </button>

            {/* Resend code */}
            {mode === 'confirm' && (
              <button
                type="button"
                onClick={onResendCode}
                disabled={isLoading}
                className="w-full text-sm text-[var(--primary)] hover:opacity-80 disabled:opacity-50 py-1 transition-opacity"
              >
                Resend code
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
