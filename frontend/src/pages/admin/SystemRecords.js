import React, { useEffect, useState } from 'react';
import { userAPI, couponAPI, orderAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';

export default function SystemRecords() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Build an activity log from users, coupons, orders
    Promise.all([userAPI.getAll(), couponAPI.getAll(), orderAPI.getAll()])
      .then(([u, c, o]) => {
        const entries = [];

        u.data.data.forEach(user => entries.push({
          time: new Date(user.createdAt),
          event: `User "${user.name}" registered`,
          actor: 'System',
          type: 'success',
        }));

        c.data.data.forEach(coupon => entries.push({
          time: new Date(coupon.createdAt),
          event: `Coupon "${coupon.code}" created (${coupon.type === 'percent' ? coupon.value + '%' : '₹' + coupon.value} off)`,
          actor: coupon.createdBy?.name || 'Manager',
          type: 'info',
        }));

        o.data.data.forEach(order => entries.push({
          time: new Date(order.createdAt),
          event: `Order #${order._id.slice(-6)} placed${order.couponCode ? ` with coupon "${order.couponCode}"` : ''} — ₹${order.total}`,
          actor: order.user?.name || 'Customer',
          type: 'success',
        }));

        // Sort newest first
        entries.sort((a, b) => b.time - a.time);
        setLogs(entries);
      })
      .finally(() => setLoading(false));
  }, []);

  const typeColor = { success: 'badge-success', info: 'badge-info', warning: 'badge-warning', danger: 'badge-danger' };

  if (loading) return <><Topbar title="System Records" /><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="System Records" />
      <div className="content-area">
        <div className="table-card">
          <table>
            <thead>
              <tr><th>Timestamp</th><th>Event</th><th>Actor</th><th>Type</th></tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={4} style={{textAlign:'center',padding:40,color:'var(--text3)'}}>No records yet</td></tr>
              )}
              {logs.map((log, i) => (
                <tr key={i}>
                  <td style={{fontSize:12,color:'var(--text3)',whiteSpace:'nowrap'}}>
                    {log.time.toLocaleDateString()} {log.time.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                  </td>
                  <td style={{fontSize:13}}>{log.event}</td>
                  <td style={{fontSize:12,color:'var(--text2)'}}>{log.actor}</td>
                  <td><span className={`badge ${typeColor[log.type] || 'badge-neutral'}`}>{log.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
