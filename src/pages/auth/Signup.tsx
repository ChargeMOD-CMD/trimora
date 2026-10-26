import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Scissors, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../features/notifications/ToastContext';
import { Button, Input } from '../../components/ui';
import { PublicLayout } from '../../components/layout/PublicLayout';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup({ ...formData, role: 'customer' });
      const redirect = searchParams.get('redirect') || '/account/appointments';
      navigate(redirect);
      toast('success', 'Account created successfully!');
    } catch (err: any) {
      toast('error', 'Signup failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--header-height))', background: 'var(--color-surface)' }}>
        {/* Left side: Form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
          <div style={{ width: '100%', maxWidth: 440 }} className="animate-fade-in-up">
            <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, background: 'var(--color-accent-light)', color: 'var(--color-accent-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                <Scissors size={24} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Create an account</h1>
              <p style={{ color: 'var(--color-text-muted)' }}>Join Trimora to book appointments and manage your profile</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <Input 
                  label="First Name" 
                  name="firstName"
                  required 
                  value={formData.firstName}
                  onChange={handleChange}
                  leftIcon={<User size={18} />}
                  placeholder="Jane"
                />
                <Input 
                  label="Last Name" 
                  name="lastName"
                  required 
                  value={formData.lastName}
                  onChange={handleChange}
                  leftIcon={<User size={18} />}
                  placeholder="Doe"
                />
              </div>

              <Input 
                label="Email Address" 
                name="email"
                type="email" 
                required 
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail size={18} />}
                placeholder="you@example.com"
              />

              <Input 
                label="Phone Number" 
                name="phone"
                type="tel" 
                required 
                value={formData.phone}
                onChange={handleChange}
                leftIcon={<Phone size={18} />}
                placeholder="+44 7700 900000"
              />
              
              <Input 
                label="Password" 
                name="password"
                type="password" 
                required 
                value={formData.password}
                onChange={handleChange}
                leftIcon={<Lock size={18} />}
                placeholder="Create a strong password"
              />

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5, marginTop: 'var(--space-2)' }}>
                By creating an account, you agree to Trimora's <Link to="#" style={{ color: 'var(--color-accent)' }}>Terms of Service</Link> and <Link to="#" style={{ color: 'var(--color-accent)' }}>Privacy Policy</Link>.
              </p>

              <Button type="submit" size="lg" loading={loading} fullWidth style={{ marginTop: 'var(--space-4)' }}>
                Create Account <ArrowRight size={16} style={{ marginLeft: 4 }} />
              </Button>
            </form>

            <div style={{ marginTop: 'var(--space-8)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Sign in</Link>
            </div>
          </div>
        </div>

        {/* Right side: Image */}
        <div className="hide-mobile" style={{ flex: 1, position: 'relative' }}>
          <img src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=1200&q=80" alt="Trimora Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
          <div style={{ position: 'absolute', bottom: 'var(--space-16)', left: 'var(--space-12)', right: 'var(--space-12)', color: 'white' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 700, marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>Join Trimora</h2>
            <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.8)' }}>Create an account to track your appointments and save your preferences.</p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
