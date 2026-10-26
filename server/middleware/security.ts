import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'trimora_secret_jwt_neon_2026_key';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  businessId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// ============================================================
// 1. OWASP A07: Authentication & Brute Force Protection
// ============================================================

/**
 * Strict rate limiter for Authentication endpoints (login, register)
 * Max 10 attempts per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    retryAfterMinutes: 15,
  },
});

/**
 * General API Rate Limiter
 * Max 300 requests per 15 minutes per IP
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down and try again later.',
  },
});

/**
 * Booking Submission Rate Limiter (Anti-Spam)
 * Max 20 bookings per hour per IP
 */
export const bookingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Booking submission limit reached for this hour. Please try again later.',
  },
});

// ============================================================
// 2. OWASP A01 & A02: JWT Authentication & Access Control
// ============================================================

/**
 * Middleware to authenticate requests using cryptographically signed JWT
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication token required',
      code: 'AUTH_TOKEN_MISSING',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      error: 'Invalid or forged authentication token.',
      code: 'TOKEN_INVALID',
    });
  }
};

/**
 * Optional Authentication: Attaches req.user if a valid token is present, but doesn't block
 */
export const optionalAuthenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as AuthenticatedUser;
    req.user = decoded;
  } catch {
    // Ignore invalid token on optional auth
  }
  next();
};

/**
 * Middleware to require specific roles (RBAC)
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logSecurityAudit('UNAUTHORIZED_ROLE_ACCESS', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.originalUrl,
        ip: req.ip,
      });

      return res.status(403).json({
        error: 'Access denied: Insufficient privileges for this operation',
        code: 'FORBIDDEN_ROLE',
      });
    }

    next();
  };
};

/**
 * Middleware for Multi-Tenant Isolation & IDOR Protection
 * Verifies that the user owns or belongs to the requested businessId
 */
export const requireTenantAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Super admin has global tenant access
  if (req.user.role === 'super_admin') {
    return next();
  }

  const requestedBusinessId =
    req.params?.businessId ||
    req.query?.businessId ||
    req.body?.businessId ||
    'trimora-salon';

  if (req.user.businessId && req.user.businessId !== requestedBusinessId) {
    logSecurityAudit('CROSS_TENANT_ACCESS_ATTEMPT', {
      userId: req.user.id,
      userBusinessId: req.user.businessId,
      attemptedBusinessId: requestedBusinessId,
      path: req.originalUrl,
      ip: req.ip,
    });

    return res.status(403).json({
      error: 'Access denied: You cannot access or modify resources of another salon.',
      code: 'FORBIDDEN_TENANT',
    });
  }

  next();
};

// ============================================================
// 3. OWASP A03: Input Sanitization (XSS Prevention)
// ============================================================

/**
 * Strips HTML tags and script injections from untrusted string inputs
 */
export const sanitizeString = (input: unknown): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * Validates email format strictly
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validates password strength (OWASP A07 requirement: minimum 8 characters)
 */
export const validatePasswordPolicy = (password: string): { isValid: boolean; message?: string } => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long.',
    };
  }
  return { isValid: true };
};

// ============================================================
// 4. OWASP A09: Security Audit Logging
// ============================================================

export const logSecurityAudit = (eventType: string, details: Record<string, any>) => {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY AUDIT] ${timestamp} [${eventType}]`, JSON.stringify(details));
};
