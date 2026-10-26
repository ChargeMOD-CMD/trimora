import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';

const router = Router();

const SELECT_SERVICE_FIELDS = `
  id,
  business_id as "businessId",
  name,
  description,
  category,
  duration_mins as "durationMins",
  price::float as price,
  COALESCE(addons, '[]'::jsonb) as addons,
  COALESCE(staff_ids, '[]'::jsonb) as "staffIds",
  COALESCE(tags, '[]'::jsonb) as tags,
  is_active as "isActive",
  is_featured as "isFeatured",
  is_member_only as "isMemberOnly",
  requires_deposit as "requiresDeposit",
  deposit_amount::float as "depositAmount",
  max_group_size as "maxGroupSize",
  order_index as "orderIndex",
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

// GET /api/services
router.get('/', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected', dbConfigured: false });
    }

    const { category, businessId = 'trimora-salon' } = req.query;
    let sqlText = `SELECT ${SELECT_SERVICE_FIELDS} FROM services WHERE business_id = $1 AND is_active = true`;
    const params: any[] = [businessId];

    if (category && category !== 'all') {
      params.push(category);
      sqlText += ` AND category = $${params.length}`;
    }

    sqlText += ` ORDER BY order_index ASC, created_at ASC`;

    const services = await query(sqlText, params);
    return res.json(services);
  } catch (err: any) {
    console.error('Fetch services error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const services = await query(
      `SELECT ${SELECT_SERVICE_FIELDS} FROM services WHERE id = $1 AND is_active = true LIMIT 1`,
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    return res.json(services[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/services
router.post('/', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const {
      name,
      description,
      category,
      durationMins,
      price,
      businessId = 'trimora-salon',
      addons = [],
      staffIds = [],
      tags = [],
      isFeatured = false,
      isMemberOnly = false,
      requiresDeposit = false,
      depositAmount = 0,
      maxGroupSize = 1,
      orderIndex = 0,
    } = req.body;

    if (!name || !category || durationMins === undefined || price === undefined) {
      return res.status(400).json({ error: 'Missing required service fields' });
    }

    const newId = `ts-${Date.now()}`;
    await query(
      `INSERT INTO services (
        id, business_id, name, description, category, duration_mins, price, 
        addons, staff_ids, tags, is_featured, is_member_only, requires_deposit, 
        deposit_amount, max_group_size, order_index
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 
        $8::jsonb, $9::jsonb, $10::jsonb, $11, $12, $13, 
        $14, $15, $16
      )`,
      [
        newId,
        businessId,
        name,
        description || '',
        category,
        durationMins,
        price,
        JSON.stringify(addons),
        JSON.stringify(staffIds),
        JSON.stringify(tags),
        isFeatured,
        isMemberOnly,
        requiresDeposit,
        depositAmount,
        maxGroupSize,
        orderIndex,
      ]
    );

    const created = await query(`SELECT ${SELECT_SERVICE_FIELDS} FROM services WHERE id = $1`, [newId]);
    return res.status(201).json(created[0]);
  } catch (err: any) {
    console.error('Create service error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/services/:id
router.put('/:id', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const body = req.body;

    const existing = await query(`SELECT id FROM services WHERE id = $1`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      category: 'category',
      durationMins: 'duration_mins',
      price: 'price',
      addons: 'addons',
      staffIds: 'staff_ids',
      tags: 'tags',
      isActive: 'is_active',
      isFeatured: 'is_featured',
      orderIndex: 'order_index',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (body[key] !== undefined) {
        if (col === 'addons' || col === 'staff_ids' || col === 'tags') {
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
        `UPDATE services SET ${updates.join(', ')} WHERE id = $${values.length}`,
        values
      );
    }

    const updated = await query(`SELECT ${SELECT_SERVICE_FIELDS} FROM services WHERE id = $1`, [id]);
    return res.json(updated[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    await query(`UPDATE services SET is_active = false, updated_at = NOW() WHERE id = $1`, [id]);
    return res.json({ success: true, message: 'Service removed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
