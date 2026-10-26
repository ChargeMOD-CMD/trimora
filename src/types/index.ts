// ============================================================
// SNIPRO — TypeScript Type Definitions
// ============================================================

// ─── ENUMS ───────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'owner' | 'manager' | 'stylist' | 'receptionist' | 'customer';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid' | 'refunded' | 'partial';

export type PaymentMethod = 'card' | 'cash' | 'apple_pay' | 'google_pay' | 'wallet' | 'gift_card';

export type BookingType = 'individual' | 'group';

export type WaitlistStatus = 'waiting' | 'slot_available' | 'confirmed' | 'expired';

export type GiftCardStatus = 'active' | 'redeemed' | 'expired' | 'cancelled';

export type MembershipStatus = 'active' | 'cancelled' | 'paused' | 'expired';

export type CampaignType = 'sms' | 'email' | 'push';

export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'payment_successful'
  | 'waitlist_slot'
  | 'review_request'
  | 'promo'
  | 'loyalty_reward'
  | 'low_inventory';

export type ServiceCategory =
  | 'haircuts'
  | 'fades'
  | 'beard'
  | 'shaving'
  | 'styling'
  | 'color'
  | 'kids'
  | 'treatments'
  | 'packages'
  | 'waxing'
  | 'nails';

// ─── USER ────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  businessId?: string; // for staff/owners
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── BUSINESS ────────────────────────────────────────────────

export interface BusinessLocation {
  id: string;
  businessId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  coordinates?: { lat: number; lng: number };
  workingHours: WorkingHours[];
  isMain: boolean;
  isActive: boolean;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  type: 'barbershop' | 'salon' | 'spa' | 'studio' | 'independent';
  coverImage: string;
  logo: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  locations: BusinessLocation[];
  primaryLocationId: string;
  amenities: string[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  policies: {
    cancellationPolicy: string;
    depositRequired: boolean;
    depositAmount: number; // percentage
    bookingLeadTimeHours: number;
    maxAdvanceBookingDays: number;
    bufferTimeMins: number;
  };
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface WorkingHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
  breaks?: { start: string; end: string }[];
}

// ─── STAFF ───────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  businessId: string;
  locationId: string;
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  avatar: string;
  specialties: string[];
  serviceIds: string[];
  rating: number;
  reviewCount: number;
  role: UserRole;
  commissionPercent: number;
  workingHours: WorkingHours[];
  isActive: boolean;
  isAcceptingBookings: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface BlockedTime {
  id: string;
  staffId: string;
  startDateTime: string;
  endDateTime: string;
  reason: string;
  isRecurring: boolean;
  recurrenceRule?: string;
}

// ─── SERVICES ─────────────────────────────────────────────────

export interface ServiceAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMins: number;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  category: ServiceCategory;
  durationMins: number;
  price: number;
  salePrice?: number;
  addons: ServiceAddon[];
  staffIds: string[]; // which staff can perform this
  isActive: boolean;
  isFeatured: boolean;
  isMemberOnly: boolean;
  requiresDeposit: boolean;
  depositAmount: number;
  maxGroupSize: number;
  orderIndex: number;
  tags: string[];
}

// ─── APPOINTMENT ──────────────────────────────────────────────

export interface AppointmentParticipant {
  id: string;
  appointmentId: string;
  personName: string;
  serviceId: string;
  staffId: string;
  addonIds: string[];
  startTime: string;
  durationMins: number;
  price: number;
  notes?: string;
}

