// ============================================================
// TRIMORA — Service Layer (Mock)
// ============================================================

import {
  trimoraServices, trimoraStylists, trimoraCustomers, trimoraReviews,
  getAppointmentStore, addToAppointmentStore, updateAppointmentInStore
} from '../data/trimoraData';
import { Service, StaffMember, Customer, Appointment, Review, AppointmentStatus, TimeSlot, BookingState } from '../types';
import { generateAvailableSlots } from '../utils/availability';
import { apiClient } from './apiClient';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── CONTEXT HELPER ───────────────────────────────────────────
const getContextBusinessId = (): string => {
  try {
    const stored = localStorage.getItem('trimora_auth');
    if (stored) {
      const { user } = JSON.parse(stored);
      if (user && user.businessId) return user.businessId;
    }
  } catch {}
  return 'trimora-salon'; // fallback
};

// ─── SERVICE API ─────────────────────────────────────────────
export const trimoraServiceApi = {
  async getAllServices(categoryFilter?: string): Promise<Service[]> {
    const remote = await apiClient.get<Service[]>(
      `/services${categoryFilter && categoryFilter !== 'all' ? `?category=${categoryFilter}` : ''}`
    );
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote;
    }

    await delay(300);
    const bizId = getContextBusinessId();
    let result = trimoraServices.filter(s => s.isActive && s.businessId === bizId);
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(s => s.category === categoryFilter);
    }
    return result.sort((a, b) => a.orderIndex - b.orderIndex);
  },

  async getServiceById(id: string): Promise<Service | null> {
    const remote = await apiClient.get<Service>(`/services/${id}`);
    if (remote) return remote;

    await delay(200);
    return trimoraServices.find(s => s.id === id && s.isActive) || null;
  },

  async getFeaturedServices(): Promise<Service[]> {
    const all = await this.getAllServices();
    return all.filter(s => s.isActive && s.isFeatured);
  },

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const remote = await apiClient.put<Service>(`/services/${id}`, data);
    if (remote) {
      const idx = trimoraServices.findIndex(s => s.id === id);
      if (idx !== -1) Object.assign(trimoraServices[idx], remote);
      return remote;
    }

    await delay(600);
    const idx = trimoraServices.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Service not found');
    Object.assign(trimoraServices[idx], data);
    return trimoraServices[idx];
  },

  async createService(data: Omit<Service, 'id'>): Promise<Service> {
    const remote = await apiClient.post<Service>('/services', data);
    if (remote) {
      trimoraServices.push(remote);
      return remote;
    }

    await delay(600);
    const newService: Service = {
      ...data,
      id: `ts-${Date.now()}`,
      businessId: data.businessId || getContextBusinessId(),
    };
    trimoraServices.push(newService);
    return newService;
  },

  async deleteService(id: string): Promise<void> {
    await apiClient.delete(`/services/${id}`);
    await delay(400);
    const idx = trimoraServices.findIndex(s => s.id === id);
    if (idx !== -1) trimoraServices[idx].isActive = false;
  },
};

// ─── STYLIST API ──────────────────────────────────────────────
export const trimmoraStylistApi = {
  async getAllStylists(): Promise<StaffMember[]> {
    const remote = await apiClient.get<StaffMember[]>('/stylists');
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote;
    }

    await delay(300);
    const bizId = getContextBusinessId();
    return trimoraStylists
      .filter(s => s.isActive && s.businessId === bizId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  },

  async getStylistById(id: string): Promise<StaffMember | null> {
    const remote = await apiClient.get<StaffMember>(`/stylists/${id}`);
    if (remote) return remote;

    await delay(200);
    return trimoraStylists.find(s => s.id === id) || null;
  },

  async getStylistsForService(serviceId: string): Promise<StaffMember[]> {
    const remote = await apiClient.get<StaffMember[]>(`/stylists?serviceId=${serviceId}`);
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote;
    }

    await delay(300);
    const svc = trimoraServices.find(s => s.id === serviceId);
    if (!svc) return [];
    return trimoraStylists.filter(
      s => s.isActive && s.isAcceptingBookings && svc.staffIds.includes(s.id)
    );
  },

  async updateStylist(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
    const remote = await apiClient.put<StaffMember>(`/stylists/${id}`, data);
    if (remote) {
      const idx = trimoraStylists.findIndex(s => s.id === id);
      if (idx !== -1) Object.assign(trimoraStylists[idx], remote);
      return remote;
    }

    await delay(600);
    const idx = trimoraStylists.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Stylist not found');
    Object.assign(trimoraStylists[idx], data);
    return trimoraStylists[idx];
  },

  async createStylist(data: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    const remote = await apiClient.post<StaffMember>('/stylists', data);
    if (remote) {
      trimoraStylists.push(remote);
      return remote;
    }

    await delay(600);
    const newStylist: StaffMember = {
      ...data,
      id: `ts-staff-${Date.now()}`,
      businessId: data.businessId || getContextBusinessId(),
    };
    trimoraStylists.push(newStylist);
    return newStylist;
  },

  async deleteStylist(id: string): Promise<void> {
    await apiClient.delete(`/stylists/${id}`);
    await delay(400);
    const idx = trimoraStylists.findIndex(s => s.id === id);
    if (idx !== -1) trimoraStylists[idx].isActive = false;
  },
};

