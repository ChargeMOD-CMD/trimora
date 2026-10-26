import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Clock, Star, ChevronRight, Heart, Share2, Wifi,
  CheckCircle, Calendar, ArrowRight, ChevronLeft, X, Image
} from 'lucide-react';
import { mockBusinessService, mockStaffService, mockServiceService, mockReviewService } from '../services/mockServices';
import { Business, StaffMember, Service, Review } from '../types';
import { StarRating, Badge, Avatar, Button, Skeleton, EmptyState, StatusBadge } from '../components/ui';
import { PublicLayout } from '../components/layout/PublicLayout';
import { formatDateShort, formatTime12, getDayName } from '../utils/availability';

function ServiceItem({ service }: { service: Service }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) 0', borderBottom: '1px solid var(--color-border-light)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{service.name}</span>
          {service.isFeatured && <Badge variant="gold">Popular</Badge>}
          {service.salePrice && <Badge variant="error">Sale</Badge>}
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{service.description}</p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          <span>⏱ {service.durationMins} min</span>
          {service.addons.length > 0 && <span>+ {service.addons.length} add-ons available</span>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          {service.salePrice ? (
            <>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-error)' }}>₹{service.salePrice}</div>
              <div style={{ fontSize: 'var(--text-sm)', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>₹{service.price}</div>
            </>
          ) : (
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>₹{service.price}</div>
          )}
        </div>
        <Button variant="outline-accent" size="sm" onClick={() => navigate(`/business/${service.businessId}/book`)}>
          Book
        </Button>
      </div>
    </div>
  );
}

function StaffCard({ staff }: { staff: StaffMember }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-3)', padding: 'var(--space-6)' }}>
      <Avatar src={staff.avatar} name={staff.displayName} size="xl" />
      <div>
        <div style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{staff.displayName}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'capitalize', marginTop: 2 }}>{staff.role}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <StarRating rating={staff.rating} size={13} />
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{staff.rating}</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>({staff.reviewCount})</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
        {staff.specialties.slice(0, 2).map(s => (
          <span key={s} className="chip" style={{ fontSize: 'var(--text-xs)', padding: '2px 10px' }}>{s}</span>
        ))}
      </div>
      {!staff.isAcceptingBookings && <Badge variant="warning">Not accepting bookings</Badge>}
    </div>
  );
}

