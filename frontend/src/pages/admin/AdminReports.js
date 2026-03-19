import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { reportAPI, orderAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';

const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'#111118', border:'1px solid #2a2a35', borderRadius:8, padding:'10px 14px', fontFamily:'DM Mono, monospace', fontSize:12 }}>
        <p style={{ color:'#9090a0', marginBottom:4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {['Revenue','Discounts'].includes(p.name)?'₹':''}{p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminReports() {
  const [summary, setSummary]   = useState(null);
  const [monthly, setMonthly]   = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([reportAPI.summary(), reportAPI.monthly(), orderAPI.getAll()])
      .then(([s, m, o]) => {
        setSummary(s.data.data);
        setMonthly(m.data.data.map(d => ({
          name: `${MONTH_NAMES[d._id.month]} ${String(d._id.year).slice(2)}`,
          Orders: d.orders, Revenue: d.revenue, Discounts: d.discounts,
        })));
        setOrders(o.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const avgDiscount = orders.length
    ? Math.round(orders.reduce((s,o) => s + o.discount, 0) / orders.length)
    : 0;

  if (loading) return <><Topbar title="Discount Reports" /><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="Discount Reports" />
      <div className="content-area">
        <div className="stats-grid" style={{marginBottom:28}}>
          <div className="stat-card" style={{'--stat-color':'#ff6b35'}}>
            <div className="stat-icon">📦</div>
            <div className="stat-value">{summary?.totalOrders || 0}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card" style={{'--stat-color':'#10b981'}}>
            <div className="stat-icon">💸</div>
            <div className="stat-value">₹{summary?.totalDiscount || 0}</div>
            <div className="stat-label">Total Discounts</div>
          </div>
          <div className="stat-card" style={{'--stat-color':'#7c3aed'}}>
            <div className="stat-icon">📊</div>
            <div className="stat-value">₹{avgDiscount}</div>
            <div className="stat-label">Avg Discount/Order</div>
          </div>
          <div className="stat-card" style={{'--stat-color':'#f59e0b'}}>
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{summary?.totalRevenue || 0}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="section-header"><div className="section-title">Revenue vs Discounts (Monthly)</div></div>
        <div className="card card-pad" style={{marginBottom:24}}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
              <XAxis dataKey="name" tick={{ fill:'#606070', fontSize:11, fontFamily:'DM Mono' }} />
              <YAxis tick={{ fill:'#606070', fontSize:11, fontFamily:'DM Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontFamily:'DM Mono', fontSize:12, paddingTop:12 }} />
              <Bar dataKey="Revenue"   fill="#7c3aed" radius={[4,4,0,0]} />
              <Bar dataKey="Discounts" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="Orders"    fill="#ff6b35" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="section-header"><div className="section-title">All Orders</div></div>
        <div className="table-card">
          <table>
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Subtotal</th><th>Coupon</th><th>Discount</th><th>Total</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td><span className="text-accent">#{o._id.slice(-6)}</span></td>
                  <td>{o.user?.name || '—'}</td>
                  <td style={{fontSize:12,color:'var(--text3)'}}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>₹{o.subtotal}</td>
                  <td>{o.couponCode ? <span className="badge badge-info">{o.couponCode}</span> : '—'}</td>
                  <td className="text-success">{o.discount ? `-₹${o.discount}` : '—'}</td>
                  <td><strong>₹{o.total}</strong></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'var(--text3)'}}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
