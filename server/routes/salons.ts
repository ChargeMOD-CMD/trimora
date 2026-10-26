import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';

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

// GET /api/salons
router.get('/', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected', dbConfigured: false });
    }

    const salons = await query(`SELECT ${SELECT_SALON_FIELDS} FROM salons ORDER BY name ASC`);
    return res.json(salons);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/salons/:id
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
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/salons
router.post('/', async (req, res) => {
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
        name,
        slug,
        tagline,
        description,
        contactEmail,
        contactPhone,
        address,
        city,
        status,
        subscriptionStatus,
      ]
    );

    const created = await query(`SELECT ${SELECT_SALON_FIELDS} FROM salons WHERE id = $1`, [newId]);
    return res.status(201).json(created[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