function ReviewCard({ review, staffName }: { review: Review; staffName?: string }) {
  const customerName = review.customerId === 'cust-1' ? 'James H.' : review.customerId === 'cust-4' ? 'Benjamin C.' : review.customerId === 'cust-2' ? 'Oliver M.' : review.customerId === 'cust-3' ? 'William F.' : 'Customer';
  return (
    <div style={{ padding: 'var(--space-6) 0', borderBottom: '1px solid var(--color-border-light)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Avatar name={customerName} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{customerName}</div>
            {staffName && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>with {staffName}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <StarRating rating={review.overallRating} size={13} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{formatDateShort(review.createdAt)}</span>
        </div>
      </div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{review.comment}</p>
      {review.ownerReply && (
        <div style={{ marginTop: 'var(--space-4)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', borderLeft: '3px solid var(--color-accent)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-accent)', marginBottom: 4 }}>Response from the business</div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{review.ownerReply}</p>
        </div>
      )}
    </div>
  );
}

export default function BusinessDetailPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    if (!businessId) return;
    Promise.all([
      mockBusinessService.getBusinessById(businessId),
      mockStaffService.getStaffByBusiness(businessId),
      mockServiceService.getServicesByBusiness(businessId),
      mockReviewService.getReviewsByBusiness(businessId),
    ]).then(([biz, staff, svcs, revs]) => {
      setBusiness(biz);
      setStaffList(staff);
      setServiceList(svcs);
      setReviewList(revs);
      setLoading(false);
    });
  }, [businessId]);

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ paddingTop: 'var(--space-8)' }}>
          <Skeleton height={400} className="w-full" />
          <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
            <Skeleton height={40} width={300} style={{ marginBottom: 'var(--space-4)' }} />
            <Skeleton height={20} width={200} />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!business) {
    return (
      <PublicLayout>
        <EmptyState title="Business not found" description="This business may have been removed or the link is incorrect." action={<Link to="/explore" className="btn btn-primary">Back to Explore</Link>} />
      </PublicLayout>
    );
  }

  const primaryLocation = business.locations[0];
  const categories = [...new Set(serviceList.map(s => s.category))];
  const avgRating = business.rating;

  const today = new Date().getDay();
  const todayHours = primaryLocation.workingHours.find(wh => wh.dayOfWeek === today);

  return (
    <PublicLayout>
      {/* Gallery lightbox */}
      {galleryOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button className="btn btn-ghost" style={{ position: 'absolute', top: 20, right: 20, color: 'white' }} onClick={() => setGalleryOpen(false)}>
            <X size={24} />
          </button>
          <button className="btn btn-ghost" style={{ position: 'absolute', left: 20, color: 'white' }} onClick={() => setGalleryIdx(i => Math.max(0, i - 1))}>
            <ChevronLeft size={24} />
          </button>
          <img src={business.gallery[galleryIdx]} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 'var(--radius-xl)' }} />
          <button className="btn btn-ghost" style={{ position: 'absolute', right: 20, color: 'white' }} onClick={() => setGalleryIdx(i => Math.min(business.gallery.length - 1, i + 1))}>
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Cover Image */}
      <div style={{ height: 380, position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setGalleryOpen(true)}>
        <img src={business.coverImage} alt={business.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />

        {/* Gallery thumbnails */}
        <div style={{ position: 'absolute', bottom: 'var(--space-4)', right: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
          {business.gallery.slice(1, 4).map((img, i) => (
            <div key={i} style={{ width: 72, height: 52, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid white', cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); setGalleryIdx(i + 1); setGalleryOpen(true); }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
          {business.gallery.length > 4 && (
            <div style={{ width: 72, height: 52, borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', border: '2px solid white' }}>
              <Image size={14} style={{ marginRight: 4 }} /> +{business.gallery.length - 4}
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-8)', alignItems: 'start' }}>
          {/* Left: Content */}
          <div>
            {/* Business header */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>{business.name}</h1>
                    {business.isVerified && <Badge variant="accent">✓ Verified</Badge>}
                    {business.isFeatured && <Badge variant="gold">Featured</Badge>}
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', textTransform: 'capitalize' }}>{business.type} · {primaryLocation.city}, {primaryLocation.state}</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
                  <Button variant="ghost" size="icon" aria-label="Add to favourites"><Heart size={18} /></Button>
                  <Button variant="ghost" size="icon" aria-label="Share"><Share2 size={18} /></Button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRating rating={avgRating} />
                  <strong style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{avgRating}</strong>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>({business.reviewCount} reviews)</span>
                </div>
                <span style={{ color: 'var(--color-border)' }}>·</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} />{primaryLocation.address}, {primaryLocation.city}
                </span>
                <span style={{ color: 'var(--color-border)' }}>·</span>
                <span style={{ color: todayHours?.isOpen ? 'var(--color-success)' : 'var(--color-error)', fontSize: 'var(--text-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} />
                  {todayHours?.isOpen ? `Open until ${todayHours.closeTime}` : 'Closed today'}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--space-8)' }}>
              {['services', 'staff', 'reviews', 'about', 'gallery'].map(tab => (
                <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'reviews' && ` (${reviewList.length})`}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'services' && (
              <div>
                {categories.map(cat => {
                  const catServices = serviceList.filter(s => s.category === cat);
                  return (
                    <div key={cat} style={{ marginBottom: 'var(--space-8)' }}>
                      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)', textTransform: 'capitalize' }}>{cat}</h2>
                      <div>
                        {catServices.map(s => <ServiceItem key={s.id} service={s} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'staff' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-5)' }}>
                {staffList.map(s => <StaffCard key={s.id} staff={s} />)}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', padding: 'var(--space-5)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-8)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, lineHeight: 1 }}>{avgRating}</div>
                    <StarRating rating={avgRating} />
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>{business.reviewCount} reviews</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', gridColumn: 'span 2' }}>
                    {[5, 4, 3, 2, 1].map(n => {
                      const count = reviewList.filter(r => Math.round(r.overallRating) === n).length;
                      const pct = reviewList.length ? (count / reviewList.length) * 100 : 0;
                      return (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                          <span style={{ width: 16, color: 'var(--color-text-muted)' }}>{n}★</span>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span style={{ width: 24, color: 'var(--color-text-muted)', textAlign: 'right' }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {reviewList.length === 0 ? (
                  <EmptyState title="No reviews yet" description="Be the first to leave a review after your appointment." />
                ) : (
                  reviewList.map(r => {
                    const staff = staffList.find(s => s.id === r.staffId);
                    return <ReviewCard key={r.id} review={r} staffName={staff?.displayName} />;
                  })
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                <div>
                  <h2 style={{ fontWeight: 600, marginBottom: 'var(--space-4)' }}>About {business.name}</h2>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>{business.description}</p>
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)' }}>Amenities</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
                    {business.amenities.map(a => (
                      <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        <CheckCircle size={16} color="var(--color-success)" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)' }}>Opening Hours</h3>
                  {primaryLocation.workingHours.map(wh => (
                    <div key={wh.dayOfWeek} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border-light)', fontSize: 'var(--text-sm)', ...(wh.dayOfWeek === today ? { fontWeight: 600, color: 'var(--color-accent)' } : { color: 'var(--color-text-secondary)' }) }}>
                      <span>{getDayName(wh.dayOfWeek)}</span>
                      <span>{wh.isOpen ? `${wh.openTime} – ${wh.closeTime}` : 'Closed'}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)' }}>Cancellation Policy</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{business.policies.cancellationPolicy}</p>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                {business.gallery.map((img, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => { setGalleryIdx(i); setGalleryOpen(true); }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="hover-scale" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Booking Card */}
          <div style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-6))', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Book an appointment</h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
                Instant confirmation · No credit card required
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                {['Services from ₹{min}', `${staffList.length} professionals`, `${avgRating}★ (${business.reviewCount} reviews)`].map((item, i) => {
                  const min = Math.min(...serviceList.map(s => s.price));
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      <CheckCircle size={16} color="var(--color-accent)" />
                      {i === 0 ? `Services from ₹${min}` : item}
                    </div>
                  );
                })}
              </div>

              <Link to={`/business/${business.id}/book`} className="btn btn-primary w-full btn-lg" style={{ justifyContent: 'center' }}>
                <Calendar size={18} />
                Book Now
              </Link>

              <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                <a href={`tel:${primaryLocation.phone}`} className="btn btn-ghost btn-sm w-full" style={{ justifyContent: 'center' }}>
                  <Phone size={14} /> {primaryLocation.phone}
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Location</h3>
              <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)', border: '1px solid var(--color-border)' }}>
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <MapPin size={24} />
                  <div style={{ fontSize: 'var(--text-xs)', marginTop: 4 }}>Map view</div>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                {primaryLocation.address}<br />
                {primaryLocation.city}, {primaryLocation.postcode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