// ─── AVAILABILITY API ─────────────────────────────────────────
export const trimoraAvailabilityApi = {
  async getAvailableDates(
    staffId: string,
    _serviceId: string,
    month: string
  ): Promise<{ date: string; hasAvailability: boolean }[]> {
    await delay(400);
    const staff = trimoraStylists.find(s => s.id === staffId);
    if (!staff) return [];

    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const result = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthNum - 1, day);
      if (date < todayDate) {
        result.push({ date: date.toISOString().split('T')[0], hasAvailability: false });
        continue;
      }
      const dayOfWeek = date.getDay();
      const wh = staff.workingHours.find(w => w.dayOfWeek === dayOfWeek);
      result.push({ date: date.toISOString().split('T')[0], hasAvailability: !!wh?.isOpen });
    }
    return result;
  },

  async getAvailableSlots(
    staffId: string,
    date: string,
    serviceId: string
  ): Promise<TimeSlot[]> {
    await delay(400);
    const staff = trimoraStylists.find(s => s.id === staffId);
    const service = trimoraServices.find(s => s.id === serviceId);
    if (!staff || !service) return [];

    const allAppointments = getAppointmentStore();
    const dayAppointments = allAppointments.filter(a =>
      a.status !== 'cancelled' &&
      a.participants.some(p => p.staffId === staffId && p.startTime.startsWith(date))
    );

    return generateAvailableSlots(staff, service, date, dayAppointments);
  },
};

