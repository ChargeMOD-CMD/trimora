import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Settings as SettingsIcon, 
  LogOut,
  LayoutDashboard,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { Button } from '../ui';
import { motion } from 'framer-motion';

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Platform Overview', path: '/super-admin' },
    { icon: Building2, label: 'Manage Salons', path: '/super-admin/salons' },
    { icon: Users, label: 'Platform Users', path: '/super-admin/users' },
    { icon: Activity, label: 'System Health', path: '/super-admin/health' },
    { icon: SettingsIcon, label: 'Global Settings', path: '/super-admin/settings' },
  ];

  if (user?.role !== 'super_admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
        <Shield size={48} color="var(--color-error)" />
        <h2>Access Denied</h2>
        <p>You do not have permission to view the Super Admin portal.</p>
        <Button variant="primary" onClick={() => navigate('/')}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <Link to="/" className="logo" style={{ gap: 'var(--space-3)' }}>
            <div className="logo-icon" style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--color-accent)', width: 32, height: 32 }}>
              <Shield size={16} strokeWidth={2} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'white', letterSpacing: '0.03em' }}>
              Trimora
            </span>
          </Link>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', marginTop: 4, paddingLeft: 44, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Super Admin
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/super-admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="sidebar-link-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              marginBottom: 'var(--space-3)', padding: 'var(--space-3)',
              background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-accent)', color: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 'var(--text-xs)' }}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.firstName} {user.lastName}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>Platform Admin</div>
              </div>
            </div>
          )}
          <button className="sidebar-link" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={handleLogout}>
            <LogOut size={18} className="sidebar-link-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main" style={{ marginLeft: 'var(--sidebar-width)' }}>
        <div className="dashboard-topbar">
          <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Super Admin Portal
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Logged in as {user?.email}
            </span>
          </div>
        </div>
        <div className="dashboard-content page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
