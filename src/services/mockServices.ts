import {
  businesses, staffMembers, services, appointments, customers,
  reviews, products, giftCards, promoCodes, loyaltyAccounts
} from '../data/mockData';
import {
  Business, StaffMember, Service, Appointment, Customer,
  Review, Product, GiftCard, PromoCode, LoyaltyAccount,
  BookingState, AppointmentStatus, TimeSlot
} from '../types';
import { generateAvailableSlots } from '../utils/availability';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── BUSINESS SERVICE ────────────────────────────────────────────
export const mockBusinessService = {
  async getBusinesses(filters?: { query?: string; type?: string }): Promise<Business[]> {
    await delay(400);
    let result = [...businesses];
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(q) || b.locations.some(l => l.city.toLowerCase().includes(q)));
    }
    if (filters?.type && filters.type !== 'all') {
      result = result.filter(b => b.type === filters.type);
    }
    return result;
  },

  async getBusinessById(id: string): Promise<Business | null> {
    await delay(300);
    return businesses.find(b => b.id === id) || null;
  },

  async getBusinessBySlug(slug: string): Promise<Business | null> {
    await delay(300);
    return businesses.find(b => b.slug === slug) || null;
  },

  async getFeaturedBusinesses(): Promise<Business[]> {
    await delay(300);
    return businesses.filter(b => b.isFeatured);
  },
};

// ─── STAFF SERVICE ────────────────────────────────────────────────
export const mockStaffService = {
  async getStaffByBusiness(businessId: string): Promise<StaffMember[]> {
    await delay(300);
    return staffMembers.filter(s => s.businessId === businessId && s.isActive);
  },

  async getStaffById(staffId: string): Promise<StaffMember | null> {
    await delay(200);
    return staffMembers.find(s => s.id === staffId) || null;
  },

  async getStaffForService(businessId: string, serviceId: string): Promise<StaffMember[]> {
    await delay(300);
    const svc = services.find(s => s.id === serviceId);
    if (!svc) return [];
    return staffMembers.filter(s => s.businessId === businessId && s.isActive && svc.staffIds.includes(s.id));
  },

  async updateStaff(_staffId: string, data: Partial<StaffMember>): Promise<StaffMember> {
    await delay(600);
    const idx = staffMembers.findIndex(s => s.id === _staffId);
    if (idx === -1) throw new Error('Staff not found');
    Object.assign(staffMembers[idx], data);
    return staffMembers[idx];
  },
};

// ─── SERVICE SERVICE ──────────────────────────────────────────────
export const mockServiceService = {
  async getServicesByBusiness(businessId: string): Promise<Service[]> {
    await delay(300);
    return services.filter(s => s.businessId === businessId && s.isActive);
  },

  async getServiceById(serviceId: string): Promise<Service | null> {
    await delay(200);
    return services.find(s => s.id === serviceId) || null;
  },

  async getFeaturedServices(businessId: string): Promise<Service[]> {
    await delay(200);
    return services.filter(s => s.businessId === businessId && s.isActive && s.isFeatured);
  },
};

// ─── AVAILABILITY SERVICE ─────────────────────────────────────────
export const mockAvailabilityService = {
  async getAvailableSlots(businessId: string, staffId: string, date: string, serviceId: string): Promise<TimeSlot[]> {
    await delay(500);
    const staff = staffMembers.find(s => s.id === staffId && s.businessId === businessId);
    const service = services.find(s => s.id === serviceId);
    if (!staff || !service) return [];

    const dayAppointments = appointments.filter(a =>
      a.businessId === businessId &&
      a.status !== 'cancelled' &&
      a.participants.some(p => p.staffId === staffId && p.startTime.startsWith(date))
    );

    return generateAvailableSlots(staff, service, date, dayAppointments);
  },

  async getAvailableDates(businessId: string, staffId: string, serviceId: string, month: string): Promise<{ date: string; hasAvailability: boolean }[]> {
    await delay(400);
    const staff = staffMembers.find(s => s.id === staffId && s.businessId === businessId);
    if (!staff) return [];

    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthNum - 1, day);
      if (date < today) {
        result.push({ date: date.toISOString().split('T')[0], hasAvailability: false });
        continue;
      }
      const dayOfWeek = date.getDay();
      const wh = staff.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
      result.push({ date: date.toISOString().split('T')[0], hasAvailability: !!wh?.isOpen });
    }
    return result;
  },
};

// ─── BOOKING SERVICE ──────────────────────────────────────────────
let bookingStore = [...appointments];

