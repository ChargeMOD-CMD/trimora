import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!isDbConfigured()) {
      return res.status(503).json({
        error: 'Database not connected. Please add your Neon connection string in .env',
        dbConfigured: false,
      });
    }

    const users = await query(
      `SELECT id, email, password_hash, first_name as "firstName", last_name as "lastName", 
              phone, role, business_id as "businessId", avatar, created_at as "createdAt", updated_at as "updatedAt"
       FROM users 
       WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];
    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Omit sensitive password_hash from response
    const { password_hash, ...safeUser } = user;
    const token = `neon_token_${user.id}_${Date.now()}`;

    return res.json({
      user: safeUser,
      token,
      message: 'Login successful via Neon DB',
    });
  } catch (err: any) {
    console.error('Auth login error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role = 'customer', businessId } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Neon DB is not connected' });
    }

    const existing = await query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const userId = `usr-${Date.now()}`;
    await query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, business_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, email, password, firstName, lastName, phone || null, role, businessId || null]
    );

    const newUser = {
      id: userId,
      email,
      firstName,
      lastName,
      phone,
      role,
      businessId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = `neon_token_${userId}_${Date.now()}`;
    return res.status(201).json({ user: newUser, token });
  } catch (err: any) {
    console.error('Auth register error:', err);
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = req.query.userId as string;

    if (!userId && !authHeader) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const targetId = userId || (authHeader?.replace('Bearer ', '').split('_')[2]);
    if (!targetId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const users = await query(
      `SELECT id, email, first_name as "firstName", last_name as "lastName", 
              phone, role, business_id as "businessId", avatar, created_at as "createdAt", updated_at as "updatedAt"
       FROM users 
       WHERE id = $1 LIMIT 1`,
      [targetId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: users[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
