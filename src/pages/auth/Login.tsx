import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Scissors, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../features/notifications/ToastContext';
import { Button, Input } from '../../components/ui';
import { PublicLayout } from '../../components/layout/PublicLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      let defaultRedirect = '/admin';
      if (user.role === 'super_admin') {
        defaultRedirect = '/super-admin';
      }
      const redirect = searchParams.get('redirect') || defaultRedirect;
      navigate(redirect);
      toast('success', 'Welcome back!');
    } catch (err: any) {
      toast('error', 'Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--header-height))', background: 'var(--color-surface)' }}>
        {/* Left side: Form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
          <div style={{ width: '100%', maxWidth: 400 }} className="animate-fade-in-up">
            <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, background: 'var(--color-accent-light)', color: 'var(--color-accent-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                <Scissors size={24} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Admin Login</h1>
              <p style={{ color: 'var(--color-text-muted)' }}>Enter your details to sign in to Trimora Admin Portal</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="Username"
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                leftIcon={<Mail size={18} />}
                placeholder="Enter username"
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  leftIcon={<Lock size={18} />}
                  rightIcon={
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-text-muted)' }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  placeholder="••••••••"
                />
                <div style={{ textAlign: 'right', marginTop: 'var(--space-2)' }}>
                  <Link to="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', fontWeight: 500 }}>Forgot password?</Link>
                </div>
              </div>

              <Button type="submit" size="lg" loading={loading} fullWidth style={{ marginTop: 'var(--space-2)' }}>
                Sign In <ArrowRight size={16} style={{ marginLeft: 4 }} />
              </Button>
            </form>

          </div>
        </div>

        {/* Right side: Image */}
        <div className="hide-mobile" style={{ flex: 1, position: 'relative' }}>
          <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=80" alt="Trimora Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
          <div style={{ position: 'absolute', bottom: 'var(--space-16)', left: 'var(--space-12)', right: 'var(--space-12)', color: 'white' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 700, marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>Your style, elevated.</h2>
            <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.8)' }}>Book instantly and discover London's finest professionals.</p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
