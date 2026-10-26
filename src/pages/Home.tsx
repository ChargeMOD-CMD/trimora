import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight, Clock, Star, Shield, Smartphone, CheckCircle,
  Calendar, Award, Users, Scissors, ChevronRight, Sparkles
} from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout';
import { StarRating, Badge } from '../components/ui';
import { trimoraServiceApi, trimoraReviewApi } from '../services/trimoraApi';
import { trimoraStylists, TRIMORA_SALON } from '../data/trimoraData';
import { Service, Review } from '../types';
import '../styles/home.css';

// ─── SERVICE CARD ────────────────────────────────────────────
function ServiceCard({ service }: { service: Service }) {
  const { slug } = useParams();

  const categoryColors: Record<string, string> = {
    haircuts: '#EEF4EE',
    styling: '#F0F0FF',
    color: '#FFF0F5',
    treatments: '#FBF4E0',
    beard: '#F0FFF4',
    waxing: '#FFF5F0',
    packages: '#F5F0FF',
  };
  const bg = categoryColors[service.category] || '#FAF8F5';

  return (
    <div className="service-card card card-hover animate-fade-in-up">
      <div style={{ height: 8, borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', background: 'var(--color-accent)', marginTop: 'calc(-1 * var(--space-6))', marginLeft: 'calc(-1 * var(--space-6))', marginRight: 'calc(-1 * var(--space-6))' }} />
      <div style={{ paddingTop: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {service.category === 'haircuts' ? '✂️' :
             service.category === 'styling' ? '💫' :
             service.category === 'color' ? '🎨' :
             service.category === 'treatments' ? '✨' :
             service.category === 'beard' ? '🪒' :
             service.category === 'packages' ? '👑' : '💆'}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>₹{service.price}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>from</div>
          </div>
        </div>

        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
          {service.name}
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)', WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
          {service.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} /> {service.durationMins} min
          </span>
          {service.addons.length > 0 && (
            <span>· {service.addons.length} add-ons</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link to={`/${slug}/services/${service.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
            View Details
          </Link>
          <Link to={`/${slug}/book?service=${service.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── TESTIMONIAL CARD ─────────────────────────────────────────
function TestimonialCard({ review }: { review: Review & { customerName?: string; stylistName?: string } }) {
  return (
    <div className="card animate-fade-in-up" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array(5).fill(0).map((_, i) => (
          <svg key={i} width={18} height={18} viewBox="0 0 24 24" fill={i < review.overallRating ? 'var(--color-accent)' : 'none'} stroke="var(--color-accent)" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.75, color: 'var(--color-text-secondary)', flex: 1, fontStyle: 'italic' }}>
        "{review.comment.slice(0, 180)}{review.comment.length > 180 ? '...' : ''}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-light)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-accent-dark)', flexShrink: 0 }}>
          {review.customerName?.split(' ').map(n => n[0]).join('') || 'C'}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{review.customerName || 'Valued Client'}</div>
          {review.stylistName && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>With {review.stylistName}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────
export default function HomePage() {
  const { slug } = useParams();

  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<(Review & { customerName?: string; stylistName?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      trimoraServiceApi.getFeaturedServices(),
      trimoraReviewApi.getReviews(),
    ]).then(([svcs, revs]) => {
      setFeaturedServices(svcs.slice(0, 4));
      // Add mock customer names
      const reviewsWithNames = revs.slice(0, 3).map((r, i) => ({
        ...r,
        customerName: ['Emma Harrington', 'Layla Hassan', 'Oliver Rhodes'][i] || 'Valued Client',
        stylistName: ['Isabelle Laurent', 'Marcus Chen', 'James Okafor'][i],
      }));
      setReviews(reviewsWithNames);
      setLoading(false);
    });
  }, []);

  const benefits = [
    { icon: Award, title: 'Expert Stylists', text: 'Our team of 5+ certified professionals bring years of experience and passion to every appointment.' },
    { icon: Shield, title: 'Premium Products', text: 'We use only the finest professional products, carefully selected for quality and results.' },
    { icon: Calendar, title: 'Easy Booking', text: 'Book your appointment in seconds online, 24/7. No phone calls, no waiting on hold.' },
    { icon: Clock, title: 'Flexible Timeslots', text: 'Available Monday to Saturday with early and late appointments to suit your schedule.' },
    { icon: Star, title: 'Personalised Service', text: 'Every appointment starts with a detailed consultation to ensure you get exactly the result you want.' },
    { icon: Smartphone, title: 'Manage Anywhere', text: 'View and manage all your appointments online from any device, anytime.' },
  ];

  const stats = [
    { value: '500+', label: 'Happy Clients' },
    { value: '5', label: 'Expert Stylists' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '8+', label: 'Years Experience' },
  ];

  return (
    <PublicLayout>
      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1800&q=85"
            alt=""
            aria-hidden="true"
            loading="eager"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(28,25,23,0.85) 0%, rgba(28,25,23,0.6) 50%, rgba(28,25,23,0.3) 100%)' }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 'var(--space-20)', paddingBottom: 'var(--space-20)' }}>
          <div style={{ maxWidth: 660 }} className="animate-fade-in-up">
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 'var(--radius-full)', padding: '6px 14px',
              color: 'var(--color-accent)', fontSize: 'var(--text-sm)', fontWeight: 600,
              marginBottom: 'var(--space-6)', backdropFilter: 'blur(8px)'
            }}>
              <Sparkles size={14} />
              Premium Salon in London
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 700, color: 'white', lineHeight: 1.15,
              marginBottom: 'var(--space-6)', letterSpacing: '-0.02em'
            }}>
              Where Style Meets{' '}
              <span style={{ color: 'var(--color-accent)', display: 'block' }}>Sophistication</span>
            </h1>

            <p style={{
              fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.75, marginBottom: 'var(--space-10)', maxWidth: 500
            }}>
              Experience premium salon services from London's finest stylists. Book your appointment online in seconds, no phone calls needed.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <Link to={`/${slug}/book`} className="btn btn-accent btn-lg" id="hero-book-btn">
                Book Appointment <ArrowRight size={18} />
              </Link>
              <Link to={`/${slug}/services`} className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                Explore Services
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-12)', flexWrap: 'wrap' }}>
              {stats.map((stat, i) => (
                <React.Fragment key={stat.label}>
                  {i > 0 && <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', alignSelf: 'stretch' }} />}
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'white' }}>{stat.value}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{stat.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 'var(--space-8)', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: 'var(--text-xs)' }}>Scroll to explore</div>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </section>

      {/* ─── INTRO STRIP ──────────────────────────────────── */}
      <section style={{ background: 'var(--color-dark)', padding: 'var(--space-5) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
            {[
              { text: 'Award-Winning Stylists' },
              { text: '·' },
              { text: 'Premium Products Only' },
              { text: '·' },
              { text: 'Online Booking 24/7' },
              { text: '·' },
              { text: '500+ 5-Star Reviews' },
            ].map((item, i) => (
              <span key={i} style={{
                fontSize: 'var(--text-sm)', fontWeight: 500,
                color: item.text === '·' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
              }}>{item.text}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTRO ────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)', alignItems: 'center' }}>
            <div className="animate-fade-in-up">
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--space-4)' }}>
                About Trimora
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: 'var(--space-6)', letterSpacing: '-0.02em' }}>
                London's Premier<br />Hair & Beauty Destination
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-4)' }}>
                Trimora was founded on a simple belief: everyone deserves a premium salon experience. Located in the heart of London, our studio brings together world-class stylists with a warm, welcoming environment.
              </p>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-8)' }}>
                From precision haircuts to transformative colour services and luxurious treatments, every appointment at Trimora is designed to be an experience you'll remember.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <Link to={`/${slug}/book`} className="btn btn-primary">Book Your Visit</Link>
                <Link to={`/${slug}/services`} className="btn btn-secondary">Our Services</Link>
              </div>
            </div>
            <div className="animate-fade-in" style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"
                alt="Trimora salon interior"
                style={{ borderRadius: 'var(--radius-2xl)', width: '100%', height: 480, objectFit: 'cover', boxShadow: 'var(--shadow-2xl)' }}
                loading="lazy"
              />
              {/* Floating card */}
              <div style={{
                position: 'absolute', bottom: -24, left: -24, background: 'var(--color-surface)',
                padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)', maxWidth: 220
              }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={22} color="var(--color-success)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Just Booked!</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Balayage · Tomorrow</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(i => <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill="var(--color-accent)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>)}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>4.9 average rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED SERVICES ────────────────────────────── */}
      <section className="section section-bg">
        <div className="container">
          <div className="section-header">
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--space-2)' }}>Our Services</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700 }}>Popular Services</h2>
              <p className="section-subtitle">Expert treatments tailored to you</p>
            </div>
            <Link to={`/${slug}/services`} className="btn btn-secondary hide-mobile">
              View All Services <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-6)' }}>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-xl)' }} />
              ))
            ) : (
              featuredServices.map(svc => <ServiceCard key={svc.id} service={svc} />)
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <Link to={`/${slug}/services`} className="btn btn-primary">
              View All Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--space-4)' }}>Simple Booking</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Book in 4 Simple Steps
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 480, margin: '0 auto' }}>
              The fastest way to secure your perfect appointment
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-8)', position: 'relative' }}>
            {[
              { step: '01', icon: Scissors, title: 'Choose a Service', desc: 'Browse our full menu and select the perfect service for you.' },
              { step: '02', icon: Users, title: 'Select Your Stylist', desc: 'Pick your preferred stylist or let us match you with the perfect professional.' },
              { step: '03', icon: Calendar, title: 'Pick Date & Time', desc: 'Choose from available slots that fit perfectly into your schedule.' },
              { step: '04', icon: CheckCircle, title: 'Confirm & Enjoy', desc: 'Enter your details, confirm, and arrive ready to be pampered.' },
            ].map((item, i) => (
              <div key={item.step} className="animate-fade-in-up" style={{ textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--color-dark)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto var(--space-5)', position: 'relative'
                }}>
                  <item.icon size={28} />
                  <span style={{
                    position: 'absolute', top: -4, right: -4, width: 24, height: 24,
                    background: 'var(--color-accent)', borderRadius: '50%',
                    fontSize: 'var(--text-xs)', fontWeight: 800, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{item.step}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>{item.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-12)' }}>
            <Link to={`/${slug}/book`} className="btn btn-primary btn-lg" id="how-it-works-cta">
              Book Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─────────────────────────────────────── */}
      <section className="section section-bg">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--space-4)' }}>Why Trimora</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700 }}>
              Why Choose Trimora
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-3)', maxWidth: 460, margin: '0 auto' }}>
              Everything you need for a perfect salon experience, in one place
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {benefits.map((benefit, i) => (
              <div key={benefit.title} className="card animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-accent-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-accent-dark)', marginBottom: 'var(--space-4)'
                }}>
                  <benefit.icon size={24} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>{benefit.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--space-4)' }}>Client Love</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              What Our Clients Say
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(i => <svg key={i} width={20} height={20} viewBox="0 0 24 24" fill="var(--color-accent)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>)}
              </div>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>4.9</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>from 486 verified reviews</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {loading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-xl)' }} />)
            ) : (
              reviews.map(review => <TestimonialCard key={review.id} review={review} />)
            )}
          </div>
        </div>
      </section>

      {/* ─── BOOKING CTA ──────────────────────────────────── */}
      <section style={{
        background: 'var(--color-dark)',
        padding: 'var(--space-24) 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(201,168,76,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--space-5)' }}>
            Ready to Transform?
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700, color: 'white', marginBottom: 'var(--space-5)',
            letterSpacing: '-0.02em'
          }}>
            Book Your Appointment Today
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.6)', marginBottom: 'var(--space-10)', maxWidth: 500, margin: '0 auto var(--space-10)' }}>
            Join hundreds of satisfied clients who trust Trimora for their hair and beauty needs. Your perfect look is just a click away.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/${slug}/book`} className="btn btn-accent btn-lg" id="cta-book-now">
              Book Now — It's Free <ArrowRight size={18} />
            </Link>
            <Link to={`/${slug}/services`} className="btn btn-lg" style={{ background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)' }}>
              View Services
            </Link>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.3)', marginTop: 'var(--space-6)' }}>
            No credit card required · Free cancellation up to 24h · Online 24/7
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
