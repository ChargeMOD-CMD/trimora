import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--color-surface)',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
          Verifying security session...
        </p>
      </div>
    );
  }

  // OWASP A01: Broken Access Control - Redirect unauthenticated users
  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // OWASP A01: Role-Based Access Control (RBAC)
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          padding: 'var(--space-8)',
          background: 'var(--color-surface)',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            textAlign: 'center',
            padding: 'var(--space-8)',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: '#FEE2E2',
              color: '#DC2626',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
            Your account ({user.email}) with role <strong>{user.role}</strong> does not have permission to view this section.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            <Button
              onClick={() => {
                const target = user.role === 'super_admin' ? '/super-admin' : '/admin';
                window.location.href = target;
              }}
            >
              Go to My Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
