import {
  Business, BusinessLocation, StaffMember, Service, ServiceAddon,
  Appointment, Customer, Review, Product, GiftCard, LoyaltyAccount,
  MembershipPlan, PromoCode, Transaction, WorkingHours, Campaign,
  Notification
} from '../types';

// ─── HELPERS ────────────────────────────────────────────────────
const id = () => Math.random().toString(36).substr(2, 9);

const defaultWorkingHours: WorkingHours[] = [
  { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '18:00' },
  { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '21:00' },
  { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '18:00' },
];

// ─── LOCATIONS ──────────────────────────────────────────────────
export const locations: BusinessLocation[] = [
  {
    id: 'loc-1',
    businessId: 'biz-1',
    name: 'Cranbrook Branch',
    address: '45 High Street',
    city: 'Cranbrook',
    state: 'Kent',
    postcode: 'TN17 3DT',
    country: 'UK',
    phone: '+44 1580 713452',
    email: 'cranbrook@gentlemenshouse.com',
    coordinates: { lat: 51.0991, lng: 0.5318 },
    workingHours: defaultWorkingHours,
    isMain: true,
    isActive: true,
  },
  {
    id: 'loc-2',
    businessId: 'biz-2',
    name: 'London Mayfair',
    address: '12 Brook Street',
    city: 'London',
    state: 'Greater London',
    postcode: 'W1K 5DL',
    country: 'UK',
    phone: '+44 20 7408 1234',
    email: 'mayfair@studioluxe.com',
    workingHours: defaultWorkingHours,
    isMain: true,
    isActive: true,
  },
  {
    id: 'loc-3',
    businessId: 'biz-3',
    name: 'Manchester Northern Quarter',
    address: '88 Oldham Street',
    city: 'Manchester',
    state: 'Greater Manchester',
    postcode: 'M4 1LE',
    country: 'UK',
    phone: '+44 161 834 5678',
    email: 'nq@groovebarbers.com',
    workingHours: defaultWorkingHours,
    isMain: true,
    isActive: true,
  },
];

// ─── BUSINESSES ─────────────────────────────────────────────────
export const businesses: Business[] = [
  {
    id: 'biz-1',
    name: "The Gentlemen's House",
    slug: 'the-gentlemens-house',
    tagline: 'Classic cuts. Timeless style.',
    description: "Cranbrook's premier barbershop experience. We combine traditional barbering craft with modern style, creating an environment where every visit feels like a ritual. Our expert barbers are dedicated to helping you look and feel your absolute best.",
    type: 'barbershop',
    coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
      'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80',
      'https://images.unsplash.com/photo-1593702288056-7cc7e4d4a6f7?w=800&q=80',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
      'https://images.unsplash.com/photo-1598524374810-fb08a7e86e5b?w=800&q=80',
    ],
    rating: 4.9,
    reviewCount: 312,
    locations: [locations[0]],
    primaryLocationId: 'loc-1',
    amenities: ['Free WiFi', 'Premium Products', 'Hot Towel Service', 'Complimentary Beverages', 'Parking Available'],
    policies: {
      cancellationPolicy: 'Cancel up to 2 hours before your appointment for a full refund. Late cancellations may be charged 50% of the service fee.',
      depositRequired: true,
      depositAmount: 20,
      bookingLeadTimeHours: 1,
      maxAdvanceBookingDays: 60,
      bufferTimeMins: 10,
    },
    isVerified: true,
    isFeatured: true,
    createdAt: '2022-01-15T00:00:00Z',
  },
  {
    id: 'biz-2',
    name: 'Studio Luxe',
    slug: 'studio-luxe',
    tagline: 'Where beauty meets excellence.',
    description: 'London\'s most luxurious hair and beauty salon. Nestled in the heart of Mayfair, Studio Luxe is your ultimate destination for hair, beauty, and wellness. Our award-winning team of stylists and therapists bring together decades of expertise to deliver exceptional results.',
    type: 'salon',
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80',
      'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=800&q=80',
    ],
    rating: 4.8,
    reviewCount: 589,
    locations: [locations[1]],
    primaryLocationId: 'loc-2',
    amenities: ['Free WiFi', 'Luxury Products', 'Champagne Service', 'Private Suites', 'Valet Parking'],
    policies: {
      cancellationPolicy: 'We require 24-hour notice for cancellations. No-show appointments will be charged in full.',
      depositRequired: true,
      depositAmount: 25,
      bookingLeadTimeHours: 2,
      maxAdvanceBookingDays: 90,
      bufferTimeMins: 15,
    },
    isVerified: true,
    isFeatured: true,
    createdAt: '2021-06-01T00:00:00Z',
  },
  {
    id: 'biz-3',
    name: 'Groove Barbers',
    slug: 'groove-barbers',
    tagline: 'Fresh cuts. Real culture.',
    description: 'Manchester\'s go-to barbershop for the freshest fades and sharpest lineups. Groove Barbers is where culture meets craftsmanship in the heart of the Northern Quarter. Walk in as you are, leave as you want to be.',
    type: 'barbershop',
    coverImage: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80',
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80',
    ],
    rating: 4.7,
    reviewCount: 228,
    locations: [locations[2]],
    primaryLocationId: 'loc-3',
    amenities: ['Free WiFi', 'Urban Vibe', 'Premium Products', 'Walk-ins Welcome'],
    policies: {
      cancellationPolicy: 'Cancel 1 hour before your appointment. Repeated no-shows may affect future booking privileges.',
      depositRequired: false,
      depositAmount: 0,
      bookingLeadTimeHours: 0,
      maxAdvanceBookingDays: 30,
      bufferTimeMins: 5,
    },
    isVerified: true,
    isFeatured: false,
    createdAt: '2023-03-10T00:00:00Z',
  },
];

