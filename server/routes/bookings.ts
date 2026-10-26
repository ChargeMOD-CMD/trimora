import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';

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

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected', dbConfigured: false });
    }

    const {
      businessId = 'trimora-salon',
      status,
      date,
      staffId,
      customerId,
      search,
    } = req.query;

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
      sqlText += ` AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(participants) p 
        WHERE (p->>'startTime') LIKE $${params.length}
      )`;
    }

    if (staffId) {
      params.push(staffId);
      sqlText += ` AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(participants) p 
        WHERE p->>'staffId' = $${params.length}
      )`;
    }

    if (search) {
      params.push(`%${search}%`);
      sqlText += ` AND (
        id ILIKE $${params.length} OR 
        customer_email ILIKE $${params.length} OR 
        notes ILIKE $${params.length}
      )`;
    }

    sqlText += ` ORDER BY created_at DESC`;

    const appointments = await query(sqlText, params);
    return res.json(appointments);
  } catch (err: any) {
    console.error('Fetch appointments error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
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

    return res.json(result[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const {
      businessId = 'trimora-salon',
      locationId = 'trimora-loc-1',
      customerId = 'guest',
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

    // Format participants if sent in flat booking form
    const formattedParticipants = participants || [
      {
        id: `tap-${Date.now()}`,
        appointmentId: aptId,
        personName: guestName || 'Guest',
        serviceId: req.body.serviceId,
        staffId: req.body.staffId,
        addonIds: req.body.addonIds || [],
        startTime: `${req.body.selectedDate}T${req.body.selectedTime}:00.000Z`,
        durationMins: req.body.durationMins || 45,
        price: totalPrice,
        notes: notes,
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
        customerEmail || req.body.guestEmail || null,
        customerPhone || req.body.guestPhone || null,
        bookingRef,
        type,
        JSON.stringify(formattedParticipants),
        status,
        paymentStatus,
        paymentMethod || null,
        totalPrice || 0,
        depositAmount,
        discountAmount,
        notes,
        bookingSource,
      ]
    );

    const created = await query(`SELECT ${SELECT_APPOINTMENT_FIELDS} FROM appointments WHERE id = $1`, [aptId]);
    return res.status(201).json({ ...created[0], bookingRef });
  } catch (err: any) {
    console.error('Create booking error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    await query(`UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2`, [status, id]);
    const updated = await query(`SELECT ${SELECT_APPOINTMENT_FIELDS} FROM appointments WHERE id = $1`, [id]);
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    return res.json(updated[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/:id
router.put('/:id', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const { notes, customerEmail, customerPhone, participants, status } = req.body;

    const existing = await query(`SELECT * FROM appointments WHERE id = $1`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (notes !== undefined) {
      updates.push(`notes = $${idx++}`);
      values.push(notes);
    }
    if (customerEmail !== undefined) {
      updates.push(`customer_email = $${idx++}`);
      values.push(customerEmail);
    }
    if (customerPhone !== undefined) {
      updates.push(`customer_phone = $${idx++}`);
      values.push(customerPhone);
    }
    if (status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (participants !== undefined) {
      updates.push(`participants = $${idx++}::jsonb`);
      values.push(JSON.stringify(participants));
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(id);
      await query(
        `UPDATE appointments SET ${updates.join(', ')} WHERE id = $${values.length}`,
        values
      );
    }

    const updated = await query(`SELECT ${SELECT_APPOINTMENT_FIELDS} FROM appointments WHERE id = $1`, [id]);
    return res.json(updated[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    await query(`UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [id]);
    return res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
