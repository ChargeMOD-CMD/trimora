import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Check, ArrowLeft, ArrowRight, User, Star } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout';
import { trimoraServiceApi, trimmoraStylistApi } from '../services/trimoraApi';
import { Service, StaffMember } from '../types';
import { Avatar } from '../components/ui';

export default function ServiceDetailPage() {
  const { slug } = useParams();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [stylists, setStylists] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    Promise.all([
      trimoraServiceApi.getServiceById(id),
      trimmoraStylistApi.getStylistsForService(id)
    ]).then(([svc, staff]) => {
      if (!svc) {
        navigate('/services');
        return;
      }
      setService(svc);
      setStylists(staff);
      setLoading(false);
    });
  }, [id, navigate]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)' }} />
        </div>
      </PublicLayout>
    );
  }

  if (!service) return null;

  return (
    <PublicLayout>
      {/* ─── BREADCRUMBS & BACK ───────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="container" style={{ padding: 'var(--space-4) var(--space-6)' }}>
          <Link to={`/${slug}/services`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Services
          </Link>
        </div>
      </div>

      <div className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-12)', alignItems: 'start' }}>
          
          {/* ─── LEFT: SERVICE DETAILS ──────────────────────── */}
          <div className="animate-fade-in-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <span className="badge badge-default" style={{ textTransform: 'capitalize' }}>{service.category}</span>
              {service.isFeatured && <span className="badge badge-accent">Popular</span>}
            </div>
            
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
              {service.name}
            </h1>
            
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-8)' }}>
              {service.description}
            </p>

            {/* Included / What to expect */}
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>What's Included</h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
              {[
                'Professional consultation',
                'Premium salon products',
                'Complimentary refreshments',
                'Expert styling advice'
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            {/* Stylists */}
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Available Stylists</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {stylists.map(stylist => (
                <div key={stylist.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Avatar src={stylist.avatar} name={stylist.displayName} size="md" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{stylist.firstName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      <Star size={12} color="var(--color-accent)" fill="var(--color-accent)" /> {stylist.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── RIGHT: BOOKING CARD ────────────────────────── */}
          <div className="card animate-fade-in-scale" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-8))', padding: 'var(--space-8)', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border-light)' }}>
              <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                ₹{service.price}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--color-text-muted)' }}>
                <Clock size={16} /> {service.durationMins} minutes
              </div>
            </div>

            {service.addons.length > 0 && (
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Optional Add-ons</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {service.addons.map(addon => (
                    <div key={addon.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: 'var(--space-2) 0', borderBottom: '1px dashed var(--color-border)' }}>
                      <span>{addon.name}</span>
                      <span style={{ fontWeight: 500 }}>+₹{addon.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Link to={`/${slug}/book?service=${service.id}`} className="btn btn-primary btn-lg w-full">
                Book Appointment <ArrowRight size={18} />
              </Link>
              {service.requiresDeposit && (
                <div style={{ fontSize: 'var(--text-xs)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  A ₹{service.depositAmount} deposit is required for this service.
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </PublicLayout>
  );
}
