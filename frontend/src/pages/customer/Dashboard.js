import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, couponAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([orderAPI.getMy(), couponAPI.getAll()])
      .then(([o, c]) => { setOrders(o.data.data); setCoupons(c.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const totalSaved = orders.reduce((s, o) => s + o.discount, 0);

  if (loading) return <><Topbar title="Dashboard" /><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="content-area">
        <div className="stats-grid">
          <div className="stat-card" style={{'--stat-color':'#ff6b35'}}>
            <div className="stat-icon">🛍</div>
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card" style={{'--stat-color':'#10b981'}}>
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{totalSaved}</div>
            <div className="stat-label">Total Saved</div>
          </div>
          <div className="stat-card" style={{'--stat-color':'#7c3aed'}}>
            <div className="stat-icon">🏷</div>
            <div className="stat-value">{coupons.length}</div>
            <div className="stat-label">Available Offers</div>
          </div>
        </div>

        <div className="two-col">
          <div>
            <div className="section-header"><div className="section-title">Recent Orders</div></div>
            <div className="table-card">
              {orders.length === 0
                ? <div className="empty-state"><div className="empty-icon">📦</div><div className="empty-text">No orders yet</div></div>
                : <table>
                    <thead><tr><th>Order ID</th><th>Date</th><th>Coupon</th><th>Saved</th><th>Total</th></tr></thead>
                    <tbody>
                      {orders.slice(0,5).map(o => (
                        <tr key={o._id}>
                          <td><span className="text-accent">#{o._id.slice(-6)}</span></td>
                          <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td>{o.couponCode ? <span className="badge badge-info">{o.couponCode}</span> : '—'}</td>
                          <td className="text-success">{o.discount ? `-₹${o.discount}` : '—'}</td>
                          <td><strong>₹{o.total}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>}
            </div>
          </div>
          <div>
            <div className="section-header"><div className="section-title">Hot Offers</div></div>
            <div className="table-card">
              {coupons.slice(0,4).map(c => (
                <div className="history-item" key={c._id}>
                  <div className="history-icon">🎫</div>
                  <div className="history-info">
                    <div className="history-code">{c.code}</div>
                    <div className="history-date">{c.description}</div>
                  </div>
                  <span className="badge badge-success">{c.type==='percent'?`${c.value}%`:`₹${c.value}`} OFF</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
