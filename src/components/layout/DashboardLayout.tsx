import React, { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Scissors, LayoutDashboard, Calendar, ClipboardList, Users, UserCheck,
  Briefcase, Settings, Bell, Search, Menu, X, LogOut,
  PanelLeftClose, PanelLeftOpen, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { Avatar } from '../ui';
import '../../styles/index.css';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', section: 'main', exact: true },
  { label: 'Appointments', icon: ClipboardList, to: '/admin/appointments', section: 'main' },
  { label: 'Customers', icon: Users, to: '/admin/customers', section: 'manage' },
  { label: 'Stylists', icon: UserCheck, to: '/admin/stylists', section: 'manage' },
  { label: 'Services', icon: Briefcase, to: '/admin/services', section: 'manage' },
  { label: 'Settings', icon: Settings, to: '/admin/settings', section: 'system' },
];

const sections: { key: string; label: string }[] = [
  { key: 'main', label: 'Main' },
  { key: 'manage', label: 'Management' },
  { key: 'system', label: 'System' },
];

function SidebarNavLink({ item, collapsed }: { item: typeof navItems[0]; collapsed: boolean }) {
  const location = useLocation();
  const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={`sidebar-link ${active ? 'active' : ''}`}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={18} className="sidebar-link-icon" />
      {!collapsed && <span>{item.label}</span>}
      {!collapsed && active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
    </Link>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // OWASP A01: Broken Access Control
  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Get current page title
  const currentNav = navItems.find(n => n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to));
  const pageTitle = currentNav?.label || 'Dashboard';

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 199, backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${collapsed ? 'dashboard-sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <Link to="/" className="logo" style={{ gap: 'var(--space-3)' }}>
            <div className="logo-icon" style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--color-accent)', width: 32, height: 32 }}>
              <Scissors size={16} strokeWidth={2} />
            </div>
            {!collapsed && (
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'white', letterSpacing: '0.03em' }}>
                Trimora
              </span>
            )}
          </Link>
          {!collapsed && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.3)', marginTop: 4, paddingLeft: 44 }}>Admin Panel</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Admin navigation">
          {sections.map(section => {
            const sectionItems = navItems.filter(i => i.section === section.key);
            if (!sectionItems.length) return null;
            return (
              <div key={section.key}>
                {!collapsed && <div className="sidebar-section-label">{section.label}</div>}
                {sectionItems.map(item => (
                  <SidebarNavLink key={item.to} item={item} collapsed={collapsed} />
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* User Info */}
          {!collapsed && user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              marginBottom: 'var(--space-3)', padding: 'var(--space-3)',
              background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)'
            }}>
              <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.firstName} {user.lastName}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
            </div>
          )}

          {/* Sign out */}
          <button
            className="sidebar-link"
            style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut size={18} className="sidebar-link-icon" />
            {!collapsed && 'Sign Out'}
          </button>

          {/* Collapse toggle */}
          <button
            className="sidebar-link"
            style={{ width: '100%', marginTop: 'var(--space-1)', justifyContent: collapsed ? 'center' : 'flex-start' }}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main" style={{ marginLeft: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}>
        {/* Topbar */}
        <div className="dashboard-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            {/* Mobile menu toggle */}
            <button
              className="btn btn-ghost btn-icon"
              style={{ display: 'none' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Page title on mobile */}
            <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}
              className="hide-desktop-header">{pageTitle}</h1>

            {/* Search */}
            <div style={{ position: 'relative' }} className="hide-mobile">
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              <input
                className="input"
                placeholder="Search..."
                style={{ width: 280, paddingLeft: 36, height: 38, fontSize: 'var(--text-sm)' }}
                aria-label="Search"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {/* Notifications */}
            <button className="btn btn-ghost btn-icon" aria-label="Notifications" style={{ position: 'relative' }}>
              <Bell size={18} />
              <span style={{
                position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                background: 'var(--color-error)', borderRadius: '50%',
                border: '2px solid var(--color-surface)'
              }} />
            </button>

            {/* View Site */}
            <Link to="/" className="btn btn-secondary btn-sm hide-mobile" style={{ fontSize: 'var(--text-xs)' }}>
              View Site
            </Link>

            {/* User avatar */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                <span className="hide-mobile" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {user.firstName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="dashboard-content page-enter">
          {children}
        </div>
      </div>
    </div>
  );
}
