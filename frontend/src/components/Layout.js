import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = {
  customer: [
    { label: 'Dashboard', icon: '⊞', to: '/dashboard' },
    { label: 'Browse Offers', icon: '🏷', to: '/browse-offers' },
    { label: 'Shop & Checkout', icon: '🛒', to: '/checkout' },
    { label: 'My Coupons', icon: '🎫', to: '/my-coupons' },
  ],
  manager: [
    { label: 'Dashboard', icon: '⊞', to: '/manager/dashboard' },
    { label: 'Manage Products', icon: '📦', to: '/manager/products' },
    { label: 'Manage Coupons', icon: '🎟', to: '/manager/coupons' },
    { label: 'Performance', icon: '📈', to: '/manager/reports' },
  ],
  admin: [
    { label: 'Dashboard', icon: '⊞', to: '/admin/dashboard' },
    { label: 'User Management', icon: '👥', to: '/admin/users' },
    { label: 'Coupon Monitor', icon: '👁', to: '/admin/monitor' },
    { label: 'Reports', icon: '📊', to: '/admin/reports' },
    { label: 'System Records', icon: '🗄', to: '/admin/records' },
  ],
};

const ROLE_LABEL = { customer: 'Customer Portal', manager: 'Marketing Manager', admin: 'Administrator' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const navItems = NAV[user?.role] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-dot" />
          PromoVault
        </div>
        <div className="sidebar-role-badge">{ROLE_LABEL[user?.role]}</div>
        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