export interface Appointment {
  id: string;
  businessId: string;
  locationId: string;
  customerId: string;
  customerEmail?: string;
  customerPhone?: string;
  type: BookingType;
  participants: AppointmentParticipant[];
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  totalPrice: number;
  depositAmount: number;
  discountCode?: string;
  discountAmount: number;
  notes?: string;
  specialRequests?: string;
  bookingSource: 'online' | 'in_person' | 'phone' | 'walk_in';
  reminderSent: boolean;
  reviewRequested: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── CUSTOMER ────────────────────────────────────────────────

export interface Customer {
  id: string;
  userId?: string;
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  notes: string;
  preferences: string[];
  importantNotes: string;
  tags: string[];
  favoriteStaffId?: string;
  totalSpend: number;
  visitCount: number;
  noShowCount: number;
  cancellationCount: number;
  lastVisit?: string;
  nextAppointment?: string;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
}

// ─── PAYMENT / TRANSACTION ────────────────────────────────────

export interface Transaction {
  id: string;
  appointmentId?: string;
  businessId: string;
  customerId: string;
  staffId?: string;
  items: TransactionItem[];
  subtotal: number;
  discountAmount: number;
  tipAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  giftCardId?: string;
  giftCardAmountUsed?: number;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  refundedAmount?: number;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  type: 'service' | 'addon' | 'product' | 'gift_card';
  referenceId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ─── PRODUCT / INVENTORY ──────────────────────────────────────

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  brand: string;
  supplier: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  image?: string;
  isActive: boolean;
  tags: string[];
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  businessId: string;
  supplier: string;
  items: { productId: string; quantity: number; unitCost: number }[];
  totalCost: number;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  orderedAt?: string;
  receivedAt?: string;
  createdAt: string;
}

// ─── GIFT CARD ────────────────────────────────────────────────

export interface GiftCard {
  id: string;
  businessId: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  purchasedByCustomerId: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;
  status: GiftCardStatus;
  expiresAt?: string;
  purchasedAt: string;
  transactions: { amount: number; date: string; appointmentId?: string }[];
}

// ─── LOYALTY ─────────────────────────────────────────────────

export interface LoyaltyAccount {
  id: string;
  customerId: string;
  businessId: string;
  points: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  transactions: LoyaltyTransaction[];
  createdAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'expire' | 'bonus';
  points: number;
  description: string;
  appointmentId?: string;
  createdAt: string;
}

export interface LoyaltyReward {
  id: string;
  businessId: string;
  name: string;
  description: string;
  pointsCost: number;
  rewardType: 'discount' | 'free_service' | 'product';
  rewardValue: number;
  serviceId?: string;
  isActive: boolean;
}

export interface LoyaltyConfig {
  businessId: string;
  pointsPerVisit: number;
  pointsPerCurrencyUnit: number; // e.g., 1 point per ₹1
  currencyPerPoint: number; // value of redemption
  rewardThreshold: number;
  pointsExpireAfterDays?: number;
}

// ─── MEMBERSHIP ───────────────────────────────────────────────

export interface MembershipPlan {
  id: string;
  businessId: string;
  name: string;
  description: string;
  monthlyPrice: number;
  includedServices: { serviceId: string; quantity: number }[];
  discountPercent: number;
  hasPriorityBooking: boolean;
  perks: string[];
  isActive: boolean;
}

export interface Membership {
  id: string;
  customerId: string;
  planId: string;
  status: MembershipStatus;
  startDate: string;
  endDate?: string;
  nextBillingDate: string;
  servicesUsedThisMonth: { serviceId: string; count: number }[];
}

// ─── REVIEWS ─────────────────────────────────────────────────

export interface Review {
  id: string;
  businessId: string;
  appointmentId: string;
  customerId: string;
  staffId: string;
  overallRating: number;
  serviceRating: number;
  professionalRating: number;
  comment: string;
  photos?: string[];
  ownerReply?: string;
  ownerReplyAt?: string;
  isVerified: boolean;
  createdAt: string;
}

// ─── MARKETING ───────────────────────────────────────────────

export interface Campaign {
  id: string;
  businessId: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  subject?: string;
  content: string;
  targetSegment: 'all' | 'new' | 'returning' | 'inactive' | 'loyalty' | 'custom';
  scheduledAt?: string;
  sentAt?: string;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bookingsGenerated: number;
    revenueGenerated: number;
  };
  createdAt: string;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ─── PROMO CODE ───────────────────────────────────────────────

export interface PromoCode {
  id: string;
  businessId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumSpend?: number;
  maxUses?: number;
  usedCount: number;
  eligibleServiceIds?: string[];
  eligibleCustomerIds?: string[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── BOOKING STATE ────────────────────────────────────────────

export interface BookingParticipant {
  id: string;
  name: string;
  serviceId: string | null;
  staffId: string | null;
  addonIds: string[];
}

export interface BookingState {
  businessId: string | null;
  locationId: string | null;
  step: number;
  participants: BookingParticipant[];
  selectedDate: string | null; // ISO date string
  selectedTime: string | null; // "09:00"
  promoCode: string | null;
  promoDiscount: number;
  paymentMethod: PaymentMethod | null;
  notes: string;
  specialRequests: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  isGroupBooking: boolean;
}

// ─── AVAILABILITY ─────────────────────────────────────────────

export interface TimeSlot {
  time: string; // "09:00"
  isAvailable: boolean;
  staffId?: string;
}

export interface AvailabilityDay {
  date: string; // ISO date string
  hasAvailability: boolean;
  slots: TimeSlot[];
}

// ─── REPORT ───────────────────────────────────────────────────

export interface ReportSummary {
  totalRevenue: number;
  totalBookings: number;
  completedAppointments: number;
  cancellationRate: number;
  noShowRate: number;
  newCustomers: number;
  returningCustomers: number;
  averageTicket: number;
  topServices: { serviceId: string; name: string; count: number; revenue: number }[];
  topStaff: { staffId: string; name: string; bookings: number; revenue: number }[];
}
