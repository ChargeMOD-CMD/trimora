import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';
import {
  authenticateToken,
  requireRole,
  sanitizeString,
  AuthenticatedRequest,
} from '../middleware/security';

const router = Router();

const SELECT_SALON_FIELDS = `
  id,
  name,
  slug,
  tagline,
  description,
  contact_email as "contactEmail",
  contact_phone as "contactPhone",
  address,
  city,
  state,
  postcode,
  country,
  logo_url as "logoUrl",
  cover_image as "coverImage",
  rating::float as rating,
  review_count as "reviewCount",
  COALESCE(amenities, '[]'::jsonb) as amenities,
  COALESCE(working_hours, '[]'::jsonb) as "workingHours",
  cancellation_policy as "cancellationPolicy",
  COALESCE(social_links, '{}'::jsonb) as "socialLinks",
  status,
  subscription_status as "subscriptionStatus",
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

// GET /api/salons (Public directory)
router.get('/', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected', dbConfigured: false });
    }

    const salons = await query(`SELECT ${SELECT_SALON_FIELDS} FROM salons ORDER BY name ASC`);
    return res.json(salons);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve salons' });
  }
});

// GET /api/salons/:id (Public view)
router.get('/:id', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const salons = await query(
      `SELECT ${SELECT_SALON_FIELDS} FROM salons WHERE id = $1 OR slug = $1 LIMIT 1`,
      [id]
    );

    if (salons.length === 0) {
      return res.status(404).json({ error: 'Salon not found' });
    }

    return res.json(salons[0]);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve salon' });
  }
});

// POST /api/salons (OWASP A01: Super Admin Only Creation)
router.post(
  '/',
  authenticateToken,
  requireRole(['super_admin']),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!isDbConfigured()) {
        return res.status(503).json({ error: 'Database not connected' });
      }

      const {
        name,
        slug,
        tagline = '',
        description = '',
        contactEmail = '',
        contactPhone = '',
        address = '',
        city = '',
        status = 'active',
        subscriptionStatus = 'trial',
      } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: 'Salon name and slug are required' });
      }

      const cleanName = sanitizeString(name);
      const cleanSlug = sanitizeString(slug).toLowerCase().replace(/[^a-z0-9-]/g, '');
      const cleanTagline = sanitizeString(tagline);
      const cleanDesc = sanitizeString(description);
      const cleanEmail = sanitizeString(contactEmail);
      const cleanPhone = sanitizeString(contactPhone);
      const cleanAddress = sanitizeString(address);
      const cleanCity = sanitizeString(city);

      const existing = await query(`SELECT id FROM salons WHERE slug = $1`, [cleanSlug]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'A salon with this slug already exists' });
      }

      const newId = `salon-${Date.now()}`;
      await query(
        `INSERT INTO salons (
          id, name, slug, tagline, description, contact_email, contact_phone, 
          address, city, status, subscription_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 
          $8, $9, $10, $11
        )`,
        [
          newId,
          cleanName,
          cleanSlug,
          cleanTagline,
          cleanDesc,
          cleanEmail,
          cleanPhone,
          cleanAddress,
          cleanCity,
          status,
          subscriptionStatus,
        ]
      );

      const created = await query(`SELECT ${SELECT_SALON_FIELDS} FROM salons WHERE id = $1`, [newId]);
      return res.status(201).json(created[0]);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to create salon' });
    }
  }
);

// PUT /api/salons/:id (OWASP A01: Owner / Super Admin Only Update)
router.put(
  '/:id',
  authenticateToken,
  requireRole(['super_admin', 'owner']),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!isDbConfigured()) {
        return res.status(503).json({ error: 'Database not connected' });
      }

      const { id } = req.params;
      const existing = await query(`SELECT id FROM salons WHERE id = $1 OR slug = $1`, [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Salon not found' });
      }

      const actualId = existing[0].id;
      if (req.user?.role !== 'super_admin' && req.user?.businessId && req.user.businessId !== actualId) {
        return res.status(403).json({ error: 'Access denied: You can only edit your own salon profile' });
      }

      const body = req.body;
      const updates: string[] = [];
      const values: any[] = [];
      let idx = 1;

      const allowedFields: Record<string, string> = {
        name: 'name',
        tagline: 'tagline',
        description: 'description',
        contactEmail: 'contact_email',
        contactPhone: 'contact_phone',
        address: 'address',
        city: 'city',
        state: 'state',
        postcode: 'postcode',
        country: 'country',
        logoUrl: 'logo_url',
        coverImage: 'cover_image',
        amenities: 'amenities',
        workingHours: 'working_hours',
        cancellationPolicy: 'cancellation_policy',
      };

      for (const [key, col] of Object.entries(allowedFields)) {
        if (body[key] !== undefined) {
          if (col === 'amenities' || col === 'working_hours') {
            updates.push(`${col} = $${idx}::jsonb`);
            values.push(JSON.stringify(body[key]));
          } else {
            updates.push(`${col} = $${idx}`);
            const val = typeof body[key] === 'string' ? sanitizeString(body[key]) : body[key];
            values.push(val);
          }
          idx++;
        }
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        values.push(actualId);
        await query(`UPDATE salons SET ${updates.join(', ')} WHERE id = $${values.length}`, values);
      }

      const updated = await query(`SELECT ${SELECT_SALON_FIELDS} FROM salons WHERE id = $1`, [actualId]);
      return res.json(updated[0]);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update salon' });
    }
  }
);

export default router;
