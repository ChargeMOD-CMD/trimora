-- Initial Schema for Trimora Multi-Tenant SaaS

-- Enums
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'suspended', 'canceled');
CREATE TYPE salon_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'canceled', 'no_show');
CREATE TYPE platform_role AS ENUM ('super_admin', 'user');
CREATE TYPE salon_role AS ENUM ('owner', 'admin', 'stylist', 'receptionist');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    platform_role platform_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SALONS
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    logo_url TEXT,
    status salon_status DEFAULT 'pending',
    subscription_status subscription_status DEFAULT 'trial',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SALON MEMBERSHIPS
CREATE TABLE salon_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role salon_role DEFAULT 'owner',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, profile_id)
);

-- CUSTOMERS (Salon-scoped)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, email)
);

-- SERVICE CATEGORIES
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICES
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- duration in minutes
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STYLISTS
CREATE TABLE stylists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STYLIST SERVICES
CREATE TABLE stylist_services (
    stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (stylist_id, service_id)
);

-- BUSINESS HOURS
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    UNIQUE(salon_id, day_of_week)
);

-- STYLIST SCHEDULES
CREATE TABLE stylist_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    start_time TIME,
    end_time TIME,
    is_working BOOLEAN DEFAULT true,
    UNIQUE(stylist_id, day_of_week)
);

-- BOOKINGS
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    stylist_id UUID REFERENCES stylists(id) ON DELETE SET NULL,
    status booking_status DEFAULT 'pending',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SALON DOMAINS (For allowed website origins)
CREATE TABLE salon_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, domain)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylist_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_domains ENABLE ROW LEVEL SECURITY;