// ─── BOOKING API ──────────────────────────────────────────────
export const trimoraBookingApi = {
  async createBooking(bookingData: BookingState & { customerId?: string }): Promise<Appointment & { bookingRef: string }> {
    const remote = await apiClient.post<Appointment & { bookingRef: string }>('/bookings', bookingData);
    if (remote) {
      addToAppointmentStore(remote);
      return remote;
    }

    await delay(1200);

    const participant = bookingData.participants[0];
    const service = trimoraServices.find(s => s.id === participant?.serviceId);
    if (!service) throw new Error('Service not found');

    const addonTotal = (participant?.addonIds || []).reduce((sum, aId) => {
      const addon = service.addons.find(a => a.id === aId);
      return sum + (addon?.price || 0);
    }, 0);

    const totalPrice = service.price + addonTotal - (bookingData.promoDiscount || 0);
    const bookingRef = `TRM-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

    const newAppointment: Appointment = {
      id: `ta-apt-${Date.now()}`,
      businessId: bookingData.businessId || getContextBusinessId(),
      locationId: bookingData.locationId || 'trimora-loc-1',
      customerId: bookingData.customerId || 'guest',
      customerEmail: bookingData.guestEmail,
      customerPhone: bookingData.guestPhone,
      type: 'individual',
      participants: [{
        id: `tap-${Date.now()}`,
        appointmentId: `ta-apt-${Date.now()}`,
        personName: bookingData.guestName,
        serviceId: participant.serviceId!,
        staffId: participant.staffId!,
        addonIds: participant.addonIds,
        startTime: `${bookingData.selectedDate}T${bookingData.selectedTime}:00.000Z`,
        durationMins: service.durationMins,
        price: totalPrice,
        notes: bookingData.notes,
      }],
      status: 'confirmed',
      paymentStatus: bookingData.paymentMethod === 'cash' ? 'unpaid' : 'paid',
      paymentMethod: bookingData.paymentMethod || undefined,
      totalPrice,
      depositAmount: 0,
      discountAmount: bookingData.promoDiscount || 0,
      notes: bookingData.notes,
      bookingSource: 'online',
      reminderSent: false,
      reviewRequested: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addToAppointmentStore(newAppointment);
    return { ...newAppointment, bookingRef };
  },

  async getAppointmentsByBusiness(): Promise<Appointment[]> {
    const remote = await apiClient.get<Appointment[]>('/bookings');
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote;
    }

    await delay(300);
    const bizId = getContextBusinessId();
    return getAppointmentStore().filter(a => a.businessId === bizId);
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    await delay(300);
    const store = getAppointmentStore();
    const index = store.findIndex(a => a.id === id);
    if (index !== -1) {
      store[index].status = status;
    }
  },

  async deleteAppointment(id: string): Promise<void> {
    await delay(300);
    const store = getAppointmentStore();
    const index = store.findIndex(a => a.id === id);
    if (index !== -1) {
      store.splice(index, 1);
    }
  },

  async updateAppointment(id: string, data: { notes: string; startTime?: string; personName?: string; customerEmail?: string; customerPhone?: string }): Promise<void> {
    await delay(300);
    const store = getAppointmentStore();
    const index = store.findIndex(a => a.id === id);
    if (index !== -1) {
      store[index].notes = data.notes;
      if (data.customerEmail !== undefined) store[index].customerEmail = data.customerEmail;
      if (data.customerPhone !== undefined) store[index].customerPhone = data.customerPhone;
      
      if (store[index].participants.length > 0) {
        store[index].participants[0].notes = data.notes;
        if (data.startTime) {
          store[index].participants[0].startTime = data.startTime;
        }
        if (data.personName) {
          store[index].participants[0].personName = data.personName;
        }
      }
    }
  },

  async getAppointmentsByCustomer(customerId: string): Promise<Appointment[]> {
    await delay(400);
    return getAppointmentStore()
      .filter(a => a.customerId === customerId)
      .sort((a, b) =>
        new Date(b.participants[0]?.startTime || b.createdAt).getTime() -
        new Date(a.participants[0]?.startTime || a.createdAt).getTime()
      );
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    await delay(200);
    return getAppointmentStore().find(a => a.id === id) || null;
  },

  async getAllAppointments(filters?: {
    date?: string;
    status?: AppointmentStatus;
    staffId?: string;
    query?: string;
  }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.set('date', filters.date);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.staffId) params.set('staffId', filters.staffId);
    if (filters?.query) params.set('search', filters.query);
    const qStr = params.toString();

    const remote = await apiClient.get<Appointment[]>(`/bookings${qStr ? `?${qStr}` : ''}`);
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote;
    }

    await delay(400);
    const bizId = getContextBusinessId();
    let result = getAppointmentStore().filter(a => a.businessId === bizId);

    if (filters?.date) result = result.filter(a => a.participants.some(p => p.startTime.startsWith(filters.date!)));
    if (filters?.status) result = result.filter(a => a.status === filters.status);
    if (filters?.staffId) result = result.filter(a => a.participants.some(p => p.staffId === filters.staffId));
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(a => {
        const cust = trimoraCustomers.find(c => c.id === a.customerId);
        const name = (cust ? `${cust.firstName} ${cust.lastName}` : a.participants[0]?.personName || '').toLowerCase();
        return name.includes(q) || a.id.toLowerCase().includes(q);
      });
    }

    return result.sort((a, b) => {
      const aTime = a.participants[0]?.startTime || a.createdAt;
      const bTime = b.participants[0]?.startTime || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const remote = await apiClient.patch<Appointment>(`/bookings/${id}/status`, { status });
    if (remote) {
      updateAppointmentInStore(id, { status, updatedAt: new Date().toISOString() });
      return remote;
    }

    await delay(400);
    const apt = getAppointmentStore().find(a => a.id === id);
    if (!apt) throw new Error('Appointment not found');
    updateAppointmentInStore(id, { status, updatedAt: new Date().toISOString() });
    return { ...apt, status };
  },

  async cancelAppointment(id: string): Promise<void> {
    await apiClient.delete(`/bookings/${id}`);
    await this.updateStatus(id, 'cancelled');
  },

  async validatePromoCode(code: string, amount: number): Promise<{ valid: boolean; discount: number; message: string }> {
    await delay(300);
    const codes: Record<string, { type: 'pct' | 'fixed'; value: number; min?: number }> = {
      'WELCOME15': { type: 'pct', value: 15, min: 40 },
      'TRIM20': { type: 'fixed', value: 20, min: 60 },
      'FIRST10': { type: 'pct', value: 10 },
    };
    const promo = codes[code.toUpperCase()];
    if (!promo) return { valid: false, discount: 0, message: 'Invalid promo code' };
    if (promo.min && amount < promo.min) return { valid: false, discount: 0, message: `Minimum spend of ₹${promo.min} required` };
    const discount = promo.type === 'pct' ? (amount * promo.value) / 100 : promo.value;
    return { valid: true, discount: Math.round(discount * 100) / 100, message: `${promo.type === 'pct' ? promo.value + '%' : '₹' + promo.value} discount applied!` };
  },
};

// ─── CUSTOMER API ─────────────────────────────────────────────
export const trimoraCustomerApi = {
  async getAllCustomers(query?: string): Promise<Customer[]> {
    const remote = await apiClient.get<Customer[]>(
      `/customers${query ? `?search=${encodeURIComponent(query)}` : ''}`
    );
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote;
    }

    await delay(400);
    const bizId = getContextBusinessId();
    let result = trimoraCustomers.filter(c => c.businessId === bizId);
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(c =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }
    return result;
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const remote = await apiClient.get<Customer>(`/customers/${id}`);
    if (remote) return remote;

    await delay(200);
    return trimoraCustomers.find(c => c.id === id) || null;
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const remote = await apiClient.put<Customer>(`/customers/${id}`, data);
    if (remote) {
      const idx = trimoraCustomers.findIndex(c => c.id === id);
      if (idx !== -1) Object.assign(trimoraCustomers[idx], remote);
      return remote;
    }

    await delay(500);
    const idx = trimoraCustomers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    Object.assign(trimoraCustomers[idx], data);
    return trimoraCustomers[idx];
  },
};

// ─── REVIEW API ───────────────────────────────────────────────
export const trimoraReviewApi = {
  async getReviews(): Promise<Review[]> {
    const remote = await apiClient.get<Review[]>('/reviews');
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote;
    }

    await delay(300);
    const bizId = getContextBusinessId();
    return trimoraReviews
      .filter(r => r.businessId === bizId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getFeaturedReviews(): Promise<Review[]> {
    const all = await this.getReviews();
    return all.filter(r => r.overallRating >= 5).slice(0, 3);
  },
};

// ─── DASHBOARD STATS ──────────────────────────────────────────
export const trimoraDashboardApi = {
  async getDashboardStats() {
    const remote = await apiClient.get<any>('/dashboard/stats');
    if (remote) return remote;

    await delay(500);
    const bizId = getContextBusinessId();
    const allApts = getAppointmentStore().filter(a => a.businessId === bizId);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayApts = allApts.filter(a =>
      a.participants.some(p => p.startTime.startsWith(todayStr)) &&
      a.status !== 'cancelled'
    );
    const upcomingApts = allApts.filter(a => {
      const aptDate = new Date(a.participants[0]?.startTime || '');
      return aptDate > new Date() && a.status !== 'cancelled' && a.status !== 'completed';
    });
    const completedApts = allApts.filter(a => a.status === 'completed');
    const totalRevenue = completedApts.reduce((sum, a) => sum + a.totalPrice, 0);

    return {
      totalAppointments: allApts.length,
      todayAppointments: todayApts.length,
      upcomingAppointments: upcomingApts.length,
      completedAppointments: completedApts.length,
      totalCustomers: trimoraCustomers.filter(c => c.businessId === bizId).length,
      activeStylists: trimoraStylists.filter(s => s.isActive && s.businessId === bizId).length,
      totalServices: trimoraServices.filter(s => s.isActive && s.businessId === bizId).length,
      totalRevenue,
      todayRevenue: todayApts.reduce((sum, a) => sum + a.totalPrice, 0),
      avgRating: 4.9,
    };
  },
};
