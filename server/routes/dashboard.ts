import { Router } from 'express';
import { query, isDbConfigured } from '../db/connection';
import {
  authenticateToken,
  requireRole,
  requireTenantAccess,
  AuthenticatedRequest,
} from '../middleware/security';

const router = Router();

// GET /api/dashboard/stats (OWASP A01: Protected Business Data)
router.get(
  '/stats',
  authenticateToken,
  requireRole(['super_admin', 'owner', 'manager']),
  requireTenantAccess,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!isDbConfigured()) {
        return res.status(503).json({ error: 'Database not connected', dbConfigured: false });
      }

      // If salon owner/manager, enforce their own businessId
      const targetBusinessId = req.user?.role === 'super_admin'
        ? (req.query.businessId as string || 'trimora-salon')
        : (req.user?.businessId || 'trimora-salon');

      const [appointments, customersCount, stylistsCount, servicesCount] = await Promise.all([
        query(
          `SELECT id, status, total_price::float as "totalPrice", participants, created_at as "createdAt"
           FROM appointments 
           WHERE business_id = $1`,
          [targetBusinessId]
        ),
        query(`SELECT count(*)::int as count FROM customers WHERE business_id = $1`, [targetBusinessId]),
        query(`SELECT count(*)::int as count FROM stylists WHERE business_id = $1 AND is_active = true`, [targetBusinessId]),
        query(`SELECT count(*)::int as count FROM services WHERE business_id = $1 AND is_active = true`, [targetBusinessId]),
      ]);

      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date();

      const todayApts = appointments.filter((a: any) =>
        a.participants &&
        Array.isArray(a.participants) &&
        a.participants.some((p: any) => p.startTime?.startsWith(todayStr)) &&
        a.status !== 'cancelled'
      );

      const upcomingApts = appointments.filter((a: any) => {
        const startTime = a.participants?.[0]?.startTime;
        return startTime && new Date(startTime) > now && a.status !== 'cancelled' && a.status !== 'completed';
      });

      const completedApts = appointments.filter((a: any) => a.status === 'completed');
      const totalRevenue = completedApts.reduce((sum: number, a: any) => sum + (a.totalPrice || 0), 0);
      const todayRevenue = todayApts.reduce((sum: number, a: any) => sum + (a.totalPrice || 0), 0);

      return res.json({
        totalAppointments: appointments.length,
        todayAppointments: todayApts.length,
        upcomingAppointments: upcomingApts.length,
        completedAppointments: completedApts.length,
        totalCustomers: customersCount[0]?.count || 0,
        activeStylists: stylistsCount[0]?.count || 0,
        totalServices: servicesCount[0]?.count || 0,
        totalRevenue,
        todayRevenue,
        avgRating: 4.9,
      });
    } catch (err: any) {
      console.error('Dashboard stats error:', err);
      return res.status(500).json({ error: 'Failed to retrieve dashboard metrics' });
    }
  }
);

export default router;
