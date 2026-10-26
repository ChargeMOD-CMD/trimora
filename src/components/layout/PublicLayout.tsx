import React, { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Scissors, User, Menu, X, Calendar, LogOut, ChevronDown,
  Phone, Mail, MapPin
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { Avatar, Button } from '../ui';

// ─── NAV LINK ────────────────────────────────────────────────
function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const location = useLocation();
  const { slug } = useParams();
  const target = `/${slug}${to}`;
  const active = location.pathname === target || (to !== '' && location.pathname.startsWith(target));
  return (
    <Link to={target} className={`nav-link ${active ? 'active' : ''}`}>{children}</Link>
  );
}

// ─── TRIMORA LOGO ─────────────────────────────────────────────
export function TrimoraLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: { icon: 28, text: 'var(--text-lg)' }, md: { icon: 36, text: 'var(--text-xl)' }, lg: { icon: 44, text: 'var(--text-2xl)' } };
  const s = sizes[size];
  const { slug } = useParams();
  
  // Try to get salon name from cache if available
  let salonName = 'Trimora';
  try {
    const salonsStored = localStorage.getItem('trimora_salons_db');
    if (salonsStored) {
      const salons = JSON.parse(salonsStored);
      const salon = salons.find((s: any) => s.slug === slug);
      if (salon) salonName = salon.name;
    }
  } catch {}

  return (
    <Link to={`/${slug}`} className="logo" style={{ gap: 'var(--space-3)' }}>
      <div className="logo-icon" style={{ width: s.icon, height: s.icon }}>
        <Scissors size={s.icon * 0.5} strokeWidth={2} />
      </div>
      <span className="logo-text" style={{ fontSize: s.text }}>{salonName}</span>
    </Link>
  );
}

// ─── PUBLIC HEADER ────────────────────────────────────────────
export function PublicHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'owner' || user?.role === 'manager';

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="public-header" style={{ position: 'sticky', top: 0, zIndex: 150 }}>
      <div className="container">
        <div className="header-inner">
          {/* Logo */}
          <TrimoraLogo />

          {/* Desktop Nav */}
          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink to="">Home</NavLink>
            <NavLink to="/services">Services</NavLink>
            <NavLink to="/book">Book Appointment</NavLink>
            {isAuthenticated && <NavLink to="/appointments">My Appointments</NavLink>}
          </nav>

          {/* Actions */}
          <div className="header-actions">
            {isAuthenticated && user ? (
              <div className="dropdown">
                <button className="user-pill" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                  <span className="user-name hide-mobile">{user.firstName}</span>
                  <ChevronDown size={14} className="hide-mobile" style={{ color: 'var(--color-text-muted)' }} />
                </button>
                {userMenuOpen && (
                  <div className="dropdown-menu" style={{ minWidth: 200 }}>
                    {isAdmin && (
                      <>
                        <Link to="/admin" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                          <Scissors size={16} /> Admin Dashboard
                        </Link>
                      </>
                    )}
                    <div className="divider" style={{ margin: '4px 0' }} />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <></>
            )}

            <button
              className="btn btn-ghost btn-icon mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu animate-fade-in">
          <nav>
            <Link to="/" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link to="/services" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              Services
            </Link>
            <Link to="/book" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              Book Appointment
            </Link>
            {isAuthenticated ? (
              <>
                <div className="divider" style={{ margin: 0 }} />
                {isAdmin && (
                  <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                    <Scissors size={18} /> Admin Dashboard
                  </Link>
                )}
                <button
                  className="mobile-nav-link"
                  style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-error)', textAlign: 'left' }}
                  onClick={async () => { await handleLogout(); setMobileOpen(false); }}
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <></>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── PUBLIC FOOTER ────────────────────────────────────────────
export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div className="logo-icon" style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--color-accent)' }}>
                <Scissors size={18} strokeWidth={2} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'white' }}>Trimora</span>
            </div>
            <p>Where style meets sophistication. Experience premium salon services with our expert team of stylists.</p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
              <a href="#" aria-label="Instagram" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color var(--transition-fast)' }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                IG
              </a>
              <a href="#" aria-label="Facebook" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color var(--transition-fast)' }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                FB
              </a>
              <a href="#" aria-label="Twitter" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color var(--transition-fast)' }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                X
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/services">Our Services</Link>
          </div>

          <div className="footer-links">
            <h4>Services</h4>
            <Link to="/services">Haircut & Styling</Link>
            <Link to="/services">Hair Coloring</Link>
            <Link to="/services">Balayage</Link>
            <Link to="/services">Beard Grooming</Link>
            <Link to="/services">Bridal Packages</Link>
          </div>

          <div className="footer-links">
            <h4>Contact</h4>
            <a href="tel:+919876543210" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={14} /> +91 98765 43210
            </a>
            <a href="mailto:contact@trimora.in" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={14} /> contact@trimora.in
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} /> Trivandrum, Kerala, Indian
            </a>
            <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.35)' }}>
              Mon – Fri: 9:00 – 19:00<br />
              Sat: 8:00 – 18:00<br />
              Sun: Closed
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Trimora. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: 'var(--text-xs)' }}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── PUBLIC LAYOUT ────────────────────────────────────────────
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-layout">
      <PublicHeader />
      <main className="public-main">{children}</main>
      <PublicFooter />
    </div>
  );
}
