import React, { useEffect, useState } from 'react';
import { SuperAdminLayout } from '../../components/layout/SuperAdminLayout';
import { mockPlatformService } from '../../services/mockPlatformService';
import { Building2, Activity, Users, Store, TrendingUp } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockPlatformService.getDashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <SuperAdminLayout><div style={{ padding: 'var(--space-6)' }}>Loading platform statistics...</div></SuperAdminLayout>;

  const statCards = [
    { title: 'Total Salons', value: stats.totalSalons, icon: Store, color: 'var(--color-primary)' },
    { title: 'Active Tenants', value: stats.activeSalons, icon: Building2, color: 'var(--color-success)' },
    { title: 'Suspended', value: stats.suspendedSalons, icon: Activity, color: 'var(--color-error)' },
    { title: 'New This Month', value: stats.newRegistrationsThisMonth, icon: TrendingUp, color: 'var(--color-accent)' },
  ];

  return (
    <SuperAdminLayout>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Platform Overview</h1>
        <p className="page-subtitle">Welcome to the Trimora Super Admin Portal.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {statCards.map((card, i) => (
          <div key={i} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${card.color}15`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
              {card.value}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
              {card.title}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>System Status</h2>
        <div style={{ padding: 'var(--space-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-success)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>All Systems Operational</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Database and Auth services are running smoothly. No outages reported.</p>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
