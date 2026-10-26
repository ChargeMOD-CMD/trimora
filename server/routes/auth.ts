import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, isDbConfigured } from '../db/connection';
import {
  authRateLimiter,
  authenticateToken,
  isValidEmail,
  validatePasswordPolicy,
  sanitizeString,
  logSecurityAudit,
  AuthenticatedRequest,
} from '../middleware/security';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'trimora_secret_jwt_neon_2026_key';

// ============================================================
// POST /api/auth/login (OWASP A02, A03, A07)
// ============================================================
router.post('/login', authRateLimiter, async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const rawPassword = req.body.password;

    if (!rawEmail || !rawPassword) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const email = sanitizeString(rawEmail).toLowerCase();
    const password = String(rawPassword);

    if (!isDbConfigured()) {
      return res.status(503).json({
        error: 'Database not connected. Please verify your Neon connection settings.',
        dbConfigured: false,
      });
    }

    // Parameterized query prevents SQL Injection (OWASP A03)
    const users = await query(
      `SELECT id, email, password_hash, first_name as "firstName", last_name as "lastName", 
              phone, role, business_id as "businessId", avatar, created_at as "createdAt", updated_at as "updatedAt"
       FROM users 
       WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    );

    // Generic error message prevents User Enumeration (OWASP A07)
    if (!users || users.length === 0) {
      logSecurityAudit('FAILED_LOGIN_UNKNOWN_USER', { email, ip: req.ip });
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];
    let isPasswordValid = false;

    // Check if password matches via bcrypt (or progressive upgrade from legacy plaintext)
    if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } else if (user.password_hash === password) {
      // Legacy match: Automatically upgrade to bcrypt hash
      isPasswordValid = true;
      const upgradedHash = await bcrypt.hash(password, 12);
      await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [upgradedHash, user.id]);
      logSecurityAudit('PASSWORD_HASH_UPGRADED', { userId: user.id });
    }

    if (!isPasswordValid) {
      logSecurityAudit('FAILED_LOGIN_BAD_PASSWORD', { userId: user.id, email, ip: req.ip });
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Sign secure, cryptographically verified JWT token (OWASP A02)
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '24h',
      algorithm: 'HS256',
    });

    logSecurityAudit('SUCCESSFUL_LOGIN', { userId: user.id, role: user.role, ip: req.ip });

    // Sanitize user object to never return password_hash (OWASP A02)
    const { password_hash, ...safeUser } = user;

    return res.json({
      user: safeUser,
      token,
      message: 'Authentication successful',
    });
  } catch (err: any) {
    console.error('Auth login error:', err);
    return res.status(500).json({ error: 'An unexpected authentication error occurred.' });
  }
});

// ============================================================
// POST /api/auth/register (OWASP A02, A03, A07, A08)
// ============================================================
router.post('/register', authRateLimiter, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role = 'customer', businessId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanFirstName = sanitizeString(firstName);
    const cleanLastName = sanitizeString(lastName);
    const cleanPhone = phone ? sanitizeString(phone) : null;

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }

    const passwordCheck = validatePasswordPolicy(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    // Disallow registering as super_admin directly (OWASP A01: Broken Access Control)
    const safeRole = role === 'super_admin' ? 'customer' : (role || 'customer');

    if (!isDbConfigured()) {
      return res.status(503).json({ error: 'Neon DB is not connected' });
    }

    const existing = await query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Cryptographic salt and hash with bcrypt work factor 12 (OWASP A02)
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = `usr-${Date.now()}`;

    await query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, business_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, cleanEmail, passwordHash, cleanFirstName, cleanLastName, cleanPhone, safeRole, businessId || null]
    );

    const newUser = {
      id: userId,
      email: cleanEmail,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      phone: cleanPhone,
      role: safeRole,
      businessId: businessId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        businessId: newUser.businessId,
      },
      JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    logSecurityAudit('USER_REGISTERED', { userId, role: safeRole, email: cleanEmail, ip: req.ip });

    return res.status(201).json({ user: newUser, token });
  } catch (err: any) {
    console.error('Auth register error:', err);
    return res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
});

// ============================================================
// GET /api/auth/me (OWASP A01: Secure Session Inspection)
// ============================================================
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const users = await query(
      `SELECT id, email, first_name as "firstName", last_name as "lastName", 
              phone, role, business_id as "businessId", avatar, created_at as "createdAt", updated_at as "updatedAt"
       FROM users 
       WHERE id = $1 LIMIT 1`,
      [currentUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: users[0] });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error fetching user profile' });
  }
});

export default router;
