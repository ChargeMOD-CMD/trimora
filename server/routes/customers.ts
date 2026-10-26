import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';

const router = Router();

const SELECT_CUSTOMER_FIELDS = `
  id,
  business_id as "businessId",
  first_name as "firstName",
  last_name as "lastName",
  email,
  phone,
  avatar,
  notes,
  total_spend::float as "totalSpend",
  total_visits as "visitCount",
  loyalty_points as "loyaltyPoints",
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected', dbConfigured: false });
    }

    const { businessId = 'trimora-salon', search } = req.query;
    let sqlText = `SELECT ${SELECT_CUSTOMER_FIELDS} FROM customers WHERE business_id = $1`;
    const params: any[] = [businessId];

    if (search) {
      params.push(`%${search}%`);
      sqlText += ` AND (
        first_name ILIKE $${params.length} OR 
        last_name ILIKE $${params.length} OR 
        email ILIKE $${params.length} OR 
        phone ILIKE $${params.length}
      )`;
    }

    sqlText += ` ORDER BY total_spend DESC, created_at DESC`;
    const customers = await query(sqlText, params);
    return res.json(customers);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const result = await query(
      `SELECT ${SELECT_CUSTOMER_FIELDS} FROM customers WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json(result[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const body = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      notes: 'notes',
      loyaltyPoints: 'loyalty_points',
      totalSpend: 'total_spend',
      visitCount: 'total_visits',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (body[key] !== undefined) {
        updates.push(`${col} = $${idx++}`);
        values.push(body[key]);
      }
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(id);
      await query(
        `UPDATE customers SET ${updates.join(', ')} WHERE id = $${values.length}`,
        values
      );
    }

    const updated = await query(`SELECT ${SELECT_CUSTOMER_FIELDS} FROM customers WHERE id = $1`, [id]);
    return res.json(updated[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
