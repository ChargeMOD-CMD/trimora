-- ============================================================
-- TRIMORA SALON MANAGEMENT — Neon Postgres Schema
-- ============================================================

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'customer', -- 'super_admin' | 'owner' | 'manager' | 'stylist' | 'receptionist' | 'customer'
  business_id VARCHAR(64),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SALONS (TENANTS)
CREATE TABLE IF NOT EXISTS salons (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postcode VARCHAR(50),
  country VARCHAR(100) DEFAULT 'UK',
  logo_url TEXT,
  cover_image TEXT,
  rating NUMERIC(3, 2) DEFAULT 4.9,
  review_count INTEGER DEFAULT 0,
  amenities JSONB DEFAULT '[]'::jsonb,
  working_hours JSONB DEFAULT '[]'::jsonb,
  cancellation_policy TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'active', -- 'active' | 'pending' | 'suspended'
  subscription_status VARCHAR(50) DEFAULT 'active', -- 'active' | 'trial' | 'past_due' | 'suspended'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SALON MEMBERSHIPS
CREATE TABLE IF NOT EXISTS salon_memberships (
  id VARCHAR(64) PRIMARY KEY,
  salon_id VARCHAR(64) NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(salon_id, user_id)
);

-- 4. SERVICES
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  duration_mins INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  addons JSONB DEFAULT '[]'::jsonb,
  staff_ids JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_member_only BOOLEAN DEFAULT false,
  requires_deposit BOOLEAN DEFAULT false,
  deposit_amount NUMERIC(10, 2) DEFAULT 0,
  max_group_size INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STYLISTS / STAFF
CREATE TABLE IF NOT EXISTS stylists (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  bio TEXT,
  avatar TEXT,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  service_ids JSONB DEFAULT '[]'::jsonb,
  working_hours JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_accepting_bookings BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  avatar TEXT,
  notes TEXT,
  total_spend NUMERIC(10, 2) DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, email)
);

-- 7. APPOINTMENTS / BOOKINGS
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  location_id VARCHAR(64) DEFAULT 'trimora-loc-1',
  customer_id VARCHAR(64),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  booking_ref VARCHAR(100),
  type VARCHAR(50) DEFAULT 'individual',
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'confirmed', -- 'pending' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  payment_status VARCHAR(50) DEFAULT 'unpaid', -- 'unpaid' | 'deposit_paid' | 'paid' | 'refunded' | 'partial'
  payment_method VARCHAR(50),
  total_price NUMERIC(10, 2) NOT NULL,
  deposit_amount NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  booking_source VARCHAR(50) DEFAULT 'online',
  reminder_sent BOOLEAN DEFAULT false,
  review_requested BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_avatar TEXT,
  staff_name VARCHAR(255),
  service_name VARCHAR(255),
  overall_rating NUMERIC(2, 1) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_business ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_salons_slug ON salons(slug);
CREATE INDEX IF NOT EXISTS idx_services_business ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_stylists_business ON stylists(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business ON appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
