import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection, isDbConfigured } from './db/connection';

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

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development origins or no origin (like curl or postman)
      if (!origin || origin.includes('localhost') || origin === CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// API Root & Health Check
const healthHandler = async (req: express.Request, res: express.Response) => {
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
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Start Server locally if not running in Vercel Serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log('====================================================');
    console.log(`💈 TRIMORA BACKEND SERVER RUNNING ON PORT ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
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
