import { StaffMember, Service, Appointment, TimeSlot, WorkingHours } from '../types';

const SLOT_INTERVAL_MINS = 30;

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

function getWorkingHoursForDay(staff: StaffMember, dayOfWeek: number): WorkingHours | null {
  return staff.workingHours.find(wh => wh.dayOfWeek === dayOfWeek && wh.isOpen) || null;
}

function getBookedRanges(appointments: Appointment[], staffId: string, date: string): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  for (const apt of appointments) {
    if (apt.status === 'cancelled') continue;
    for (const participant of apt.participants) {
      if (participant.staffId !== staffId) continue;
      const aptDate = participant.startTime.split('T')[0];
      if (aptDate !== date) continue;
      const aptTimeStr = participant.startTime.split('T')[1].substring(0, 5);
      const startMin = timeToMinutes(aptTimeStr);
      ranges.push({ start: startMin, end: startMin + participant.durationMins });
    }
  }
  return ranges;
}

function isSlotAvailable(slotStart: number, durationMins: number, bookedRanges: { start: number; end: number }[], breaks: { start: string; end: string }[] = []): boolean {
  const slotEnd = slotStart + durationMins;

  // Check against booked appointments
  for (const range of bookedRanges) {
    if (slotStart < range.end && slotEnd > range.start) return false;
  }

  // Check against breaks
  for (const brk of breaks) {
    const breakStart = timeToMinutes(brk.start);
    const breakEnd = timeToMinutes(brk.end);
    if (slotStart < breakEnd && slotEnd > breakStart) return false;
  }

  return true;
}

export function generateAvailableSlots(
  staff: StaffMember,
  service: Service,
  date: string,
  existingAppointments: Appointment[]
): TimeSlot[] {
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  const wh = getWorkingHoursForDay(staff, dayOfWeek);
  if (!wh) return [];

  const openMin = timeToMinutes(wh.openTime);
  const closeMin = timeToMinutes(wh.closeTime);
  const bookedRanges = getBookedRanges(existingAppointments, staff.id, date);

  const now = new Date();
  const isToday = date === now.toISOString().split('T')[0];
  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 60 : 0; // 1-hour lead time for today

  const slots: TimeSlot[] = [];
  let currentSlot = openMin;

  while (currentSlot + service.durationMins <= closeMin) {
    const isPast = isToday && currentSlot <= currentMinutes;
    const available = !isPast && isSlotAvailable(currentSlot, service.durationMins, bookedRanges, wh.breaks);

    slots.push({
      time: minutesToTime(currentSlot),
      isAvailable: available,
      staffId: staff.id,
    });

    currentSlot += SLOT_INTERVAL_MINS;
  }

  return slots;
}

export function calculateTotalDuration(serviceIds: string[], addonIds: string[], servicesData: Service[]): number {
  return serviceIds.reduce((total, svcId) => {
    const svc = servicesData.find(s => s.id === svcId);
    if (!svc) return total;
    const addonDuration = addonIds.reduce((aTotal, aId) => {
      const addon = svc.addons.find(a => a.id === aId);
      return aTotal + (addon?.durationMins || 0);
    }, 0);
    return total + svc.durationMins + addonDuration;
  }, 0);
}

export function calculateTotalPrice(serviceIds: string[], addonIds: string[], servicesData: Service[]): number {
  return serviceIds.reduce((total, svcId) => {
    const svc = servicesData.find(s => s.id === svcId);
    if (!svc) return total;
    const addonPrice = addonIds.reduce((aTotal, aId) => {
      const addon = svc.addons.find(a => a.id === aId);
      return aTotal + (addon?.price || 0);
    }, 0);
    return total + (svc.salePrice || svc.price) + addonPrice;
  }, 0);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function getDayName(dayOfWeek: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'accent',
    checked_in: 'info',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'default',
    no_show: 'error',
  };
  return map[status] || 'default';
}

export function getStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function isDatePast(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export function getDaysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
