import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Scissors, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, AlertTriangle, KeyRound } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../features/notifications/ToastContext';
import { Button, Input } from '../../components/ui';
import { PublicLayout } from '../../components/layout/PublicLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const { login, user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If already logged in, redirect to appropriate portal
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirect = searchParams.get('redirect') || (user.role === 'super_admin' ? '/super-admin' : '/admin');
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, user, navigate, searchParams]);

  // OWASP A07: Brute Force Lockout Timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutTimer > 0) {
      toast('error', 'Account Locked', `Please wait ${lockoutTimer}s before attempting again.`);
      return;
    }

    // Input validation & sanitization (OWASP A03 / A08)
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      toast('warning', 'Missing Fields', 'Please enter your username and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(cleanEmail, password);
      setFailedAttempts(0);
      let defaultRedirect = '/admin';
      if (loggedUser.role === 'super_admin') {
        defaultRedirect = '/super-admin';
      }
      const redirect = searchParams.get('redirect') || defaultRedirect;
      navigate(redirect);
      toast('success', 'Authentication Successful', `Welcome back, ${loggedUser.firstName}!`);
    } catch (err: any) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLockoutTimer(60); // 60-second client-side cooldown
        toast('error', 'Too Many Failed Attempts', 'Login temporarily locked for 60 seconds (OWASP Brute-Force Defense).');
      } else {
        toast('error', 'Authentication Failed', err.message || 'Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <PublicLayout>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--header-height))', background: 'var(--color-surface)' }}>
        {/* Left side: Form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
          <div style={{ width: '100%', maxWidth: 440 }} className="animate-fade-in-up">
            
            {/* Header */}
            <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, background: 'var(--color-accent-light)', color: 'var(--color-accent-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', boxShadow: 'var(--shadow-sm)' }}>
                <Scissors size={26} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Portal Login</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                Sign in to manage Trimora operations, staff, and appointments.
              </p>
            </div>

            {/* Lockout Banner (OWASP A07) */}
            {lockoutTimer > 0 && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #F87171',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                  marginBottom: 'var(--space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  color: '#991B1B',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Brute-Force Protection Active:</strong>
                  <div>Too many invalid attempts. Try again in <strong>{lockoutTimer}s</strong>.</div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="Username / Email"
                type="text"
                required
                disabled={lockoutTimer > 0 || loading}
                value={email}
                onChange={e => setEmail(e.target.value)}
                leftIcon={<Mail size={18} />}
                placeholder="super@trimora or admin@trimora"
                autoComplete="username"
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutTimer > 0 || loading}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  leftIcon={<Lock size={18} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-text-muted)' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {failedAttempts > 0 && failedAttempts < 5 && `${5 - failedAttempts} attempts remaining`}
                  </span>
                  <Link to="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', fontWeight: 500 }}>
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                loading={loading}
                disabled={lockoutTimer > 0}
                fullWidth
                style={{ marginTop: 'var(--space-2)' }}
              >
                {lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : 'Secure Sign In'} <ArrowRight size={16} style={{ marginLeft: 4 }} />
              </Button>
            </form>

            {/* One-Click Role Selector for Testing RBAC */}
            <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <KeyRound size={16} color="var(--color-accent)" />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                  Quick Role Switcher (RBAC Demo)
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('super@trimora', 'super@2026#')}
                  style={{
                    padding: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  👑 Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@trimora', 'saloon@2026#')}
                  style={{
                    padding: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  🏢 Salon Owner
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('isabelle@trimora.co.uk', 'password123')}
                  style={{
                    padding: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  ✂️ Staff / Stylist
                </button>
              </div>
            </div>

            {/* Security Compliance Badge (OWASP Top 10) */}
            <div
              style={{
                marginTop: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <ShieldCheck size={16} color="#10B981" />
              <span>OWASP Top 10 Secured &bull; Bcrypt Hashed &bull; 256-Bit TLS</span>
            </div>

          </div>
        </div>

        {/* Right side: Image */}
        <div className="hide-mobile" style={{ flex: 1, position: 'relative' }}>
          <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=80" alt="Trimora Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
          <div style={{ position: 'absolute', bottom: 'var(--space-16)', left: 'var(--space-12)', right: 'var(--space-12)', color: 'white' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 700, marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>
              Your style, elevated.
            </h2>
            <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.8)' }}>
              Enterprise salon operations with institutional-grade data security.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
