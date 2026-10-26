import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';
import {
  authenticateToken,
  requireRole,
  requireTenantAccess,
  sanitizeString,
  AuthenticatedRequest,
} from '../middleware/security';

const router = Router();

// Protect all customer routes with authentication and staff roles
router.use(authenticateToken);
router.use(requireRole(['super_admin', 'owner', 'manager', 'stylist', 'receptionist']));

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

// GET /api/customers (OWASP A01: Tenant-isolated customer directory)
router.get('/', requireTenantAccess, async (req: AuthenticatedRequest, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected', dbConfigured: false });
    }

    const businessId = req.user?.role === 'super_admin'
      ? (req.query.businessId as string || 'trimora-salon')
      : (req.user?.businessId || 'trimora-salon');

    const rawSearch = req.query.search as string;
    let sqlText = `SELECT ${SELECT_CUSTOMER_FIELDS} FROM customers WHERE business_id = $1`;
    const params: any[] = [businessId];

    if (rawSearch) {
      const cleanSearch = sanitizeString(rawSearch);
      params.push(`%${cleanSearch}%`);
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
    return res.status(500).json({ error: 'Failed to retrieve customers list' });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req: AuthenticatedRequest, res) => {
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

    // Tenant check
    if (req.user?.role !== 'super_admin' && req.user?.businessId && result[0].businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Access denied to this customer record' });
    }

    return res.json(result[0]);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve customer' });
  }
});

// PUT /api/customers/:id
router.put('/:id', requireRole(['super_admin', 'owner', 'manager']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const existing = await query(`SELECT business_id as "businessId" FROM customers WHERE id = $1`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (req.user?.role !== 'super_admin' && req.user?.businessId && existing[0].businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Access denied: Cannot edit customers of other salons' });
    }

    const body = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowedFields: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      notes: 'notes',
      loyaltyPoints: 'loyalty_points',
      totalSpend: 'total_spend',
      visitCount: 'total_visits',
    };

    for (const [key, col] of Object.entries(allowedFields)) {
      if (body[key] !== undefined) {
        updates.push(`${col} = $${idx++}`);
        const val = typeof body[key] === 'string' ? sanitizeString(body[key]) : body[key];
        values.push(val);
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
    return res.status(500).json({ error: 'Failed to update customer' });
  }
});

export default router;
