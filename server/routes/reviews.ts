import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';
import { sanitizeString, bookingRateLimiter } from '../middleware/security';

const router = Router();

// GET /api/reviews
router.get('/', async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected', dbConfigured: false });
    }

    const { businessId = 'trimora-salon' } = req.query;
    const reviews = await query(
      `SELECT id, business_id as "businessId", customer_id as "customerId", 
              customer_name as "customerName", customer_avatar as "customerAvatar",
              staff_name as "staffName", service_name as "serviceName", 
              overall_rating::float as "overallRating", comment, created_at as "createdAt"
       FROM reviews 
       WHERE business_id = $1 
       ORDER BY created_at DESC`,
      [businessId]
    );

    return res.json(reviews);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
});

// POST /api/reviews (OWASP A03: Input Sanitization against Stored XSS)
router.post('/', bookingRateLimiter, async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const {
      businessId = 'trimora-salon',
      customerId,
      customerName,
      staffName,
      serviceName,
      overallRating,
      comment,
    } = req.body;

    if (!customerName || !overallRating) {
      return res.status(400).json({ error: 'Customer name and rating are required' });
    }

    const cleanCustomerName = sanitizeString(customerName);
    const cleanStaffName = staffName ? sanitizeString(staffName) : null;
    const cleanServiceName = serviceName ? sanitizeString(serviceName) : null;
    const cleanComment = comment ? sanitizeString(comment) : '';
    const rating = Math.min(5, Math.max(1, Number(overallRating) || 5));

    const newId = `rev-${Date.now()}`;
    await query(
      `INSERT INTO reviews (
        id, business_id, customer_id, customer_name, staff_name, service_name, overall_rating, comment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [newId, businessId, customerId || null, cleanCustomerName, cleanStaffName, cleanServiceName, rating, cleanComment]
    );

    return res.status(201).json({ id: newId, message: 'Review submitted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