// ─── SERVICE ADD-ONS ─────────────────────────────────────────────
export const serviceAddons: ServiceAddon[] = [
  { id: 'addon-1', name: 'Beard Trim', description: 'Precision beard shaping and trim', price: 10, durationMins: 15 },
  { id: 'addon-2', name: 'Hot Towel Treatment', description: 'Relaxing hot towel facial treatment', price: 8, durationMins: 10 },
  { id: 'addon-3', name: 'Hair Wash', description: 'Shampoo and conditioning treatment', price: 7, durationMins: 10 },
  { id: 'addon-4', name: 'Premium Styling', description: 'Styled and finished with premium products', price: 12, durationMins: 15 },
  { id: 'addon-5', name: 'Scalp Massage', description: 'Relaxing 10-minute scalp massage', price: 10, durationMins: 10 },
  { id: 'addon-6', name: 'Eyebrow Tidy', description: 'Clean and shape eyebrows', price: 6, durationMins: 10 },
  { id: 'addon-7', name: 'Face Massage', description: 'Revitalising facial massage', price: 15, durationMins: 15 },
  { id: 'addon-8', name: 'Deep Conditioning', description: 'Intensive hair conditioning treatment', price: 18, durationMins: 20 },
];

// ─── SERVICES ───────────────────────────────────────────────────
export const services: Service[] = [
  // --- The Gentlemen's House ---
  {
    id: 'svc-1', businessId: 'biz-1', name: 'Classic Haircut', description: 'A timeless cut tailored to your style. Includes consultation, cut, and finish.',
    category: 'haircuts', durationMins: 30, price: 28, addons: [serviceAddons[0], serviceAddons[2], serviceAddons[3]],
    staffIds: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 1, tags: ['popular', 'classic'],
  },
  {
    id: 'svc-2', businessId: 'biz-1', name: 'Fade Haircut', description: 'Expert fade technique from skin to your desired length, clean and sharp.',
    category: 'fades', durationMins: 40, price: 34, addons: [serviceAddons[0], serviceAddons[2]],
    staffIds: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 2, tags: ['popular', 'fade'],
  },
  {
    id: 'svc-3', businessId: 'biz-1', name: 'Skin Fade', description: 'Ultra-close skin fade with expert blending. Our most requested style.',
    category: 'fades', durationMins: 45, price: 38, addons: [serviceAddons[0], serviceAddons[1]],
    staffIds: ['staff-1', 'staff-2', 'staff-3'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 3, tags: ['trending', 'fade'],
  },
  {
    id: 'svc-4', businessId: 'biz-1', name: 'Buzz Cut', description: 'Clean and precise buzz cut with perfect uniformity.',
    category: 'haircuts', durationMins: 20, price: 20, addons: [],
    staffIds: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5'], isActive: true, isFeatured: false, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 4, tags: ['quick'],
  },
  {
    id: 'svc-5', businessId: 'biz-1', name: 'Beard Trim', description: 'Expert beard shaping, trimming, and definition with hot towel finish.',
    category: 'beard', durationMins: 20, price: 18, addons: [serviceAddons[1]],
    staffIds: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5'], isActive: true, isFeatured: false, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 5, tags: [],
  },
  {
    id: 'svc-6', businessId: 'biz-1', name: 'Hot Towel Shave', description: 'Traditional straight razor shave with hot towel, shave cream and post-shave treatment.',
    category: 'shaving', durationMins: 45, price: 42, addons: [serviceAddons[4], serviceAddons[6]],
    staffIds: ['staff-1', 'staff-2', 'staff-3'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 6, tags: ['premium', 'traditional'],
  },
  {
    id: 'svc-7', businessId: 'biz-1', name: 'Haircut + Beard Combo', description: 'Full haircut service combined with expert beard trim. Best value combination.',
    category: 'packages', durationMins: 55, price: 42, addons: [serviceAddons[1], serviceAddons[3]],
    staffIds: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 7, tags: ['popular', 'combo', 'value'],
  },
  {
    id: 'svc-8', businessId: 'biz-1', name: 'Kids Haircut', description: 'Gentle, fun haircuts for children under 12. Patient barbers who love working with kids.',
    category: 'kids', durationMins: 20, price: 16, addons: [],
    staffIds: ['staff-1', 'staff-2', 'staff-4', 'staff-5'], isActive: true, isFeatured: false, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 8, tags: ['kids'],
  },
  {
    id: 'svc-9', businessId: 'biz-1', name: 'Senior Haircut', description: 'Tailored haircut service for seniors, with extra care and attention to detail.',
    category: 'haircuts', durationMins: 30, price: 20, addons: [],
    staffIds: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5'], isActive: true, isFeatured: false, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 9, tags: ['senior'],
  },
  {
    id: 'svc-10', businessId: 'biz-1', name: 'Premium Grooming Package', description: 'The ultimate grooming experience. Haircut + hot towel shave + beard trim + scalp massage + styling.',
    category: 'packages', durationMins: 90, price: 75, addons: [serviceAddons[4], serviceAddons[6]],
    staffIds: ['staff-1', 'staff-2', 'staff-3'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: true, depositAmount: 20, maxGroupSize: 1, orderIndex: 10, tags: ['premium', 'luxury'],
  },
  // --- Studio Luxe ---
  {
    id: 'svc-11', businessId: 'biz-2', name: 'Blowdry & Style', description: 'Professional blowdry and style for any occasion.',
    category: 'styling', durationMins: 45, price: 55, addons: [serviceAddons[7]],
    staffIds: ['staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 1, tags: ['popular'],
  },
  {
    id: 'svc-12', businessId: 'biz-2', name: 'Cut & Blowdry', description: 'Consultation, precision cut, and professional blowdry finish.',
    category: 'haircuts', durationMins: 75, price: 85, addons: [serviceAddons[7], serviceAddons[4]],
    staffIds: ['staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 2, tags: ['popular'],
  },
  {
    id: 'svc-13', businessId: 'biz-2', name: 'Full Highlights', description: 'Full head highlights with toner and style finish.',
    category: 'color', durationMins: 180, price: 180, addons: [serviceAddons[7]],
    staffIds: ['staff-6', 'staff-7', 'staff-8'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: true, depositAmount: 30, maxGroupSize: 1, orderIndex: 3, tags: ['colour'],
  },
  {
    id: 'svc-14', businessId: 'biz-2', name: 'Balayage', description: 'Natural sun-kissed balayage with expert blending and toning.',
    category: 'color', durationMins: 210, price: 220, addons: [serviceAddons[7]],
    staffIds: ['staff-6', 'staff-7'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: true, depositAmount: 40, maxGroupSize: 1, orderIndex: 4, tags: ['colour', 'luxury'],
  },
  // --- Groove Barbers ---
  {
    id: 'svc-15', businessId: 'biz-3', name: 'Fresh Fade', description: 'Crisp, clean fade with precision lineup. The Groove signature cut.',
    category: 'fades', durationMins: 35, price: 25, addons: [serviceAddons[0]],
    staffIds: ['staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 1, tags: ['popular', 'signature'],
  },
  {
    id: 'svc-16', businessId: 'biz-3', name: 'Lineup & Edge Up', description: 'Sharp lineup, edge up and shape up for a clean finish.',
    category: 'haircuts', durationMins: 20, price: 15, addons: [],
    staffIds: ['staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 2, tags: ['quick'],
  },
  {
    id: 'svc-17', businessId: 'biz-3', name: 'Full Barber Service', description: 'Haircut + beard + hot towel. The complete Groove experience.',
    category: 'packages', durationMins: 60, price: 40, addons: [serviceAddons[1], serviceAddons[4]],
    staffIds: ['staff-12', 'staff-13', 'staff-14'], isActive: true, isFeatured: true, isMemberOnly: false,
    requiresDeposit: false, depositAmount: 0, maxGroupSize: 1, orderIndex: 3, tags: ['combo'],
  },
];

// ─── STAFF ──────────────────────────────────────────────────────
export const staffMembers: StaffMember[] = [
  // Gentlemen's House
  {
    id: 'staff-1', businessId: 'biz-1', locationId: 'loc-1', userId: 'user-staff-1',
    firstName: 'Alex', lastName: 'Morrison', displayName: 'Alex',
    bio: 'With 12 years of experience, Alex is our master barber and the founder of The Gentlemen\'s House. Specialising in classic cuts and precision fades, he has built a loyal clientele who trust his expertise and attention to detail.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    specialties: ['Classic Cuts', 'Precision Fades', 'Skin Fades', 'Traditional Shaving'],
    serviceIds: ['svc-1', 'svc-2', 'svc-3', 'svc-4', 'svc-5', 'svc-6', 'svc-7', 'svc-9', 'svc-10'],
    rating: 4.9, reviewCount: 145,
    role: 'owner', commissionPercent: 100,
    workingHours: [
      { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 6, isOpen: false, openTime: '10:00', closeTime: '17:00' },
    ],
    isActive: true, isAcceptingBookings: true, orderIndex: 1, createdAt: '2022-01-15T00:00:00Z',
  },
  {
    id: 'staff-2', businessId: 'biz-1', locationId: 'loc-1', userId: 'user-staff-2',
    firstName: 'Daniel', lastName: 'Clarke', displayName: 'Daniel',
    bio: 'Daniel brings 8 years of barbering experience and a passion for modern styles. His specialty in skin fades and creative designs has made him one of our most booked professionals.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    specialties: ['Skin Fades', 'Modern Styles', 'Hair Designs', 'Beard Sculpting'],
    serviceIds: ['svc-1', 'svc-2', 'svc-3', 'svc-4', 'svc-5', 'svc-6', 'svc-7', 'svc-10'],
    rating: 4.8, reviewCount: 112,
    role: 'stylist', commissionPercent: 60,
    workingHours: defaultWorkingHours,
    isActive: true, isAcceptingBookings: true, orderIndex: 2, createdAt: '2022-03-01T00:00:00Z',
  },
  {
    id: 'staff-3', businessId: 'biz-1', locationId: 'loc-1', userId: 'user-staff-3',
    firstName: 'Mark', lastName: 'Thompson', displayName: 'Mark',
    bio: 'Mark is a classically trained barber who has honed his craft in London\'s top barbershops before joining us. His calm demeanour and precision work make every client feel at ease.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    specialties: ['Classic Cuts', 'Hot Towel Shaves', 'Beard Work', 'Razor Techniques'],
    serviceIds: ['svc-1', 'svc-2', 'svc-3', 'svc-5', 'svc-6', 'svc-7', 'svc-10'],
    rating: 4.9, reviewCount: 98,
    role: 'stylist', commissionPercent: 60,
    workingHours: [
      { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 1, isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 3, isOpen: false, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '18:00' },
    ],
    isActive: true, isAcceptingBookings: true, orderIndex: 3, createdAt: '2022-06-01T00:00:00Z',
  },
  {
    id: 'staff-4', businessId: 'biz-1', locationId: 'loc-1', userId: 'user-staff-4',
    firstName: 'Ryan', lastName: 'Patel', displayName: 'Ryan',
    bio: 'Ryan specialises in textured hair and multicultural grooming. With training across the UK and internationally, he brings a unique versatility to the shop.',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&q=80',
    specialties: ['Textured Hair', 'Fades', 'Kids Cuts', 'Multi-cultural Grooming'],
    serviceIds: ['svc-1', 'svc-2', 'svc-4', 'svc-5', 'svc-7', 'svc-8', 'svc-9'],
    rating: 4.7, reviewCount: 67,
    role: 'stylist', commissionPercent: 55,
    workingHours: defaultWorkingHours,
    isActive: true, isAcceptingBookings: true, orderIndex: 4, createdAt: '2023-01-10T00:00:00Z',
  },
  {
    id: 'staff-5', businessId: 'biz-1', locationId: 'loc-1', userId: 'user-staff-5',
    firstName: 'Ethan', lastName: 'Walsh', displayName: 'Ethan',
    bio: 'Ethan is our newest addition, bringing fresh perspectives and the latest trending styles. Young, passionate, and always on point with modern grooming trends.',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&q=80',
    specialties: ['Modern Cuts', 'Fades', 'Kids Cuts', 'Styling'],
    serviceIds: ['svc-1', 'svc-2', 'svc-4', 'svc-5', 'svc-7', 'svc-8', 'svc-9'],
    rating: 4.6, reviewCount: 43,
    role: 'stylist', commissionPercent: 50,
    workingHours: defaultWorkingHours,
    isActive: true, isAcceptingBookings: true, orderIndex: 5, createdAt: '2024-02-01T00:00:00Z',
  },
  // Studio Luxe
  {
    id: 'staff-6', businessId: 'biz-2', locationId: 'loc-2', userId: 'user-staff-6',
    firstName: 'Sophia', lastName: 'Laurent', displayName: 'Sophia',
    bio: 'Head stylist and creative director at Studio Luxe. Paris-trained with 15 years of experience working with celebrities and high-profile clients.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    specialties: ['Balayage', 'Colour', 'Avant-garde Styling', 'Cuts'],
    serviceIds: ['svc-11', 'svc-12', 'svc-13', 'svc-14'],
    rating: 5.0, reviewCount: 203,
    role: 'stylist', commissionPercent: 70,
    workingHours: defaultWorkingHours,
    isActive: true, isAcceptingBookings: true, orderIndex: 1, createdAt: '2021-06-01T00:00:00Z',
  },
  {
    id: 'staff-7', businessId: 'biz-2', locationId: 'loc-2', userId: 'user-staff-7',
    firstName: 'James', lastName: 'O\'Brien', displayName: 'James',
    bio: 'Colour specialist with a background in editorial and fashion shows. James brings artistic sensibility to every appointment.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    specialties: ['Colour', 'Balayage', 'Highlights', 'Cuts'],
    serviceIds: ['svc-11', 'svc-12', 'svc-13', 'svc-14'],
    rating: 4.9, reviewCount: 178,
    role: 'stylist', commissionPercent: 65,
    workingHours: defaultWorkingHours,
    isActive: true, isAcceptingBookings: true, orderIndex: 2, createdAt: '2021-09-01T00:00:00Z',
  },
  // Groove Barbers
  {
    id: 'staff-12', businessId: 'biz-3', locationId: 'loc-3', userId: 'user-staff-12',
    firstName: 'Jordan', lastName: 'Banks', displayName: 'Jordan',
    bio: 'Jordan founded Groove Barbers with a vision to bring authentic barbering culture to Manchester. Known for the freshest fades in the north.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&q=80',
    specialties: ['Fades', 'Tapers', 'Lineups', 'Natural Hair'],
    serviceIds: ['svc-15', 'svc-16', 'svc-17'],
    rating: 4.8, reviewCount: 134,
    role: 'owner', commissionPercent: 100,
    workingHours: defaultWorkingHours,
    isActive: true, isAcceptingBookings: true, orderIndex: 1, createdAt: '2023-03-10T00:00:00Z',
  },
  {
    id: 'staff-13', businessId: 'biz-3', locationId: 'loc-3', userId: 'user-staff-13',
    firstName: 'Marcus', lastName: 'Reid', displayName: 'Marcus',
    bio: 'Marcus brings 7 years of experience and a love for all things grooming. His lineups are legendary in the NQ.',
    avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=200&q=80',
    specialties: ['Lineups', 'Fades', 'Beard Work'],
    serviceIds: ['svc-15', 'svc-16', 'svc-17'],
    rating: 4.7, reviewCount: 89,
    role: 'stylist', commissionPercent: 58,
    workingHours: defaultWorkingHours,
    isActive: true, isAcceptingBookings: true, orderIndex: 2, createdAt: '2023-03-10T00:00:00Z',
  },
];

// ─── CUSTOMERS ──────────────────────────────────────────────────
export const customers: Customer[] = [
  { id: 'cust-1', businessId: 'biz-1', firstName: 'James', lastName: 'Harrison', email: 'james.harrison@email.com', phone: '+44 7700 123456', notes: 'Prefers a low fade. Allergic to some synthetic fragrances.', preferences: ['Fade haircut', 'Beard trim'], importantNotes: 'Uses fragrance-free products only', tags: ['loyal', 'vip'], favoriteStaffId: 'staff-1', totalSpend: 684, visitCount: 24, noShowCount: 0, cancellationCount: 1, lastVisit: '2026-08-28T10:00:00Z', loyaltyPoints: 240, isActive: true, createdAt: '2022-04-01T00:00:00Z' },
  { id: 'cust-2', businessId: 'biz-1', firstName: 'Oliver', lastName: 'Marsh', email: 'o.marsh@email.com', phone: '+44 7700 234567', notes: 'Likes a classic side parting.', preferences: ['Classic haircut'], importantNotes: '', tags: ['loyal'], favoriteStaffId: 'staff-2', totalSpend: 392, visitCount: 14, noShowCount: 0, cancellationCount: 0, lastVisit: '2026-09-01T11:00:00Z', loyaltyPoints: 140, isActive: true, createdAt: '2022-08-15T00:00:00Z' },
  { id: 'cust-3', businessId: 'biz-1', firstName: 'William', lastName: 'Foster', email: 'wfoster@email.com', phone: '+44 7700 345678', notes: 'Skin fade on back and sides, longer on top.', preferences: ['Skin fade', 'Beard trim'], importantNotes: '', tags: [], favoriteStaffId: 'staff-3', totalSpend: 290, visitCount: 10, noShowCount: 1, cancellationCount: 2, lastVisit: '2026-07-15T14:00:00Z', loyaltyPoints: 100, isActive: true, createdAt: '2023-01-20T00:00:00Z' },
  { id: 'cust-4', businessId: 'biz-1', firstName: 'Benjamin', lastName: 'Cole', email: 'ben.cole@email.com', phone: '+44 7700 456789', notes: '', preferences: ['Premium package'], importantNotes: 'VIP client', tags: ['vip', 'premium'], favoriteStaffId: 'staff-1', totalSpend: 1240, visitCount: 18, noShowCount: 0, cancellationCount: 0, lastVisit: '2026-09-05T09:00:00Z', loyaltyPoints: 370, isActive: true, createdAt: '2022-02-10T00:00:00Z' },
  { id: 'cust-5', businessId: 'biz-1', firstName: 'Liam', lastName: 'Nash', email: 'liam.nash@email.com', phone: '+44 7700 567890', notes: 'First timer. Recommended by James Harrison.', preferences: [], importantNotes: '', tags: ['new'], favoriteStaffId: undefined, totalSpend: 34, visitCount: 1, noShowCount: 0, cancellationCount: 0, lastVisit: '2026-09-08T10:00:00Z', loyaltyPoints: 10, isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 'cust-6', businessId: 'biz-1', firstName: 'Noah', lastName: 'Price', email: 'noah.price@email.com', phone: '+44 7700 678901', notes: '', preferences: ['Fade'], importantNotes: '', tags: [], totalSpend: 170, visitCount: 6, noShowCount: 0, cancellationCount: 1, lastVisit: '2026-08-10T15:00:00Z', loyaltyPoints: 60, isActive: true, createdAt: '2023-05-01T00:00:00Z' },
  { id: 'cust-7', businessId: 'biz-1', firstName: 'Charlie', lastName: 'Webb', email: 'charlie.webb@email.com', phone: '+44 7700 789012', notes: '', preferences: ['Kids haircut'], importantNotes: '', tags: ['kids-parent'], totalSpend: 96, visitCount: 6, noShowCount: 0, cancellationCount: 0, lastVisit: '2026-08-20T11:00:00Z', loyaltyPoints: 30, isActive: true, createdAt: '2023-08-01T00:00:00Z' },
  { id: 'cust-8', businessId: 'biz-1', firstName: 'Harry', lastName: 'Stone', email: 'hstone@email.com', phone: '+44 7700 890123', notes: 'Wants a clean look for work.', preferences: ['Classic cut'], importantNotes: '', tags: [], totalSpend: 224, visitCount: 8, noShowCount: 2, cancellationCount: 1, lastVisit: '2026-07-01T10:00:00Z', loyaltyPoints: 80, isActive: true, createdAt: '2022-11-01T00:00:00Z' },
];

// ─── APPOINTMENTS ────────────────────────────────────────────────
const today = new Date();
const formatDate = (daysOffset: number, hour: number, min = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

export const appointments: Appointment[] = [
  { id: 'apt-1', businessId: 'biz-1', locationId: 'loc-1', customerId: 'cust-1', type: 'individual', participants: [{ id: 'p-1', appointmentId: 'apt-1', personName: 'James Harrison', serviceId: 'svc-2', staffId: 'staff-1', addonIds: ['addon-1'], startTime: formatDate(0, 10), durationMins: 55, price: 44, notes: '' }], status: 'confirmed', paymentStatus: 'unpaid', totalPrice: 44, depositAmount: 0, discountAmount: 0, bookingSource: 'online', reminderSent: true, reviewRequested: false, createdAt: formatDate(-2, 9), updatedAt: formatDate(-1, 12) },
  { id: 'apt-2', businessId: 'biz-1', locationId: 'loc-1', customerId: 'cust-2', type: 'individual', participants: [{ id: 'p-2', appointmentId: 'apt-2', personName: 'Oliver Marsh', serviceId: 'svc-1', staffId: 'staff-2', addonIds: [], startTime: formatDate(0, 11), durationMins: 30, price: 28, notes: '' }], status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'card', totalPrice: 28, depositAmount: 0, discountAmount: 0, bookingSource: 'online', reminderSent: true, reviewRequested: false, createdAt: formatDate(-3, 10), updatedAt: formatDate(-1, 12) },
  { id: 'apt-3', businessId: 'biz-1', locationId: 'loc-1', customerId: 'cust-4', type: 'individual', participants: [{ id: 'p-3', appointmentId: 'apt-3', personName: 'Benjamin Cole', serviceId: 'svc-10', staffId: 'staff-1', addonIds: ['addon-5', 'addon-7'], startTime: formatDate(0, 14), durationMins: 105, price: 100, notes: 'Returning VIP client' }], status: 'pending', paymentStatus: 'deposit_paid', paymentMethod: 'card', totalPrice: 100, depositAmount: 15, discountAmount: 0, bookingSource: 'online', reminderSent: false, reviewRequested: false, createdAt: formatDate(-1, 9), updatedAt: formatDate(-1, 9) },
  { id: 'apt-4', businessId: 'biz-1', locationId: 'loc-1', customerId: 'cust-3', type: 'individual', participants: [{ id: 'p-4', appointmentId: 'apt-4', personName: 'William Foster', serviceId: 'svc-3', staffId: 'staff-3', addonIds: ['addon-2'], startTime: formatDate(1, 9), durationMins: 55, price: 46, notes: '' }], status: 'confirmed', paymentStatus: 'unpaid', totalPrice: 46, depositAmount: 0, discountAmount: 0, bookingSource: 'online', reminderSent: false, reviewRequested: false, createdAt: formatDate(-4, 14), updatedAt: formatDate(-4, 14) },
  { id: 'apt-5', businessId: 'biz-1', locationId: 'loc-1', customerId: 'cust-6', type: 'individual', participants: [{ id: 'p-5', appointmentId: 'apt-5', personName: 'Noah Price', serviceId: 'svc-2', staffId: 'staff-2', addonIds: [], startTime: formatDate(1, 11, 30), durationMins: 40, price: 34, notes: '' }], status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'card', totalPrice: 34, depositAmount: 0, discountAmount: 0, bookingSource: 'online', reminderSent: false, reviewRequested: false, createdAt: formatDate(-2, 16), updatedAt: formatDate(-2, 16) },
  { id: 'apt-6', businessId: 'biz-1', locationId: 'loc-1', customerId: 'cust-5', type: 'individual', participants: [{ id: 'p-6', appointmentId: 'apt-6', personName: 'Liam Nash', serviceId: 'svc-1', staffId: 'staff-4', addonIds: [], startTime: formatDate(2, 10), durationMins: 30, price: 28, notes: 'New client' }], status: 'confirmed', paymentStatus: 'unpaid', totalPrice: 28, depositAmount: 0, discountAmount: 0, bookingSource: 'online', reminderSent: false, reviewRequested: false, createdAt: formatDate(-1, 12), updatedAt: formatDate(-1, 12) },
  { id: 'apt-7', businessId: 'biz-1', locationId: 'loc-1', customerId: 'cust-1', type: 'individual', participants: [{ id: 'p-7', appointmentId: 'apt-7', personName: 'James Harrison', serviceId: 'svc-7', staffId: 'staff-1', addonIds: ['addon-2'], startTime: formatDate(-7, 10), durationMins: 65, price: 50, notes: '' }], status: 'completed', paymentStatus: 'paid', paymentMethod: 'card', totalPrice: 50, depositAmount: 0, discountAmount: 0, bookingSource: 'online', reminderSent: true, reviewRequested: true, createdAt: formatDate(-14, 9), updatedAt: formatDate(-7, 11) },
  { id: 'apt-8', businessId: 'biz-1', locationId: 'loc-1', customerId: 'cust-4', type: 'individual', participants: [{ id: 'p-8', appointmentId: 'apt-8', personName: 'Benjamin Cole', serviceId: 'svc-10', staffId: 'staff-1', addonIds: [], startTime: formatDate(-14, 9), durationMins: 90, price: 75, notes: '' }], status: 'completed', paymentStatus: 'paid', paymentMethod: 'card', totalPrice: 75, depositAmount: 0, discountAmount: 0, bookingSource: 'online', reminderSent: true, reviewRequested: true, createdAt: formatDate(-21, 10), updatedAt: formatDate(-14, 11) },
  { id: 'apt-9', businessId: 'biz-1', locationId: 'loc-1', customerId: 'cust-8', type: 'individual', participants: [{ id: 'p-9', appointmentId: 'apt-9', personName: 'Harry Stone', serviceId: 'svc-1', staffId: 'staff-5', addonIds: [], startTime: formatDate(-3, 14), durationMins: 30, price: 28, notes: '' }], status: 'no_show', paymentStatus: 'unpaid', totalPrice: 28, depositAmount: 0, discountAmount: 0, bookingSource: 'online', reminderSent: true, reviewRequested: false, createdAt: formatDate(-10, 9), updatedAt: formatDate(-3, 14) },
  { id: 'apt-10', businessId: 'biz-1', locationId: 'loc-1', customerId: 'cust-7', type: 'individual', participants: [{ id: 'p-10', appointmentId: 'apt-10', personName: 'Charlie Webb', serviceId: 'svc-8', staffId: 'staff-4', addonIds: [], startTime: formatDate(3, 11), durationMins: 20, price: 16, notes: 'Bringing his son for first haircut' }], status: 'confirmed', paymentStatus: 'unpaid', totalPrice: 16, depositAmount: 0, discountAmount: 0, bookingSource: 'phone', reminderSent: false, reviewRequested: false, createdAt: formatDate(-1, 18), updatedAt: formatDate(-1, 18) },
];

// ─── REVIEWS ────────────────────────────────────────────────────
export const reviews: Review[] = [
  { id: 'rev-1', businessId: 'biz-1', appointmentId: 'apt-7', customerId: 'cust-1', staffId: 'staff-1', overallRating: 5, serviceRating: 5, professionalRating: 5, comment: 'Alex is simply the best barber I\'ve ever been to. The attention to detail is incredible. The Gentlemen\'s House has a brilliant atmosphere and I always leave feeling a million dollars.', isVerified: true, createdAt: formatDate(-6, 15) },
  { id: 'rev-2', businessId: 'biz-1', appointmentId: 'apt-8', customerId: 'cust-4', staffId: 'staff-1', overallRating: 5, serviceRating: 5, professionalRating: 5, comment: 'The Premium Grooming Package is absolutely worth every penny. From the consultation to the final finish, it\'s a world-class experience. Alex takes real pride in his work.', ownerReply: 'Thank you so much Benjamin! We always look forward to seeing you. See you in a few weeks!', ownerReplyAt: formatDate(-12, 10), isVerified: true, createdAt: formatDate(-13, 16) },
  { id: 'rev-3', businessId: 'biz-1', appointmentId: 'apt-7', customerId: 'cust-2', staffId: 'staff-2', overallRating: 5, serviceRating: 5, professionalRating: 5, comment: 'Daniel is a true artist with scissors. My haircut always looks perfect for weeks after. Wouldn\'t go anywhere else.', isVerified: true, createdAt: formatDate(-20, 11) },
  { id: 'rev-4', businessId: 'biz-1', appointmentId: 'apt-7', customerId: 'cust-3', staffId: 'staff-3', overallRating: 4, serviceRating: 4, professionalRating: 5, comment: 'Mark gives a fantastic skin fade. Had to wait a few minutes past my appointment but overall excellent service and a great result.', isVerified: true, createdAt: formatDate(-30, 14) },
  { id: 'rev-5', businessId: 'biz-2', appointmentId: 'apt-7', customerId: 'cust-2', staffId: 'staff-6', overallRating: 5, serviceRating: 5, professionalRating: 5, comment: 'Sophia is simply extraordinary. The best balayage I\'ve ever had. Studio Luxe truly lives up to its name — a genuinely luxurious experience.', isVerified: true, createdAt: formatDate(-15, 13) },
];

// ─── PRODUCTS ───────────────────────────────────────────────────
export const products: Product[] = [
  { id: 'prod-1', businessId: 'biz-1', name: 'American Crew Pomade', description: 'Strong hold, high shine. Classic styling pomade.', sku: 'AC-POM-100', category: 'styling', brand: 'American Crew', supplier: 'Salons Direct', costPrice: 6.50, sellingPrice: 14.99, stockQuantity: 24, lowStockThreshold: 5, isActive: true, tags: ['styling', 'hold'], createdAt: '2022-01-15T00:00:00Z' },
  { id: 'prod-2', businessId: 'biz-1', name: 'Blind Barber 90 Proof Wax', description: 'Medium hold, low shine. Perfect for textured styles.', sku: 'BB-WAX-60', category: 'styling', brand: 'Blind Barber', supplier: 'Salons Direct', costPrice: 8.00, sellingPrice: 18.99, stockQuantity: 12, lowStockThreshold: 4, isActive: true, tags: ['styling', 'texture'], createdAt: '2022-01-15T00:00:00Z' },
  { id: 'prod-3', businessId: 'biz-1', name: 'Proraso Shaving Cream', description: 'Traditional Italian shaving cream with eucalyptus.', sku: 'PRO-SHAVE-150', category: 'shaving', brand: 'Proraso', supplier: 'Proraso UK', costPrice: 5.00, sellingPrice: 12.99, stockQuantity: 18, lowStockThreshold: 6, isActive: true, tags: ['shaving', 'traditional'], createdAt: '2022-01-15T00:00:00Z' },
  { id: 'prod-4', businessId: 'biz-1', name: 'Beardbrand Tea Tree Beard Oil', description: 'Moisturising beard oil with a woody scent.', sku: 'BB-OIL-30', category: 'beard', brand: 'Beardbrand', supplier: 'Beardbrand EU', costPrice: 10.00, sellingPrice: 24.99, stockQuantity: 8, lowStockThreshold: 3, isActive: true, tags: ['beard', 'oil'], createdAt: '2022-01-15T00:00:00Z' },
  { id: 'prod-5', businessId: 'biz-1', name: 'Kevin Murphy Rough Rider', description: 'Matt texture paste for piecey, textured styles.', sku: 'KM-RR-100', category: 'styling', brand: 'Kevin Murphy', supplier: 'Kevin Murphy UK', costPrice: 12.00, sellingPrice: 28.99, stockQuantity: 3, lowStockThreshold: 4, isActive: true, tags: ['styling', 'texture', 'low-stock'], createdAt: '2022-01-15T00:00:00Z' },
  { id: 'prod-6', businessId: 'biz-1', name: 'Baxter of California Clay Pomade', description: 'Medium hold, matte finish. All-day styling.', sku: 'BOC-CLAY-60', category: 'styling', brand: 'Baxter of California', supplier: 'Salons Direct', costPrice: 9.00, sellingPrice: 22.00, stockQuantity: 15, lowStockThreshold: 5, isActive: true, tags: ['styling'], createdAt: '2022-06-01T00:00:00Z' },
];

// ─── GIFT CARDS ──────────────────────────────────────────────────
export const giftCards: GiftCard[] = [
  { id: 'gc-1', businessId: 'biz-1', code: 'TRIM-GC-A7F2', initialBalance: 50, currentBalance: 50, purchasedByCustomerId: 'cust-4', recipientName: 'Tom Harrison', recipientEmail: 'tom@email.com', message: 'Happy Birthday! Enjoy a treat at The Gentlemen\'s House.', status: 'active', purchasedAt: formatDate(-5, 10), transactions: [] },
  { id: 'gc-2', businessId: 'biz-1', code: 'TRIM-GC-B3K9', initialBalance: 100, currentBalance: 42.50, purchasedByCustomerId: 'cust-1', recipientName: 'Dad', recipientEmail: 'dad@email.com', message: 'Father\'s Day treat!', status: 'active', purchasedAt: formatDate(-60, 14), transactions: [{ amount: 57.50, date: formatDate(-30, 10) }] },
  { id: 'gc-3', businessId: 'biz-1', code: 'TRIM-GC-C1M5', initialBalance: 25, currentBalance: 0, purchasedByCustomerId: 'cust-2', recipientName: 'Self', recipientEmail: 'o.marsh@email.com', status: 'redeemed', purchasedAt: formatDate(-90, 10), transactions: [{ amount: 25, date: formatDate(-45, 11) }] },
];

// ─── LOYALTY ACCOUNTS ────────────────────────────────────────────
export const loyaltyAccounts: LoyaltyAccount[] = [
  { id: 'la-1', customerId: 'cust-1', businessId: 'biz-1', points: 240, totalPointsEarned: 270, totalPointsRedeemed: 30, tier: 'gold', transactions: [{ id: 'lt-1', type: 'earn', points: 44, description: 'Appointment: Fade + Beard', createdAt: formatDate(-7, 11) }, { id: 'lt-2', type: 'earn', points: 50, description: 'Appointment: Haircut + Beard', createdAt: formatDate(-21, 11) }], createdAt: '2022-04-01T00:00:00Z' },
  { id: 'la-2', customerId: 'cust-4', businessId: 'biz-1', points: 370, totalPointsEarned: 400, totalPointsRedeemed: 30, tier: 'platinum', transactions: [{ id: 'lt-3', type: 'earn', points: 75, description: 'Premium Package', createdAt: formatDate(-14, 10) }], createdAt: '2022-02-10T00:00:00Z' },
  { id: 'la-3', customerId: 'cust-2', businessId: 'biz-1', points: 140, totalPointsEarned: 165, totalPointsRedeemed: 25, tier: 'silver', transactions: [], createdAt: '2022-08-15T00:00:00Z' },
];

// ─── MEMBERSHIP PLANS ────────────────────────────────────────────
export const membershipPlans: MembershipPlan[] = [
  { id: 'plan-1', businessId: 'biz-1', name: 'Essential', description: 'Perfect for regular visits', monthlyPrice: 30, includedServices: [{ serviceId: 'svc-1', quantity: 2 }], discountPercent: 10, hasPriorityBooking: false, perks: ['2 classic haircuts/month', '10% off all services', 'Loyalty bonus points'], isActive: true },
  { id: 'plan-2', businessId: 'biz-1', name: 'Premium', description: 'For the discerning gentleman', monthlyPrice: 55, includedServices: [{ serviceId: 'svc-7', quantity: 2 }], discountPercent: 15, hasPriorityBooking: true, perks: ['2 haircut + beard combos/month', '15% off all services', 'Priority booking', 'Double loyalty points', 'Free beard oil'], isActive: true },
  { id: 'plan-3', businessId: 'biz-1', name: 'VIP', description: 'The ultimate membership experience', monthlyPrice: 90, includedServices: [{ serviceId: 'svc-10', quantity: 1 }, { serviceId: 'svc-7', quantity: 1 }], discountPercent: 20, hasPriorityBooking: true, perks: ['1 premium package + 1 combo/month', '20% off all services', 'First priority booking', 'Triple loyalty points', 'Free product every month', 'Dedicated barber'], isActive: true },
];

// ─── PROMO CODES ─────────────────────────────────────────────────
export const promoCodes: PromoCode[] = [
  { id: 'promo-1', businessId: 'biz-1', code: 'WELCOME20', discountType: 'percentage', discountValue: 20, minimumSpend: 25, maxUses: 100, usedCount: 23, startDate: '2026-01-01T00:00:00Z', isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'promo-2', businessId: 'biz-1', code: 'GENTS10', discountType: 'fixed', discountValue: 10, minimumSpend: 30, maxUses: 50, usedCount: 12, startDate: '2026-06-01T00:00:00Z', endDate: '2026-12-31T00:00:00Z', isActive: true, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'promo-3', businessId: 'biz-1', code: 'LUXE25', discountType: 'percentage', discountValue: 25, minimumSpend: 60, maxUses: 20, usedCount: 7, eligibleServiceIds: ['svc-10'], startDate: '2026-09-01T00:00:00Z', endDate: '2026-09-30T00:00:00Z', isActive: true, createdAt: '2026-09-01T00:00:00Z' },
];

// ─── CAMPAIGNS ───────────────────────────────────────────────────
export const campaigns: Campaign[] = [
  { id: 'camp-1', businessId: 'biz-1', name: 'September Re-engagement', type: 'email', status: 'sent', subject: 'We miss you — Book your next visit', content: 'Hi {name}, it\'s been a while! Come back and enjoy 15% off your next appointment.', targetSegment: 'inactive', sentAt: formatDate(-3, 10), stats: { sent: 45, delivered: 44, opened: 28, clicked: 12, bookingsGenerated: 6, revenueGenerated: 228 }, createdAt: formatDate(-7, 9) },
  { id: 'camp-2', businessId: 'biz-1', name: 'Birthday Rewards', type: 'sms', status: 'scheduled', content: 'Happy Birthday from The Gentlemen\'s House! Enjoy a complimentary beard trim on your birthday month. Book now.', targetSegment: 'all', scheduledAt: formatDate(1, 9), stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bookingsGenerated: 0, revenueGenerated: 0 }, createdAt: formatDate(-1, 14) },
];

export const notifications: Notification[] = [
  { id: 'notif-1', userId: 'user-cust-1', type: 'booking_confirmed', title: 'Booking Confirmed', message: 'Your appointment with Alex at 10:00 AM today is confirmed.', isRead: false, actionUrl: '/account/appointments', createdAt: formatDate(-1, 12) },
  { id: 'notif-2', userId: 'user-cust-1', type: 'booking_reminder', title: 'Appointment Reminder', message: 'Don\'t forget — you have an appointment tomorrow at 9:00 AM with Daniel.', isRead: false, createdAt: formatDate(0, 8) },
  { id: 'notif-3', userId: 'user-owner-1', type: 'low_inventory', title: 'Low Stock Alert', message: 'Kevin Murphy Rough Rider is running low (3 units remaining).', isRead: false, actionUrl: '/business-dashboard/inventory', createdAt: formatDate(0, 7) },
];
