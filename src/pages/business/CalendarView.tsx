import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Search, Filter
} from 'lucide-react';
import { trimoraBookingApi, trimmoraStylistApi, trimoraServiceApi } from '../../services/trimoraApi';
import { useAuth } from '../../features/auth/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button, Avatar, Input } from '../../components/ui';
import { Appointment, StaffMember, Service } from '../../types';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

export default function CalendarView() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      // For calendar view, we get all appointments and filter by date locally
      // In a real app we would pass the date to the API
      const [allApts, staff, svcs] = await Promise.all([
        trimoraBookingApi.getAllAppointments(),
        trimmoraStylistApi.getAllStylists(),
        trimoraServiceApi.getAllServices()
      ]);
      
      const dateStr = date.toISOString().split('T')[0];
      const todayApts = allApts.filter(a => a.participants[0].startTime.startsWith(dateStr) && a.status !== 'cancelled');
      
      setAppointments(todayApts);
      setStaffList(staff);
      setServices(Object.fromEntries(svcs.map(s => [s.id, s])));
      setLoading(false);
    };
    fetch();
  }, [user, date]);

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
  };

  const setToday = () => setDate(new Date());

  const getAppointmentsForStaffAndHour = (staffId: string, hour: number) => {
    return appointments.filter(a => {
      const p = a.participants[0];
      if (p.staffId !== staffId) return false;
      const aptHour = parseInt(p.startTime.split('T')[1].substring(0, 2), 10);
      return aptHour === hour;
    });
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <h1 className="page-title">Calendar</h1>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => changeDate(-1)}><ChevronLeft size={16} /></button>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, padding: '0 var(--space-4)', minWidth: 140, textAlign: 'center' }}>
                {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => changeDate(1)}><ChevronRight size={16} /></button>
            </div>
            <Button variant="secondary" size="sm" onClick={setToday}>Today</Button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ width: 240 }}><Input leftIcon={<Search size={16} />} placeholder="Search calendar..." /></div>
            <Button variant="secondary" leftIcon={<Filter size={16} />}>Filter</Button>
            <Button variant="primary" leftIcon={<Plus size={16} />}>New Appointment</Button>
          </div>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 600, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading schedule...</div>
        ) : (
          <div style={{ display: 'flex', flex: 1, overflow: 'auto' }}>
            {/* Time column */}
            <div style={{ width: 80, flexShrink: 0, borderRight: '1px solid var(--color-border-light)', background: 'var(--color-surface-2)' }}>
              <div style={{ height: 60, borderBottom: '1px solid var(--color-border-light)' }} /> {/* Header spacer */}
              {HOURS.map(hour => (
                <div key={hour} style={{ height: 120, borderBottom: '1px solid var(--color-border-light)', padding: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>
              ))}
            </div>

            {/* Staff columns */}
            {staffList.map(staff => (
              <div key={staff.id} style={{ flex: 1, minWidth: 200, borderRight: '1px solid var(--color-border-light)' }}>
                {/* Staff Header */}
                <div style={{ height: 60, borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '0 var(--space-4)', position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 10 }}>
                  <Avatar src={staff.avatar} name={staff.displayName} size="sm" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{staff.displayName}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>0/8 Booked</div>
                  </div>
                </div>

                {/* Staff Schedule Grid */}
                <div style={{ position: 'relative' }}>
                  {HOURS.map(hour => {
                    const apts = getAppointmentsForStaffAndHour(staff.id, hour);
                    return (
                      <div key={hour} style={{ height: 120, borderBottom: '1px solid var(--color-border-light)', position: 'relative', padding: 2 }}>
                        {apts.map(apt => {
                          const p = apt.participants[0];
                          const startMin = parseInt(p.startTime.split('T')[1].substring(3, 5), 10);
                          const duration = p.durationMins;
                          
                          // Calculate position (120px = 60 mins -> 2px per min)
                          const top = (startMin / 60) * 120;
                          const height = (duration / 60) * 120;
                          
                          const isConfirmed = apt.status === 'confirmed';
                          const isCompleted = apt.status === 'completed';
                          const svcName = services[p.serviceId]?.name || 'Service';
                          
                          return (
                            <div key={apt.id} style={{ 
                              position: 'absolute', top, left: 4, right: 4, height: height - 4,
                              background: isCompleted ? 'var(--color-surface-2)' : isConfirmed ? 'var(--color-accent-lighter)' : 'var(--color-warning-lighter)',
                              borderLeft: `4px solid ${isCompleted ? 'var(--color-border)' : isConfirmed ? 'var(--color-accent)' : 'var(--color-warning)'}`,
                              borderRadius: '4px', padding: '4px 8px', overflow: 'hidden', cursor: 'pointer',
                              boxShadow: 'var(--shadow-sm)'
                            }}>
                              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.personName}</div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{svcName}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
