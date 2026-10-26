import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, User, Clock, Scissors, Check, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useBooking } from '../../features/booking/BookingContext';
import { trimoraServiceApi, trimmoraStylistApi, trimoraAvailabilityApi, trimoraBookingApi } from '../../services/trimoraApi';
import { TRIMORA_SALON } from '../../data/trimoraData';
import { Service, StaffMember, TimeSlot } from '../../types';
import { Button, Avatar, Skeleton, Input, Textarea } from '../../components/ui';
import { calculateTotalDuration, calculateTotalPrice, formatDuration, formatTime12, formatDateShort } from '../../utils/availability';
import { useAuth } from '../../features/auth/AuthContext';

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Service' },
    { num: 2, label: 'Professional' },
    { num: 3, label: 'Date & Time' },
    { num: 4, label: 'Details' },
    { num: 5, label: 'Payment' }
  ];

  // Adjust currentStep for display (Confirmation is step 6)
  const displayStep = Math.min(currentStep, 5);

  return (
    <div className="steps" style={{ width: '100%', overflowX: 'auto', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
      {steps.map((step, i) => {
        const isActive = displayStep === step.num;
        const isCompleted = displayStep > step.num;
        return (
          <React.Fragment key={step.num}>
            <div className="step-item">
              <div className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.num}
              </div>
              <span className={`step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`} style={{ color: isCompleted ? 'var(--color-text-primary)' : undefined }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, initBooking, setService, setStaff, setDate, setTime, toggleAddon, nextStep, prevStep, dispatch } = useBooking();
  const { user } = useAuth();
  
  const business = TRIMORA_SALON;
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Availability state
  const [availableDates, setAvailableDates] = useState<{ date: string; hasAvailability: boolean }[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      trimoraServiceApi.getAllServices(),
      trimmoraStylistApi.getAllStylists()
    ]).then(([svcs, stf]) => {
      setServices(svcs);
      setStaffList(stf);
      
      const serviceIdFromUrl = searchParams.get('service');
      initBooking(serviceIdFromUrl || undefined);
      
      setLoading(false);
    });
  }, [initBooking, searchParams]);

  // Load availability dates when staff and service are selected
  useEffect(() => {
    const p = state.participants[0];
    if (p.staffId && p.serviceId && state.step === 3) {
      setLoadingAvailability(true);
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      trimoraAvailabilityApi.getAvailableDates(p.staffId, p.serviceId, currentMonth).then(dates => {
        setAvailableDates(dates);
        setLoadingAvailability(false);
      });
    }
  }, [state.participants, state.step]);

  // Load time slots when date is selected
  useEffect(() => {
    const p = state.participants[0];
    if (p.staffId && p.serviceId && state.selectedDate) {
      setLoadingAvailability(true);
      trimoraAvailabilityApi.getAvailableSlots(p.staffId, state.selectedDate, p.serviceId).then(slots => {
        setAvailableSlots(slots);
        setLoadingAvailability(false);
      });
    }
  }, [state.participants, state.selectedDate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', padding: 'var(--space-8)' }}>
        <Skeleton width="100%" height="100%" />
      </div>
    );
  }

  const p = state.participants[0]; // Individual booking
  const selectedService = services.find(s => s.id === p.serviceId);
  const selectedStaff = staff.find(s => s.id === p.staffId);

  const totalDuration = calculateTotalDuration(
    p.serviceId ? [p.serviceId] : [], 
    p.addonIds, 
    services
  );
  
  const totalPrice = calculateTotalPrice(
    p.serviceId ? [p.serviceId] : [], 
    p.addonIds, 
    services
  ) - state.promoDiscount;

  const handleBook = async () => {
    try {
      const apt = await trimoraBookingApi.createBooking({
        ...state,
        customerId: user?.id,
        guestName: user ? `${user.firstName} ${user.lastName}` : state.guestName,
        guestEmail: user?.email || state.guestEmail,
        guestPhone: user?.phone || state.guestPhone
      });
      
      setBookingRef(apt.bookingRef);
      nextStep();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="booking-layout">
      {/* HEADER */}
      <div className="booking-header">
        <button className="btn btn-ghost btn-icon" onClick={() => state.step > 1 && state.step < 6 ? prevStep() : navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Scissors size={18} color="var(--color-accent)" /> Trimora Booking
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div className="booking-container">
        {/* LEFT COLUMN: Booking Wizard */}
        <div className="booking-wizard">
          {state.step < 6 && <StepIndicator currentStep={state.step} />}

          {/* STEP 1: SERVICE */}
          {state.step === 1 && (
            <div className="animate-fade-in">
              <h2 className="booking-step-title">Select a Service</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {services.map(svc => (
                  <div key={svc.id} className="card card-hover" style={{ padding: 'var(--space-5)', cursor: 'pointer', border: p.serviceId === svc.id ? '2px solid var(--color-accent)' : undefined }}
                    onClick={() => {
                      setService(p.id, svc.id);
                      setTimeout(() => nextStep(), 200);
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{svc.name}</div>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>{svc.description}</div>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                          <span>⏱ {formatDuration(svc.durationMins)}</span>
                          {svc.addons.length > 0 && <span>+ {svc.addons.length} add-ons available</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, flexShrink: 0, color: 'var(--color-text-primary)' }}>₹{svc.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: PROFESSIONAL */}
          {state.step === 2 && (
            <div className="animate-fade-in">
              <h2 className="booking-step-title">Select Professional</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="card card-hover" style={{ padding: 'var(--space-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}
                  onClick={() => {
                    const anyStaff = staff.filter(s => s.serviceIds.includes(p.serviceId!))[0];
                    if (anyStaff) {
                      setStaff(p.id, anyStaff.id);
                      setTimeout(() => nextStep(), 200);
                    }
                  }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="var(--color-text-muted)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Any Professional</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Maximum availability</div>
                  </div>
                  <ChevronRight size={20} color="var(--color-text-muted)" />
                </div>

                {staff.filter(s => s.serviceIds.includes(p.serviceId!) && s.isAcceptingBookings).map(s => (
                  <div key={s.id} className="card card-hover" style={{ padding: 'var(--space-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', border: p.staffId === s.id ? '2px solid var(--color-accent)' : undefined }}
                    onClick={() => {
                      setStaff(p.id, s.id);
                      setTimeout(() => nextStep(), 200);
                    }}>
                    <Avatar src={s.avatar} name={s.displayName} size="lg" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{s.displayName}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{s.role}</div>
                    </div>
                    <ChevronRight size={20} color="var(--color-text-muted)" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: DATE & TIME */}
          {state.step === 3 && (
            <div className="animate-fade-in">
              <h2 className="booking-step-title">Select Date & Time</h2>
              
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Select Date</h3>
                <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
                  {loadingAvailability ? <Skeleton height={70} width="100%" /> : (
                    availableDates.map(d => {
                      const dateObj = new Date(d.date);
                      const isSelected = state.selectedDate === d.date;
                      return (
                        <button key={d.date} 
                          disabled={!d.hasAvailability}
                          onClick={() => setDate(d.date)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)',
                            border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            background: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                            color: isSelected ? 'white' : (d.hasAvailability ? 'var(--color-text-primary)' : 'var(--color-text-muted)'),
                            cursor: d.hasAvailability ? 'pointer' : 'not-allowed',
                            opacity: d.hasAvailability ? 1 : 0.5,
                            minWidth: 70
                          }}>
                          <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                            {dateObj.toLocaleDateString('en-GB', { weekday: 'short' })}
                          </span>
                          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                            {dateObj.getDate()}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {state.selectedDate && (
                <div>
                  <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Select Time</h3>
                  {loadingAvailability ? <Skeleton height={120} /> : availableSlots.length === 0 ? (
                    <div style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)' }}>
                      No available slots on this date. Please select another date.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 'var(--space-3)' }}>
                      {availableSlots.map(slot => {
                        const isSelected = state.selectedTime === slot.time;
                        return (
                          <button key={slot.time}
                            disabled={!slot.isAvailable}
                            onClick={() => setTime(slot.time)}
                            style={{
                              padding: 'var(--space-3) 0', borderRadius: 'var(--radius-md)', textAlign: 'center',
                              border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                              background: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                              color: isSelected ? 'white' : (slot.isAvailable ? 'var(--color-text-primary)' : 'var(--color-text-muted)'),
                              cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                              opacity: slot.isAvailable ? 1 : 0.5,
                              fontWeight: 600, fontSize: 'var(--text-sm)'
                            }}>
                            {formatTime12(slot.time)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 'var(--space-8)' }}>
                <Button fullWidth size="lg" disabled={!state.selectedDate || !state.selectedTime} onClick={nextStep}>
                  Continue to Details
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: DETAILS & ADDONS */}
          {state.step === 4 && (
            <div className="animate-fade-in">
              <h2 className="booking-step-title">Your Details & Extras</h2>
              
              {selectedService?.addons && selectedService.addons.length > 0 && (
                <div style={{ marginBottom: 'var(--space-8)' }}>
                  <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Optional Add-ons</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {selectedService.addons.map(addon => {
                      const isSelected = p.addonIds.includes(addon.id);
                      return (
                        <div key={addon.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: isSelected ? '1.5px solid var(--color-accent)' : undefined, background: isSelected ? 'var(--color-accent-lighter)' : undefined }}
                          onClick={() => toggleAddon(p.id, addon.id)}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{addon.name}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>+₹{addon.price} · {addon.durationMins} min</div>
                          </div>
                          <div style={{ width: 24, height: 24, borderRadius: 4, border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`, background: isSelected ? 'var(--color-accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isSelected && <Check size={14} color="white" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

                <div style={{ marginBottom: 'var(--space-8)' }}>
                  <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Contact Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <Input label="Full Name" required value={state.guestName} onChange={e => dispatch({ type: 'SET_GUEST_DETAILS', payload: { guestName: e.target.value } })} />
                    <Input label="Email Address" type="email" required value={state.guestEmail} onChange={e => dispatch({ type: 'SET_GUEST_DETAILS', payload: { guestEmail: e.target.value } })} />
                    <Input label="Phone Number" type="tel" required value={state.guestPhone} onChange={e => dispatch({ type: 'SET_GUEST_DETAILS', payload: { guestPhone: e.target.value } })} />
                  </div>
                </div>

              <div>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Additional Notes</h3>
                <Textarea placeholder="Any special requests or notes for the professional?" value={state.notes} onChange={e => dispatch({ type: 'SET_GUEST_DETAILS', payload: { notes: e.target.value } })} />
              </div>

              <div style={{ marginTop: 'var(--space-8)' }}>
                <Button fullWidth size="lg" onClick={nextStep} disabled={!state.guestName || !state.guestEmail || !state.guestPhone}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT */}
          {state.step === 5 && (
            <div className="animate-fade-in">
              <h2 className="booking-step-title">Payment Options</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {[
                  { id: 'card', label: 'Pay Now (Credit/Debit Card)', desc: 'Secure payment via Stripe', icon: CreditCard },
                  { id: 'cash', label: 'Pay at Salon', desc: 'Pay with cash or card after your service', icon: Scissors }
                ].map(method => (
                  <div key={method.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', cursor: 'pointer', border: state.paymentMethod === method.id ? '2px solid var(--color-accent)' : undefined }}
                    onClick={() => dispatch({ type: 'SET_PAYMENT_METHOD', payload: method.id as any })}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                      <method.icon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{method.label}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{method.desc}</div>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `6px solid ${state.paymentMethod === method.id ? 'var(--color-accent)' : 'var(--color-border)'}` }} />
                  </div>
                ))}
              </div>

              {state.paymentMethod === 'card' && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-8)', background: 'var(--color-surface-2)' }}>
                  <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Card Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <Input placeholder="Card number" leftIcon={<CreditCard size={18} />} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                      <Input placeholder="MM/YY" />
                      <Input placeholder="CVC" />
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      This is a secure, encrypted payment test environment.
                    </p>
                  </div>
                </div>
              )}

              <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--color-accent-lighter)', color: 'var(--color-accent-dark)' }}>
                <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Cancellation Policy</h4>
                <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                  {business.cancellationPolicy}
                </p>
              </div>

              <div style={{ marginTop: 'var(--space-8)' }}>
                <Button fullWidth size="lg" onClick={handleBook} disabled={!state.paymentMethod}>
                  {state.paymentMethod === 'card' ? `Pay ₹${totalPrice} & Confirm` : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRMATION */}
          {state.step === 6 && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
              <div style={{ width: 80, height: 80, background: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto var(--space-6)' }}>
                <CheckCircle2 size={40} />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Booking Confirmed!</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)', maxWidth: 400, margin: '0 auto var(--space-8)' }}>
                Your appointment at Trimora has been successfully booked. We've sent a confirmation email to you.
              </p>
              
              <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'left', marginBottom: 'var(--space-8)', display: 'inline-block', minWidth: 320 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Date & Time</div>
                    <div style={{ fontWeight: 600 }}>{formatDateShort(state.selectedDate!)}</div>
                    <div style={{ fontWeight: 600 }}>{formatTime12(state.selectedTime!)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Booking Ref</div>
                    <div style={{ fontWeight: 600 }}>{bookingRef || 'TRM-00000'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Service</span>
                    <span style={{ fontWeight: 500 }}>{selectedService?.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Professional</span>
                    <span style={{ fontWeight: 500 }}>{selectedStaff?.displayName || 'Any Professional'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Duration</span>
                    <span style={{ fontWeight: 500 }}>{formatDuration(totalDuration)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Total Paid</span>
                    <span style={{ fontWeight: 600 }}>₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                {user ? (
                  <Link to="/account" className="btn btn-primary">View My Appointments</Link>
                ) : (
                  <Link to={`/${slug || ''}`} className="btn btn-primary">Back to Home</Link>
                )}
                <Button variant="secondary" leftIcon={<Calendar size={16} />}>Add to Calendar</Button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Booking Summary (sticky) */}
        {state.step < 6 && (
          <div className="booking-summary-col hide-mobile">
            <div className="card booking-summary">
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                Booking Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {/* Location */}
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                    <Scissors size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{business.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{business.address}</div>
                  </div>
                </div>

                {/* Service Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', background: 'var(--color-surface-2)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  {selectedService ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{selectedService.name}</div>
                        {p.addonIds.map((aId: string) => {
                          const addon = selectedService.addons.find(a => a.id === aId);
                          return addon ? <div key={addon.id} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>+ {addon.name}</div> : null;
                        })}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                        ₹{calculateTotalPrice([p.serviceId!], p.addonIds, services)}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No service selected</div>
                  )}
                  
                  <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                    <User size={16} color="var(--color-text-muted)" />
                    <span style={{ color: selectedStaff ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                      {selectedStaff ? selectedStaff.displayName : 'Any Professional'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                    <Calendar size={16} color="var(--color-text-muted)" />
                    <span style={{ color: state.selectedDate ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                      {state.selectedDate ? formatDateShort(state.selectedDate) : 'Date & Time'}
                      {state.selectedTime && ` at ${formatTime12(state.selectedTime)}`}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Duration</span>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{formatDuration(totalDuration)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Total</span>
                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>₹{totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
