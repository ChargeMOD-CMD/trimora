import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection, isDbConfigured } from './db/connection';
import { generalApiLimiter } from './middleware/security';

import authRouter from './routes/auth';
import servicesRouter from './routes/services';
import stylistsRouter from './routes/stylists';
import bookingsRouter from './routes/bookings';
import customersRouter from './routes/customers';
import salonsRouter from './routes/salons';
import dashboardRouter from './routes/dashboard';
import reviewsRouter from './routes/reviews';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ============================================================
// OWASP A05: Security Misconfiguration - Headers & Hardening
// ============================================================
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false, // Vite and dynamic client routing support
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'sameorigin' }, // OWASP Clickjacking defense
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // OWASP Cryptographic Failures: Enforce HTTPS
    noSniff: true, // Prevent MIME-sniffing
    xssFilter: true, // Enable legacy browser XSS filters
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// OWASP A07: General API Rate Limiting to prevent DoS
app.use('/api', generalApiLimiter);

// OWASP A04: Restrict Payload Size to 1MB preventing Memory Exhaustion DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS Policy
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development origins, Vercel deployments, or same-origin requests
      if (!origin || origin.includes('localhost') || origin.includes('vercel.app') || origin === CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive fallback
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// API Root & Health Check
const healthHandler = async (req: Request, res: Response) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'online',
    serverTime: new Date().toISOString(),
    neonDatabase: {
      isConfigured: isDbConfigured(),
      connected: dbStatus.ok,
      message: dbStatus.message,
      version: dbStatus.version || null,
    },
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount Routes (/api/...)
app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/stylists', stylistsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/salons', salonsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reviews', reviewsRouter);

// Fallback mounts without /api prefix (for Vercel serverless rewrites)
app.use('/auth', authRouter);
app.use('/services', servicesRouter);
app.use('/stylists', stylistsRouter);
app.use('/bookings', bookingsRouter);
app.use('/customers', customersRouter);
app.use('/salons', salonsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/reviews', reviewsRouter);

// 404 handler for unmatched API routes
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// ============================================================
// OWASP A05: Secure Error Handling - No Database Stack Traces
// ============================================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[SERVER ERROR] ${req.method} ${req.url}:`, err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal server error. Please try again later.',
    code: err.code || 'INTERNAL_ERROR',
  });
});

// Start Server locally if not running in Vercel Serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log('====================================================');
    console.log(`💈 TRIMORA BACKEND SERVER RUNNING ON PORT ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log('🛡️ OWASP Security Headers & Rate Limiting: ACTIVE');
    console.log('====================================================');

    const connection = await testConnection();
    if (connection.ok) {
      console.log('✅ Neon DB Status: Connected successfully');
    } else {
      console.log('⚠️ Neon DB Status:', connection.message);
      console.log('👉 Please set DATABASE_URL in .env to connect your Neon database.');
    }
    console.log('====================================================\n');
  });
}

export default app;
