import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, ArrowRight, Check } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout';
import { trimoraServiceApi } from '../services/trimoraApi';
import { Service } from '../types';

export default function ServicesPage() {
  const { slug } = useParams();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    trimoraServiceApi.getAllServices(activeCategory).then(data => {
      setServices(data);
      setLoading(false);
    });
  }, [activeCategory]);

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'haircuts', label: 'Haircuts' },
    { id: 'styling', label: 'Styling' },
    { id: 'color', label: 'Colour & Balayage' },
    { id: 'treatments', label: 'Treatments' },
    { id: 'beard', label: 'Beard Grooming' },
  ];

  return (
    <PublicLayout>
      {/* ─── PAGE HEADER ────────────────────────────────────── */}
      <div style={{ background: 'var(--color-dark)', color: 'white', padding: 'var(--space-16) 0 var(--space-12)' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Our Services
          </h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.7)', maxWidth: 600 }}>
            Discover our range of premium hair and beauty treatments, tailored to help you look and feel your absolute best.
          </p>
        </div>
      </div>

      {/* ─── CATEGORY TABS ──────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', position: 'sticky', top: 'var(--header-height)', zIndex: 90 }}>
        <div className="container">
          <div className="tabs" style={{ borderBottom: 'none', padding: 'var(--space-2) 0' }}>
            {categories.map(c => (
              <button
                key={c.id}
                className={`tab ${activeCategory === c.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(c.id)}
                style={{ padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--text-sm)', fontWeight: activeCategory === c.id ? 600 : 500 }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SERVICES LIST ──────────────────────────────────── */}
      <div className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-xl)' }} />)
          ) : (
            services.map((service, index) => (
              <div key={service.id} className="card card-hover animate-fade-in-up" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-8)', alignItems: 'center', animationDelay: `${index * 0.05}s` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{service.name}</h3>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{service.price}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {service.durationMins} mins</span>
                    <span style={{ textTransform: 'capitalize' }}>• {service.category}</span>
                  </div>
                  
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                    {service.description}
                  </p>
                  
                  {service.addons.length > 0 && (
                    <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Available Add-ons:</div>
                      {service.addons.map(addon => (
                        <div key={addon.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                          <Check size={12} color="var(--color-success)" /> {addon.name} (+₹{addon.price})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: 160, flexShrink: 0 }}>
                  <Link to={`/${slug}/book?service=${service.id}`} className="btn btn-primary w-full">
                    Book Now
                  </Link>
                  <Link to={`/${slug}/services/${service.id}`} className="btn btn-secondary w-full">
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
          
          {!loading && services.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">✂️</div>
              <h3 className="empty-state-title">No services found</h3>
              <p>We couldn't find any services in this category.</p>
              <button className="btn btn-secondary" onClick={() => setActiveCategory('all')}>View All Services</button>
            </div>
          )}
        </div>
      </div>
      
      {/* ─── CTA ────────────────────────────────────────────── */}
      <div style={{ background: 'var(--color-surface-2)', padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Not sure what to book?</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', maxWidth: 500, margin: '0 auto var(--space-6)' }}>
            Book a free consultation and let our experts recommend the perfect service for your hair type and lifestyle.
          </p>
          <Link to={`/${slug}/book`} className="btn btn-accent btn-lg">Book Consultation</Link>
        </div>
      </div>
    </PublicLayout>
  );
}
