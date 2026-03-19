import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard';
import BrowseOffers from './pages/customer/BrowseOffers';
import Checkout from './pages/customer/Checkout';
import MyCoupons from './pages/customer/MyCoupons';

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManageCoupons from './pages/manager/ManageCoupons';
import Reports from './pages/manager/Reports';

import ManageProducts from './pages/manager/ManageProducts';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CouponMonitor from './pages/admin/CouponMonitor';
import AdminReports from './pages/admin/AdminReports';
import SystemRecords from './pages/admin/SystemRecords';

// Role-protected wrapper
const Protected = ({ roles, children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader-wrap"><div className="loader" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader-wrap"><div className="loader" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  const defaults = { customer: '/dashboard', manager: '/manager/dashboard', admin: '/admin/dashboard' };
  return <Navigate to={defaults[user.role] || '/auth'} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/" element={<HomeRedirect />} />

    {/* Customer */}
    <Route element={<Protected roles={['customer']}><Layout /></Protected>}>
      <Route path="/dashboard" element={<CustomerDashboard />} />
      <Route path="/browse-offers" element={<BrowseOffers />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/my-coupons" element={<MyCoupons />} />
    </Route>

    {/* Manager */}
    <Route element={<Protected roles={['manager']}><Layout /></Protected>}>
      <Route path="/manager/dashboard" element={<ManagerDashboard />} />
      <Route path="/manager/coupons" element={<ManageCoupons />} />
      <Route path="/manager/products" element={<ManageProducts />} />
      <Route path="/manager/reports" element={<Reports />} />
    </Route>

    {/* Admin */}
    <Route element={<Protected roles={['admin']}><Layout /></Protected>}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/monitor" element={<CouponMonitor />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/records" element={<SystemRecords />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#111118', color: '#f0f0f5', border: '1px solid #2a2a35', fontFamily: "'DM Mono', monospace", fontSize: '13px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#111118' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#111118' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
