import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './features/auth/AuthContext';
import { ToastProvider } from './features/notifications/ToastContext';
import { BookingProvider } from './features/booking/BookingContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { ProtectedRoute } from './features/auth/ProtectedRoute';

// Public Pages
import HomePage from './pages/Home';
import ServicesPage from './pages/Services';
import ServiceDetailPage from './pages/ServiceDetail';

// Auth Pages
import Login from './pages/auth/Login';
// Booking Wizard
import BookingPage from './pages/booking/BookingPage';

// Admin Dashboard Pages
import DashboardOverview from './pages/business/DashboardOverview';
import CalendarView from './pages/business/CalendarView';
import AppointmentsManage from './pages/business/AppointmentsManage';
import StaffManage from './pages/business/StaffManage';
import ServicesManage from './pages/business/ServicesManage';
import Settings from './pages/business/Settings';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SalonsManage from './pages/superadmin/SalonsManage';
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';

function AdminPlaceholder({ title }: { title: string }) {
  return (
    <DashboardLayout>
      <div style={{ padding: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>{title}</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Welcome to the Trimora Admin Dashboard. (Work in progress)</p>
      </div>
    </DashboardLayout>
  );
}

function SuperAdminPlaceholder({ title }: { title: string }) {
  return (
    <SuperAdminLayout>
      <div style={{ padding: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>{title}</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Welcome to the Trimora Super Admin Portal. (Work in progress)</p>
      </div>
    </SuperAdminLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <BookingProvider>
            
            <Routes>
              {/* Public Routes - Multi-tenant */}
              <Route path="/" element={<Navigate to="/trimora" replace />} />
              <Route path="/:slug" element={<HomePage />} />
              <Route path="/:slug/services" element={<ServicesPage />} />
              <Route path="/:slug/services/:id" element={<ServiceDetailPage />} />
              
              {/* Redirect old marketplace routes to home */}
              <Route path="/explore" element={<Navigate to="/trimora/services" replace />} />
              <Route path="/business/*" element={<Navigate to="/trimora" replace />} />
              
              {/* Booking Flow */}
              <Route path="/:slug/book/*" element={<BookingPage />} />
              
              {/* Auth */}
              <Route path="/login" element={<Login />} />
              
              {/* Admin Dashboard Routes (Protected: Staff & Salon Owners) */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager', 'stylist', 'receptionist']}><DashboardOverview /></ProtectedRoute>} />
              <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager', 'stylist', 'receptionist']}><CalendarView /></ProtectedRoute>} />
              <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager', 'stylist', 'receptionist']}><AppointmentsManage /></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager', 'stylist', 'receptionist']}><AdminPlaceholder title="Customers Management" /></ProtectedRoute>} />
              <Route path="/admin/stylists" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager']}><StaffManage /></ProtectedRoute>} />
              <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager']}><ServicesManage /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager']}><Settings /></ProtectedRoute>} />
              
              {/* Redirect old business dashboard routes */}
              <Route path="/business-dashboard/*" element={<Navigate to="/admin" replace />} />
              
              {/* Super Admin Routes (Protected: Super Admin Only) */}
              <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/super-admin/salons" element={<ProtectedRoute allowedRoles={['super_admin']}><SalonsManage /></ProtectedRoute>} />
              <Route path="/super-admin/users" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminPlaceholder title="Platform Users" /></ProtectedRoute>} />
              <Route path="/super-admin/health" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminPlaceholder title="System Health" /></ProtectedRoute>} />
              <Route path="/super-admin/settings" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminPlaceholder title="Global Settings" /></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<HomePage />} />
            </Routes>
            
            <ToastContainer />
          </BookingProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
