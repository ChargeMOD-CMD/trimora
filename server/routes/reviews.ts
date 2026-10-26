import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';

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
    return res.status(500).json({ error: err.message });
  }
});

export default router;
