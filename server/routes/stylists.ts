import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';

const router = Router();

const SELECT_STYLIST_FIELDS = `
  id,
  business_id as "businessId",
  user_id as "userId",
  name,
  name as "displayName",
  split_part(name, ' ', 1) as "firstName",
  split_part(name, ' ', 2) as "lastName",
  title,
  bio,
  avatar,
  rating::float as rating,
  review_count as "reviewCount",
  COALESCE(service_ids, '[]'::jsonb) as "serviceIds",
  COALESCE(working_hours, '[]'::jsonb) as "workingHours",
  is_active as "isActive",
  is_accepting_bookings as "isAcceptingBookings",
  order_index as "orderIndex",
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

// GET /api/stylists
router.get('/', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected', dbConfigured: false });
    }

    const { businessId = 'trimora-salon', serviceId } = req.query;
    let sqlText = `SELECT ${SELECT_STYLIST_FIELDS} FROM stylists WHERE business_id = $1 AND is_active = true`;
    const params: any[] = [businessId];

    if (serviceId) {
      params.push(serviceId);
      sqlText += ` AND service_ids ? $${params.length}`;
    }

    sqlText += ` ORDER BY order_index ASC, created_at ASC`;

    const stylists = await query(sqlText, params);
    return res.json(stylists);
  } catch (err: any) {
    console.error('Fetch stylists error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/stylists/:id
router.get('/:id', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const result = await query(
      `SELECT ${SELECT_STYLIST_FIELDS} FROM stylists WHERE id = $1 AND is_active = true LIMIT 1`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Stylist not found' });
    }

    return res.json(result[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/stylists
router.post('/', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const {
      name,
      title = 'Stylist',
      bio = '',
      avatar = '',
      businessId = 'trimora-salon',
      serviceIds = [],
      workingHours = [],
      orderIndex = 0,
      isAcceptingBookings = true,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Stylist name is required' });
    }

    const newId = `ts-staff-${Date.now()}`;
    await query(
      `INSERT INTO stylists (
        id, business_id, name, title, bio, avatar, 
        service_ids, working_hours, order_index, is_accepting_bookings
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        $7::jsonb, $8::jsonb, $9, $10
      )`,
      [
        newId,
        businessId,
        name,
        title,
        bio,
        avatar,
        JSON.stringify(serviceIds),
        JSON.stringify(workingHours),
        orderIndex,
        isAcceptingBookings,
      ]
    );

    const created = await query(`SELECT ${SELECT_STYLIST_FIELDS} FROM stylists WHERE id = $1`, [newId]);
    return res.status(201).json(created[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/stylists/:id
router.put('/:id', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const body = req.body;

    const existing = await query(`SELECT id FROM stylists WHERE id = $1`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Stylist not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      name: 'name',
      title: 'title',
      bio: 'bio',
      avatar: 'avatar',
      rating: 'rating',
      serviceIds: 'service_ids',
      workingHours: 'working_hours',
      isActive: 'is_active',
      isAcceptingBookings: 'is_accepting_bookings',
      orderIndex: 'order_index',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (body[key] !== undefined) {
        if (col === 'service_ids' || col === 'working_hours') {
          updates.push(`${col} = $${idx}::jsonb`);
          values.push(JSON.stringify(body[key]));
        } else {
          updates.push(`${col} = $${idx}`);
          values.push(body[key]);
        }
        idx++;
      }
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(id);
      await query(
        `UPDATE stylists SET ${updates.join(', ')} WHERE id = $${values.length}`,
        values
      );
    }

    const updated = await query(`SELECT ${SELECT_STYLIST_FIELDS} FROM stylists WHERE id = $1`, [id]);
    return res.json(updated[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/stylists/:id
router.delete('/:id', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    await query(`UPDATE stylists SET is_active = false, updated_at = NOW() WHERE id = $1`, [id]);
    return res.json({ success: true, message: 'Stylist removed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
