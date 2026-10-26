import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';
import {
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
  requireTenantAccess,
  bookingRateLimiter,
  sanitizeString,
  AuthenticatedRequest,
} from '../middleware/security';

const router = Router();

const SELECT_APPOINTMENT_FIELDS = `
  id,
  business_id as "businessId",
  location_id as "locationId",
  customer_id as "customerId",
  customer_email as "customerEmail",
  customer_phone as "customerPhone",
  booking_ref as "bookingRef",
  type,
  COALESCE(participants, '[]'::jsonb) as participants,
  status,
  payment_status as "paymentStatus",
  payment_method as "paymentMethod",
  total_price::float as "totalPrice",
  deposit_amount::float as "depositAmount",
  discount_amount::float as "discountAmount",
  notes,
  booking_source as "bookingSource",
  reminder_sent as "reminderSent",
  review_requested as "reviewRequested",
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

// GET /api/bookings (OWASP A01: Protected Staff View)
router.get(
  '/',
  authenticateToken,
  requireRole(['super_admin', 'owner', 'manager', 'stylist', 'receptionist']),
  requireTenantAccess,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!isDbConfigured()) {
        return res.status(503).json({ error: 'Database not connected', dbConfigured: false });
      }

      const businessId = req.user?.role === 'super_admin'
        ? (req.query.businessId as string || 'trimora-salon')
        : (req.user?.businessId || 'trimora-salon');

      const { status, date, staffId, customerId, search } = req.query;

      let sqlText = `SELECT ${SELECT_APPOINTMENT_FIELDS} FROM appointments WHERE business_id = $1`;
      const params: any[] = [businessId];

      if (customerId) {
        params.push(customerId);
        sqlText += ` AND customer_id = $${params.length}`;
      }

      if (status) {
        params.push(status);
        sqlText += ` AND status = $${params.length}`;
      }

      if (date) {
        params.push(`${date}%`);
        sqlText += ` AND created_at::text LIKE $${params.length}`;
      }

      if (search) {
        const cleanSearch = sanitizeString(search);
        params.push(`%${cleanSearch}%`);
        sqlText += ` AND (
          booking_ref ILIKE $${params.length} OR 
          customer_email ILIKE $${params.length} OR 
          notes ILIKE $${params.length}
        )`;
      }

      sqlText += ` ORDER BY created_at DESC`;

      const appointments = await query(sqlText, params);
      return res.json(appointments);
    } catch (err: any) {
      console.error('Fetch appointments error:', err);
      return res.status(500).json({ error: 'Failed to retrieve appointments' });
    }
  }
);

// GET /api/bookings/:id
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const result = await query(
      `SELECT ${SELECT_APPOINTMENT_FIELDS} FROM appointments WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const apt = result[0];
    if (req.user?.role !== 'super_admin' && req.user?.businessId && apt.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Access denied: Appointment belongs to another salon' });
    }

    return res.json(apt);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve appointment' });
  }
});

// POST /api/bookings (OWASP A03 & A07: Public Booking with Anti-Spam Rate Limiter)
router.post('/', bookingRateLimiter, optionalAuthenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const {
      businessId = 'trimora-salon',
      locationId = 'trimora-loc-1',
      customerId = req.user?.id || 'guest',
      customerEmail,
      customerPhone,
      guestName,
      type = 'individual',
      participants,
      paymentMethod,
      totalPrice,
      depositAmount = 0,
      discountAmount = 0,
      notes = '',
      bookingSource = 'online',
    } = req.body;

    const aptId = `ta-apt-${Date.now()}`;
    const bookingRef = `TRM-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

    // Sanitize input values (OWASP A03)
    const cleanNotes = sanitizeString(notes);
    const cleanEmail = customerEmail ? sanitizeString(customerEmail) : (req.body.guestEmail ? sanitizeString(req.body.guestEmail) : null);
    const cleanPhone = customerPhone ? sanitizeString(customerPhone) : (req.body.guestPhone ? sanitizeString(req.body.guestPhone) : null);
    const cleanGuestName = guestName ? sanitizeString(guestName) : 'Guest';

    // Format participants if sent in flat booking form
    const formattedParticipants = participants || [
      {
        id: `tap-${Date.now()}`,
        appointmentId: aptId,
        personName: cleanGuestName,
        serviceId: req.body.serviceId,
        staffId: req.body.staffId,
        addonIds: req.body.addonIds || [],
        startTime: `${req.body.selectedDate}T${req.body.selectedTime}:00.000Z`,
        durationMins: req.body.durationMins || 45,
        price: totalPrice,
        notes: cleanNotes,
      },
    ];

    const status = 'confirmed';
    const paymentStatus = paymentMethod === 'cash' ? 'unpaid' : 'paid';

    await query(
      `INSERT INTO appointments (
        id, business_id, location_id, customer_id, customer_email, customer_phone, 
        booking_ref, type, participants, status, payment_status, payment_method, 
        total_price, deposit_amount, discount_amount, notes, booking_source
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        $7, $8, $9::jsonb, $10, $11, $12, 
        $13, $14, $15, $16, $17
      )`,
      [
        aptId,
        businessId,
        locationId,
        customerId,
        cleanEmail,
        cleanPhone,
        bookingRef,
        type,
        JSON.stringify(formattedParticipants),
        status,
        paymentStatus,
        paymentMethod || null,
        totalPrice || 0,
        depositAmount,
        discountAmount,
        cleanNotes,
        bookingSource,
      ]
    );

    const created = await query(`SELECT ${SELECT_APPOINTMENT_FIELDS} FROM appointments WHERE id = $1`, [aptId]);
    return res.status(201).json({ ...created[0], bookingRef });
  } catch (err: any) {
    console.error('Create booking error:', err);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PATCH /api/bookings/:id/status
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole(['super_admin', 'owner', 'manager', 'stylist', 'receptionist']),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!isDbConfigured()) {
        return res.status(503).json({ error: 'Database not connected' });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const existing = await query(`SELECT business_id as "businessId" FROM appointments WHERE id = $1`, [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      if (req.user?.role !== 'super_admin' && req.user?.businessId && existing[0].businessId !== req.user.businessId) {
        return res.status(403).json({ error: 'Access denied: Appointment belongs to another salon' });
      }

      const validStatuses = ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid appointment status' });
      }

      await query(`UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2`, [status, id]);
      const updated = await query(`SELECT ${SELECT_APPOINTMENT_FIELDS} FROM appointments WHERE id = $1`, [id]);

      return res.json(updated[0]);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update appointment status' });
    }
  }
);

// DELETE /api/bookings/:id
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['super_admin', 'owner', 'manager']),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!isDbConfigured()) {
        return res.status(503).json({ error: 'Database not connected' });
      }

      const { id } = req.params;
      const existing = await query(`SELECT business_id as "businessId" FROM appointments WHERE id = $1`, [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      if (req.user?.role !== 'super_admin' && req.user?.businessId && existing[0].businessId !== req.user.businessId) {
        return res.status(403).json({ error: 'Access denied: Appointment belongs to another salon' });
      }

      await query(`UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [id]);
      return res.json({ success: true, message: 'Appointment cancelled' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to cancel appointment' });
    }
  }
);

export default router;
