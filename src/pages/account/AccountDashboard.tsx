import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, Calendar, Award, Settings, Bell, LogOut, CheckCircle2, Clock, MapPin, Scissors } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { trimoraBookingApi, trimoraServiceApi } from '../../services/trimoraApi';
import { TRIMORA_SALON } from '../../data/trimoraData';
import { Appointment, Service } from '../../types';
import { PublicHeader, PublicFooter, PublicLayout } from '../../components/layout/PublicLayout';
import { Avatar, Button, StatusBadge, EmptyState, Skeleton } from '../../components/ui';
import { formatDateTime } from '../../utils/availability';

// ─── APPOINTMENTS TAB ──────────────────────────────────────────────
function AppointmentsList() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<(Appointment & { serviceName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!user) return;
    trimoraBookingApi.getAppointmentsByCustomer(user.id).then(async apts => {
      // Fetch service details for each appointment
      const withServices = await Promise.all(apts.map(async a => {
        const service = await trimoraServiceApi.getServiceById(a.participants[0].serviceId);
        return { ...a, serviceName: service?.name || 'Salon Service' };
      }));
      setAppointments(withServices);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <Skeleton height={200} />;

  const now = new Date();
  const filtered = appointments.filter(a => {
    const aptDate = new Date(a.participants[0].startTime);
    if (filter === 'upcoming') return aptDate >= now && a.status !== 'cancelled';
    return aptDate < now || a.status === 'cancelled';
  }).sort((a, b) => {
    const aDate = new Date(a.participants[0].startTime).getTime();
    const bDate = new Date(b.participants[0].startTime).getTime();
    return filter === 'upcoming' ? aDate - bDate : bDate - aDate;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>My Appointments</h2>
        <div style={{ display: 'flex', background: 'var(--color-surface-2)', padding: 4, borderRadius: 'var(--radius-lg)' }}>
          <button className={`btn btn-sm ${filter === 'upcoming' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('upcoming')}>Upcoming</button>
          <button className={`btn btn-sm ${filter === 'past' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('past')}>Past</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState 
          icon={<Calendar size={32} />} 
          title={`No ${filter} appointments`} 
          description="When you book a service, it will appear here." 
          action={<Link to="/services" className="btn btn-primary">Book a service</Link>} 
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filtered.map(apt => {
            const p = apt.participants[0];
            return (
              <div key={apt.id} className="card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Scissors size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                        {TRIMORA_SALON.name}
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <MapPin size={12} /> {TRIMORA_SALON.address}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={apt.status} />
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>Ref: {apt.id.split('-')[2] || apt.id}</div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Date & Time</div>
                    <div style={{ fontWeight: 500 }}>{formatDateTime(p.startTime)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Service</div>
                    <div style={{ fontWeight: 500 }}>{apt.serviceName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Total</div>
                    <div style={{ fontWeight: 600 }}>₹{apt.totalPrice}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-light)' }}>
                  {filter === 'past' && apt.status === 'completed' && !apt.reviewRequested && (
                    <Button variant="outline-accent" size="sm">Leave Review</Button>
                  )}
                  {filter === 'upcoming' && (
                    <>
                      <Button variant="secondary" size="sm">Reschedule</Button>
                      <Button variant="danger" size="sm">Cancel</Button>
                    </>
                  )}
                  <Button variant="secondary" size="sm">View Details</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── REWARDS TAB ───────────────────────────────────────────────────
function RewardsTab() {
  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>Loyalty & Rewards</h2>
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--color-dark) 0%, #1a1a1a 100%)', color: 'white', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ background: 'rgba(201,168,76,0.2)', color: 'var(--color-accent)', padding: 'var(--space-2)', borderRadius: '50%' }}><Award size={24} /></div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.8)' }}>Trimora Points Balance</div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>380</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.8)' }}>Current Tier</div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-accent)' }}>Gold Member</div>
          </div>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.8)', marginBottom: 'var(--space-4)' }}>
          You're 120 points away from Platinum tier. Keep booking to level up!
        </p>
        <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)', height: 8 }}>
          <div className="progress-fill" style={{ background: 'var(--color-accent)', width: '76%' }} />
        </div>
      </div>

      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: 'var(--space-8) 0 var(--space-4)' }}>Available Rewards</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        {[
          { title: '₹10 Off Any Service', points: 300, color: 'var(--color-accent)' },
          { title: 'Free Scalp Massage', points: 400, color: '#B8963E' },
          { title: '₹25 Gift Card', points: 800, color: 'var(--color-text-primary)' },
        ].map((r, i) => (
          <div key={i} className="card" style={{ padding: 'var(--space-5)', borderTop: `4px solid ${r.color}` }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>{r.title}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>{r.points} points required</div>
            <Button variant={i < 1 ? 'primary' : 'secondary'} size="sm" disabled={i > 0} fullWidth>
              {i < 1 ? 'Redeem Now' : 'Not enough points'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN LAYOUT ──────────────────────────────────────────────────
export default function AccountDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" state={{ redirect: location.pathname }} />;

  const navItems = [
    { label: 'Appointments', icon: Calendar, path: '/account/appointments' },
    { label: 'Rewards & Loyalty', icon: Award, path: '/account/rewards' },
    { label: 'Settings', icon: Settings, path: '/account/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <PublicLayout>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--header-height))', background: 'var(--color-surface)' }}>
        <main style={{ flex: 1, padding: 'var(--space-8) 0' }}>
          <div className="container account-grid">
            
            {/* Sidebar */}
            <aside className="account-sidebar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '0 var(--space-4) var(--space-6)', marginBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border-light)' }}>
                <Avatar src={user.avatar} name={`${user.firstName} ${user.lastName}`} size="lg" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{user.firstName} {user.lastName}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{user.email}</div>
                </div>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                {navItems.map(item => {
                  const isActive = location.pathname.includes(item.path) || (item.path === '/account/appointments' && location.pathname === '/account');
                  return (
                    <Link key={item.path} to={item.path} className={`account-nav-link ${isActive ? 'active' : ''}`}>
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
                
                <div style={{ height: 1, background: 'var(--color-border-light)', margin: 'var(--space-4) 0' }} />
                
                {(user.role === 'owner' || user.role === 'manager' || user.role === 'stylist' || user.role === 'receptionist') && (
                  <Link to="/admin" className="account-nav-link" style={{ color: 'var(--color-accent)' }}>
                    <Settings size={18} /> Admin Dashboard
                  </Link>
                )}

                <button className="account-nav-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-error)' }} onClick={handleLogout}>
                  <LogOut size={18} /> Sign Out
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <div style={{ minWidth: 0 }}>
              <Routes>
                <Route path="/" element={<Navigate to="appointments" replace />} />
                <Route path="appointments" element={<AppointmentsList />} />
                <Route path="rewards" element={<RewardsTab />} />
                <Route path="settings" element={<EmptyState icon={<Settings size={32} />} title="Account Settings" description="Update your profile, password, and notification preferences." />} />
              </Routes>
            </div>

          </div>
        </main>
      </div>
    </PublicLayout>
  );
}