export const mockBookingService = {
  async createBooking(bookingData: BookingState & { customerId?: string }): Promise<Appointment> {
    await delay(1000);

    const business = businesses.find(b => b.id === bookingData.businessId);
    if (!business) throw new Error('Business not found');

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      businessId: bookingData.businessId!,
      locationId: bookingData.locationId || business.primaryLocationId,
      customerId: bookingData.customerId || 'guest',
      type: bookingData.participants.length > 1 ? 'group' : 'individual',
      participants: bookingData.participants.map((p, i) => ({
        id: `p-${Date.now()}-${i}`,
        appointmentId: `apt-${Date.now()}`,
        personName: p.name || bookingData.guestName,
        serviceId: p.serviceId!,
        staffId: p.staffId!,
        addonIds: p.addonIds,
        startTime: `${bookingData.selectedDate}T${bookingData.selectedTime}:00.000Z`,
        durationMins: services.find(s => s.id === p.serviceId)?.durationMins || 30,
        price: services.find(s => s.id === p.serviceId)?.price || 0,
        notes: bookingData.notes,
      })),
      status: 'confirmed',
      paymentStatus: bookingData.paymentMethod === 'cash' ? 'unpaid' : 'paid',
      paymentMethod: bookingData.paymentMethod || undefined,
      totalPrice: bookingData.participants.reduce((sum, p) => {
        const svc = services.find(s => s.id === p.serviceId);
        const addonTotal = p.addonIds.reduce((aSum, aId) => {
          const svcAddons = svc?.addons || [];
          const addon = svcAddons.find(a => a.id === aId);
          return aSum + (addon?.price || 0);
        }, 0);
        return sum + (svc?.price || 0) + addonTotal;
      }, 0) - (bookingData.promoDiscount || 0),
      depositAmount: 0,
      discountCode: bookingData.promoCode || undefined,
      discountAmount: bookingData.promoDiscount || 0,
      notes: bookingData.notes,
      specialRequests: bookingData.specialRequests,
      bookingSource: 'online',
      reminderSent: false,
      reviewRequested: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bookingStore.push(newAppointment);
    return newAppointment;
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    await delay(300);
    return bookingStore.find(a => a.id === id) || null;
  },

  async getAppointmentsByCustomer(customerId: string): Promise<Appointment[]> {
    await delay(400);
    return bookingStore.filter(a => a.customerId === customerId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getAppointmentsByBusiness(businessId: string, filters?: { date?: string; staffId?: string; status?: AppointmentStatus }): Promise<Appointment[]> {
    await delay(400);
    let result = bookingStore.filter(a => a.businessId === businessId);
    if (filters?.date) result = result.filter(a => a.participants.some(p => p.startTime.startsWith(filters.date!)));
    if (filters?.staffId) result = result.filter(a => a.participants.some(p => p.staffId === filters.staffId));
    if (filters?.status) result = result.filter(a => a.status === filters.status);
    return result.sort((a, b) => {
      const aTime = a.participants[0]?.startTime || a.createdAt;
      const bTime = b.participants[0]?.startTime || b.createdAt;
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    });
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    await delay(400);
    const idx = bookingStore.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Appointment not found');
    bookingStore[idx] = { ...bookingStore[idx], status, updatedAt: new Date().toISOString() };
    return bookingStore[idx];
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    return this.updateAppointmentStatus(id, 'cancelled');
  },

  async validatePromoCode(code: string, businessId: string, amount: number): Promise<{ valid: boolean; discount: number; message: string }> {
    await delay(400);
    const promo = promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase() && p.businessId === businessId && p.isActive);
    if (!promo) return { valid: false, discount: 0, message: 'Invalid promo code' };
    if (promo.endDate && new Date(promo.endDate) < new Date()) return { valid: false, discount: 0, message: 'This promo code has expired' };
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return { valid: false, discount: 0, message: 'This promo code has reached its usage limit' };
    if (promo.minimumSpend && amount < promo.minimumSpend) return { valid: false, discount: 0, message: `Minimum spend of ₹${promo.minimumSpend} required` };
    const discount = promo.discountType === 'percentage' ? (amount * promo.discountValue) / 100 : promo.discountValue;
    return { valid: true, discount: Math.min(discount, amount), message: `${promo.discountType === 'percentage' ? promo.discountValue + '%' : '₹' + promo.discountValue} discount applied` };
  },
};

// ─── CUSTOMER SERVICE ─────────────────────────────────────────────
export const mockCustomerService = {
  async getCustomers(businessId: string, query?: string): Promise<Customer[]> {
    await delay(400);
    let result = customers.filter(c => c.businessId === businessId);
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
    await delay(200);
    return customers.find(c => c.id === id) || null;
  },

  async getLoyaltyAccount(customerId: string, businessId: string): Promise<LoyaltyAccount | null> {
    await delay(200);
    return loyaltyAccounts.find(la => la.customerId === customerId && la.businessId === businessId) || null;
  },
};

// ─── PAYMENT SERVICE ──────────────────────────────────────────────
export const mockPaymentService = {
  async processPayment(_appointmentId: string, _amount: number, _method: string): Promise<{ success: boolean; transactionId: string }> {
    await delay(1500);
    // Simulate 95% success rate
    if (Math.random() < 0.95) {
      return { success: true, transactionId: `txn-${Date.now()}` };
    }
    throw new Error('Payment declined. Please try again or use a different payment method.');
  },

  async validateGiftCard(code: string, businessId: string): Promise<GiftCard | null> {
    await delay(400);
    return giftCards.find(gc => gc.code === code && gc.businessId === businessId && gc.status === 'active') || null;
  },
};

// ─── INVENTORY SERVICE ────────────────────────────────────────────
export const mockInventoryService = {
  async getProducts(businessId: string, query?: string): Promise<Product[]> {
    await delay(400);
    let result = products.filter(p => p.businessId === businessId && p.isActive);
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    return result;
  },

  async getLowStockProducts(businessId: string): Promise<Product[]> {
    await delay(300);
    return products.filter(p => p.businessId === businessId && p.isActive && p.stockQuantity <= p.lowStockThreshold);
  },
};

// ─── REVIEW SERVICE ───────────────────────────────────────────────
export const mockReviewService = {
  async getReviewsByBusiness(businessId: string): Promise<Review[]> {
    await delay(300);
    return reviews.filter(r => r.businessId === businessId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async submitReview(reviewData: Omit<Review, 'id' | 'isVerified' | 'createdAt'>): Promise<Review> {
    await delay(800);
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    return newReview;
  },
};
