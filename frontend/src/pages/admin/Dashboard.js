import React, { useEffect, useState } from 'react';
import { reportAPI, orderAPI, couponAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';
import { statusBadge, roleBadge } from '../../components/Badges';
import { userAPI } from '../../utils/api';

export default function AdminDashboard() {
  const [summary, setSummary]   = useState(null);
  const [coupons, setCoupons]   = useState([]);
  const [users, setUsers]       = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([reportAPI.summary(), couponAPI.getAll(), userAPI.getAll(), orderAPI.getAll()])
      .then(([s, c, u, o]) => {
        setSummary(s.data.data);
        setCoupons(c.data.data);
        setUsers(u.data.data);
        setOrders(o.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar title="Dashboard" /><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="content-area">
        <div className="stats-grid">
          <div className="stat-card" style={{'--stat-color':'#ff6b35'}}>
            <div className="stat-icon">👥</div>
            <div className="stat-value">{summary?.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card" style={{'--stat-color':'#7c3aed'}}>
            <div className="stat-icon">🎫</div>
            <div className="stat-value">{summary?.totalCoupons || 0}</div>
            <div className="stat-label">Coupons</div>
          </div>
          <div className="stat-card" style={{'--stat-color':'#10b981'}}>
            <div className="stat-icon">📦</div>
            <div className="stat-value">{summary?.totalOrders || 0}</div>
            <div className="stat-label">Orders</div>
          </div>
          <div className="stat-card" style={{'--stat-color':'#f59e0b'}}>
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{summary?.totalRevenue || 0}</div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>

        <div className="two-col">
          <div>
            <div className="section-header"><div className="section-title">All Coupons</div></div>
            <div className="table-card">
              <table>
                <thead><tr><th>Code</th><th>Discount</th><th>Used</th><th>Status</th></tr></thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.code}</strong></td>
                      <td className="text-accent">{c.type==='percent'?`${c.value}%`:`₹${c.value}`}</td>
                      <td>{c.usedCount}/{c.usageLimit}</td>
                      <td>{statusBadge(c)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="section-header"><div className="section-title">All Users</div></div>
            <div className="table-card">
              <table>
                <thead><tr><th>Name</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{roleBadge(u.role)}</td>
                      <td style={{color:'var(--text3)',fontSize:12}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
