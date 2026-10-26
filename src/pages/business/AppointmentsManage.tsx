import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import { trimoraBookingApi, trimmoraStylistApi, trimoraServiceApi, trimoraCustomerApi } from '../../services/trimoraApi';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../features/notifications/ToastContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Link, useNavigate } from 'react-router-dom';
import { Button, StatusBadge, Input, Avatar, Skeleton, EmptyState, Badge, Modal } from '../../components/ui';
import { Appointment, StaffMember, Service, Customer } from '../../types';
import { formatTime12, formatDuration } from '../../utils/availability';

export default function AppointmentsManage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Record<string, StaffMember>>({});
  const [services, setServices] = useState<Record<string, Service>>({});
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerEmail, setEditCustomerEmail] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [apts, stf, svcs, custs] = await Promise.all([
        trimoraBookingApi.getAllAppointments(),
        trimmoraStylistApi.getAllStylists(),
        trimoraServiceApi.getAllServices(),
        trimoraCustomerApi.getAllCustomers()
      ]);
      
      setAppointments(apts);
      setStaff(Object.fromEntries(stf.map(s => [s.id, s])));
      setServices(Object.fromEntries(svcs.map(s => [s.id, s])));
      setCustomers(Object.fromEntries(custs.map(c => [c.id, c])));
      setLoading(false);
    };
    fetch();
  }, [user]);

  const updateStatus = async (id: string, status: any) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    await trimoraBookingApi.updateAppointmentStatus(id, status);
    toast('success', `Appointment ${status}`);
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to completely delete this appointment?')) return;
    setAppointments(prev => prev.filter(a => a.id !== id));
    await trimoraBookingApi.deleteAppointment(id);
    toast('success', 'Appointment deleted');
  };

  const handleEditAppointment = async (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;
    
    setEditingAppointment(appointment);
    const p = appointment.participants[0];
    const dt = new Date(p.startTime);
    
    setEditDate(dt.toISOString().split('T')[0]);
    setEditTime(dt.toISOString().split('T')[1].substring(0, 5));
    setEditNotes(p.notes || appointment.notes || '');

    const isGuest = appointment.customerId === 'guest';
    const c = isGuest ? null : customers[appointment.customerId];
    setEditCustomerName(isGuest ? p.personName : `${c?.firstName || ''} ${c?.lastName || ''}`.trim() || p.personName);
    setEditCustomerEmail(appointment.customerEmail || c?.email || '');
    setEditCustomerPhone(appointment.customerPhone || c?.phone || '');

    setIsEditModalOpen(true);
  };

  const handleSaveAppointment = async () => {
    if (!editingAppointment) return;
    setSaving(true);
    
    try {
      const isGuest = editingAppointment.customerId === 'guest';

      // Update local state for appointments
      setAppointments(prev => prev.map(a => {
        if (a.id === editingAppointment.id) {
          const updated = { ...a, notes: editNotes };
          if (isGuest) {
            updated.customerEmail = editCustomerEmail;
            updated.customerPhone = editCustomerPhone;
          }
          if (updated.participants.length > 0) {
            updated.participants[0] = { 
              ...updated.participants[0], 
              personName: editCustomerName,
              notes: editNotes,
              startTime: `${editDate}T${editTime}:00.000Z`
            };
          }
          return updated;
        }
        return a;
      }));

      // Update Customer API & State
      if (!isGuest) {
        const parts = editCustomerName.trim().split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');
        
        await trimoraCustomerApi.updateCustomer(editingAppointment.customerId, {
          firstName,
          lastName,
          email: editCustomerEmail,
          phone: editCustomerPhone
        });
        
        setCustomers(prev => ({
          ...prev,
          [editingAppointment.customerId]: {
            ...prev[editingAppointment.customerId],
            firstName,
            lastName,
            email: editCustomerEmail,
            phone: editCustomerPhone
          }
        }));
      }

      // Update Appointment via API
      await trimoraBookingApi.updateAppointment(editingAppointment.id, { 
        notes: editNotes,
        startTime: `${editDate}T${editTime}:00.000Z`,
        personName: editCustomerName,
        customerEmail: isGuest ? editCustomerEmail : undefined,
        customerPhone: isGuest ? editCustomerPhone : undefined
      });
      
      toast('success', 'Appointment updated!');
      setIsEditModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const filteredApts = appointments
    .filter(a => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        const p = a.participants[0];
        return p.personName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Appointments</h1>
            <p className="page-subtitle">Manage all incoming and past bookings.</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/book')}>New Appointment</Button>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
              <button 
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(f)}
                style={{ textTransform: 'capitalize' }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ width: 280 }}>
            <Input 
              leftIcon={<Search size={16} />} 
              placeholder="Search by name or reference..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={64} />)}
          </div>
        ) : filteredApts.length === 0 ? (
          <EmptyState title="No appointments found" description="Try adjusting your filters or search query." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Date & Time</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Service</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Professional</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Payment</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApts.map(apt => {
                  const p = apt.participants[0];
                  const svc = services[p.serviceId];
                  const stf = p.staffId ? staff[p.staffId] : null;
                  return (
                    <tr key={apt.id} style={{ borderBottom: '1px solid var(--color-border-light)' }} className="hover-bg">
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ fontWeight: 600 }}>{p.personName}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{apt.customerPhone || apt.id.split('-')[2] || apt.id}</div>
                        {apt.customerEmail && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{apt.customerEmail}</div>}
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div>{new Date(p.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{formatTime12(p.startTime.split('T')[1].substring(0, 5))}</div>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div>{svc?.name || 'Unknown'}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{formatDuration(p.durationMins)}</div>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <Avatar name={stf?.displayName || 'Any'} size="sm" />
                          <span>{stf?.displayName || 'Any'}</span>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <StatusBadge status={apt.status} />
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ fontWeight: 600 }}>₹{apt.totalPrice}</div>
                        <Badge variant={apt.paymentStatus === 'paid' ? 'success' : 'warning'}>{apt.paymentStatus}</Badge>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                          {apt.status === 'pending' && (
                            <Button variant="outline-accent" size="sm" onClick={() => updateStatus(apt.id, 'confirmed')} title="Confirm"><CheckCircle size={14} /></Button>
                          )}
                          {apt.status === 'confirmed' && (
                            <Button variant="outline-accent" size="sm" onClick={() => updateStatus(apt.id, 'completed')} title="Complete"><CheckCircle size={14} /></Button>
                          )}
                          {(apt.status === 'pending' || apt.status === 'confirmed') && (
                            <Button variant="ghost" size="sm" onClick={() => updateStatus(apt.id, 'cancelled')} title="Cancel" style={{ color: 'var(--color-error)' }}><XCircle size={14} /></Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleEditAppointment(apt.id)} title="Edit"><Edit2 size={16} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAppointment(apt.id)} title="Delete" style={{ color: 'var(--color-error)' }}><Trash2 size={16} /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Appointment Details" size="md">
        {editingAppointment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            {/* Customer Details Section */}
            <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>CUSTOMER DETAILS</h4>
              <Input 
                label="Full Name" 
                value={editCustomerName} 
                onChange={e => setEditCustomerName(e.target.value)} 
                required 
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <Input 
                  label="Email Address" 
                  type="email" 
                  value={editCustomerEmail} 
                  onChange={e => setEditCustomerEmail(e.target.value)} 
                />
                <Input 
                  label="Phone Number" 
                  type="tel" 
                  value={editCustomerPhone} 
                  onChange={e => setEditCustomerPhone(e.target.value)} 
                />
              </div>
            </div>

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Input label="Date" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} required />
              <Input label="Time" type="time" value={editTime} onChange={e => setEditTime(e.target.value)} required />
            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="input-label">Appointment Notes</label>
              <textarea 
                className="input" 
                rows={4} 
                placeholder="Add customer requests or internal notes..."
                value={editNotes} 
                onChange={e => setEditNotes(e.target.value)} 
              />
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveAppointment} loading={saving}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

    </DashboardLayout>
  );
}
