import React, { useEffect, useState } from 'react';
import { reportAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';
import { statusBadge } from '../../components/Badges';

export default function ManagerDashboard() {
  const [summary, setSummary]   = useState(null);
  const [perf, setPerf]         = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([reportAPI.summary(), reportAPI.performance()])
      .then(([s, p]) => { setSummary(s.data.data); setPerf(p.data.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar title="Dashboard" /><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="content-area">
        <div className="stats-grid">
          <div className="stat-card" style={{'--stat-color':'#ff6b35'}}>
            <div className="stat-icon">🎟</div>
            <div className="stat-value">{summary?.totalCoupons || 0}</div>
            <div className="stat-label">Total Coupons</div>
          </div>
          <div className="stat-card" style={{'--stat-color':'#10b981'}}>
            <div className="stat-icon">📦</div>
            <div className="stat-value">{summary?.totalOrders || 0}</div>
            <div className="stat-label">Orders</div>
          </div>
          <div className="stat-card" style={{'--stat-color':'#f59e0b'}}>
            <div className="stat-icon">💸</div>
            <div className="stat-value">₹{summary?.totalDiscount || 0}</div>
            <div className="stat-label">Discounts Given</div>
          </div>
          <div className="stat-card" style={{'--stat-color':'#7c3aed'}}>
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{summary?.totalRevenue || 0}</div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>

        <div className="section-header"><div className="section-title">Coupon Performance</div></div>
        <div className="table-card">
          <table>
            <thead>
              <tr><th>Code</th><th>Type</th><th>Value</th><th>Used / Limit</th><th>Rate</th><th>Expiry</th><th>Status</th></tr>
            </thead>
            <tbody>
              {perf.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.type === 'percent' ? 'Percent' : 'Flat'}</td>
                  <td className="text-accent">{c.type==='percent'?`${c.value}%`:`₹${c.value}`}</td>
                  <td>{c.usedCount} / {c.usageLimit}</td>
                  <td>
                    <div className="progress-bar" style={{width:80}}>
                      <div className="progress-fill" style={{width:`${c.usageRate}%`}} />
                    </div>
                  </td>
                  <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td>{statusBadge(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
