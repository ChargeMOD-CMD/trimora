import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, SlidersHorizontal, X, Filter } from 'lucide-react';
import { businesses, services } from '../data/mockData';
import { StarRating, Badge, Chip, Button, EmptyState, Skeleton } from '../components/ui';
import { PublicLayout } from '../components/layout/PublicLayout';

const businessTypes = ['all', 'barbershop', 'salon', 'spa', 'studio', 'independent'];
const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function BusinessCard({ business }: { business: typeof businesses[0] }) {
  const location = business.locations[0];
  const minPrice = Math.min(...services.filter(s => s.businessId === business.id).map(s => s.price));
  const topServices = services.filter(s => s.businessId === business.id && s.isFeatured).slice(0, 3);

  return (
    <Link to={`/business/${business.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card card-hover" style={{ display: 'flex', gap: 'var(--space-5)', padding: 'var(--space-5)', overflow: 'hidden', cursor: 'pointer' }}>
        <div style={{ width: 160, height: 120, flexShrink: 0, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <img src={business.coverImage} alt={business.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{business.name}</h3>
                {business.isVerified && <Badge variant="accent">✓</Badge>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} /> {location.city}, {location.state}
                </span>
                <span>·</span>
                <span style={{ textTransform: 'capitalize' }}>{business.type}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StarRating rating={business.rating} size={13} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{business.rating}</span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{business.reviewCount} reviews</div>
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {business.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'auto' }}>
            {topServices.map(s => (
              <span key={s.id} className="chip" style={{ fontSize: 'var(--text-xs)', padding: '2px 10px' }}>{s.name}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-light)', marginTop: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              From <strong style={{ color: 'var(--color-text-primary)' }}>₹{minPrice}</strong>
            </span>
            <span className="btn btn-primary btn-sm" style={{ pointerEvents: 'none' }}>Book Now</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function BusinessCardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', gap: 'var(--space-5)', padding: 'var(--space-5)' }}>
      <Skeleton width={160} height={120} style={{ borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Skeleton height={20} width={200} />
        <Skeleton height={14} width={160} />
        <Skeleton height={32} />
        <Skeleton height={14} width={120} />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [results, setResults] = useState(businesses);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...businesses];
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(b =>
          b.name.toLowerCase().includes(q) ||
          b.locations.some(l => l.city.toLowerCase().includes(q)) ||
          services.some(s => s.businessId === b.id && s.name.toLowerCase().includes(q))
        );
      }
      if (selectedType !== 'all') filtered = filtered.filter(b => b.type === selectedType);
      if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
      setResults(filtered);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selectedType, sortBy]);

  return (
    <PublicLayout>
      <div style={{ background: 'var(--color-text-primary)', padding: 'var(--space-10) 0' }}>
        <div className="container">
          <h1 style={{ color: 'white', fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
            Find the perfect booking
          </h1>
          <div style={{ display: 'flex', gap: 'var(--space-3)', maxWidth: 700 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search businesses, services, locations..."
                className="input"
                style={{ paddingLeft: 40, background: 'white', height: 48 }}
                id="explore-search"
                aria-label="Search"
              />
            </div>
            <button className="btn btn-primary" style={{ height: 48, padding: '0 var(--space-6)' }}>Search</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
          {/* Filters sidebar - desktop */}
          <aside style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }} className="hide-mobile">
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Type</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {businessTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    style={{
                      textAlign: 'left', padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
                      fontWeight: selectedType === type ? 600 : 400,
                      background: selectedType === type ? 'var(--color-accent-light)' : 'transparent',
                      color: selectedType === type ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                      transition: 'all var(--transition-fast)',
                      fontFamily: 'var(--font-family)',
                    }}
                  >
                    {type === 'all' ? 'All businesses' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {loading ? 'Searching...' : `${results.length} ${results.length === 1 ? 'business' : 'businesses'} found`}
              </p>
              <select
                className="input"
                style={{ width: 'auto', height: 36, fontSize: 'var(--text-sm)' }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[1, 2, 3].map(i => <BusinessCardSkeleton key={i} />)}
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                icon={<Search size={28} />}
                title="No businesses found"
                description="Try adjusting your search or filters to find what you're looking for."
                action={<Button variant="secondary" onClick={() => { setQuery(''); setSelectedType('all'); }}>Clear filters</Button>}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {results.map(b => <BusinessCard key={b.id} business={b} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
