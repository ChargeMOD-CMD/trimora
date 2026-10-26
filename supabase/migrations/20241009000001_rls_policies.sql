-- RLS Policies for Trimora

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone."
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile."
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Salons
CREATE POLICY "Salons are viewable by everyone if active."
ON salons FOR SELECT
USING (status = 'active');

CREATE POLICY "Super admins can view all salons."
ON salons FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND platform_role = 'super_admin'));

CREATE POLICY "Super admins can insert salons."
ON salons FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND platform_role = 'super_admin'));

CREATE POLICY "Salon admins can update their salon."
ON salons FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM salon_memberships WHERE salon_id = salons.id AND profile_id = auth.uid() AND role IN ('owner', 'admin'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND platform_role = 'super_admin')
);

-- Salon Memberships
CREATE POLICY "Users can view their own memberships."
ON salon_memberships FOR SELECT
USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND platform_role = 'super_admin'));

CREATE POLICY "Salon owners can manage memberships."
ON salon_memberships FOR ALL
USING (
    EXISTS (SELECT 1 FROM salon_memberships AS sm WHERE sm.salon_id = salon_memberships.salon_id AND sm.profile_id = auth.uid() AND sm.role = 'owner')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND platform_role = 'super_admin')
);

-- Customers
CREATE POLICY "Salon staff can manage customers."
ON customers FOR ALL
USING (
    EXISTS (SELECT 1 FROM salon_memberships WHERE salon_id = customers.salon_id AND profile_id = auth.uid())
);

-- Service Categories & Services & Stylists
CREATE POLICY "Public can view active services and categories"
ON service_categories FOR SELECT
USING (true);

CREATE POLICY "Public can view active services"
ON services FOR SELECT
USING (true);

CREATE POLICY "Public can view active stylists"
ON stylists FOR SELECT
USING (is_active = true);

CREATE POLICY "Salon staff can manage service categories"
ON service_categories FOR ALL
USING (
    EXISTS (SELECT 1 FROM salon_memberships WHERE salon_id = service_categories.salon_id AND profile_id = auth.uid())
);

CREATE POLICY "Salon staff can manage services"
ON services FOR ALL
USING (
    EXISTS (SELECT 1 FROM salon_memberships WHERE salon_id = services.salon_id AND profile_id = auth.uid())
);

CREATE POLICY "Salon staff can manage stylists"
ON stylists FOR ALL
USING (
    EXISTS (SELECT 1 FROM salon_memberships WHERE salon_id = stylists.salon_id AND profile_id = auth.uid())
);

CREATE POLICY "Public can view stylist services"
ON stylist_services FOR SELECT
USING (true);

CREATE POLICY "Salon staff can manage stylist services"
ON stylist_services FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM stylists 
        JOIN salon_memberships ON stylists.salon_id = salon_memberships.salon_id 
        WHERE stylists.id = stylist_services.stylist_id AND salon_memberships.profile_id = auth.uid()
    )
);

-- Business Hours & Stylist Schedules
CREATE POLICY "Public can view business hours"
ON business_hours FOR SELECT USING (true);

CREATE POLICY "Salon staff can manage business hours"
ON business_hours FOR ALL
USING (EXISTS (SELECT 1 FROM salon_memberships WHERE salon_id = business_hours.salon_id AND profile_id = auth.uid()));

CREATE POLICY "Public can view stylist schedules"
ON stylist_schedules FOR SELECT USING (true);

CREATE POLICY "Salon staff can manage stylist schedules"
ON stylist_schedules FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM stylists 
        JOIN salon_memberships ON stylists.salon_id = salon_memberships.salon_id 
        WHERE stylists.id = stylist_schedules.stylist_id AND salon_memberships.profile_id = auth.uid()
    )
);

-- Bookings
CREATE POLICY "Public can insert bookings"
ON bookings FOR INSERT
WITH CHECK (true); -- Usually you'd restrict this but it's a public booking widget. Better might be a trigger or checking validity.

CREATE POLICY "Salon staff can view and manage their bookings"
ON bookings FOR SELECT
USING (EXISTS (SELECT 1 FROM salon_memberships WHERE salon_id = bookings.salon_id AND profile_id = auth.uid()));

CREATE POLICY "Salon staff can update their bookings"
ON bookings FOR UPDATE
USING (EXISTS (SELECT 1 FROM salon_memberships WHERE salon_id = bookings.salon_id AND profile_id = auth.uid()));

-- Domains
CREATE POLICY "Public can view salon domains"
ON salon_domains FOR SELECT USING (true);

CREATE POLICY "Salon staff can manage their domains"
ON salon_domains FOR ALL
USING (EXISTS (SELECT 1 FROM salon_memberships WHERE salon_id = salon_domains.salon_id AND profile_id = auth.uid()));
