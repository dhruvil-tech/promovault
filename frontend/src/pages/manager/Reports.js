import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { reportAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';

const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'#111118', border:'1px solid #2a2a35', borderRadius:8, padding:'10px 14px', fontFamily:'DM Mono, monospace', fontSize:12 }}>
        <p style={{ color:'#9090a0', marginBottom:4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.name==='Revenue'?'₹':''}{p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [monthly, setMonthly] = useState([]);
  const [perf, setPerf]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportAPI.monthly(), reportAPI.performance()])
      .then(([m, p]) => {
        const chartData = m.data.data.map(d => ({
          name: `${MONTH_NAMES[d._id.month]} ${d._id.year}`,
          Orders: d.orders, Revenue: d.revenue, Discounts: d.discounts,
        }));
        setMonthly(chartData);
        setPerf(p.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar title="Performance Report" /><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="Performance Report" />
      <div className="content-area">
        <div className="two-col" style={{ marginBottom: 24 }}>
          <div>
            <div className="section-header"><div className="section-title">Monthly Orders</div></div>
            <div className="card card-pad">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                  <XAxis dataKey="name" tick={{ fill:'#606070', fontSize:11, fontFamily:'DM Mono' }} />
                  <YAxis tick={{ fill:'#606070', fontSize:11, fontFamily:'DM Mono' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Orders" fill="#ff6b35" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="section-header"><div className="section-title">Monthly Revenue vs Discounts</div></div>
            <div className="card card-pad">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                  <XAxis dataKey="name" tick={{ fill:'#606070', fontSize:11, fontFamily:'DM Mono' }} />
                  <YAxis tick={{ fill:'#606070', fontSize:11, fontFamily:'DM Mono' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Revenue"   fill="#7c3aed" radius={[4,4,0,0]} />
                  <Bar dataKey="Discounts" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="section-header"><div className="section-title">Coupon Usage Breakdown</div></div>
        <div className="table-card">
          <table>
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Used</th><th>Limit</th><th>Usage Rate</th><th>Status</th></tr></thead>
            <tbody>
              {perf.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.type === 'percent' ? 'Percent' : 'Flat'}</td>
                  <td className="text-accent">{c.type==='percent'?`${c.value}%`:`₹${c.value}`}</td>
                  <td>{c.usedCount}</td>
                  <td>{c.usageLimit}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="progress-bar" style={{width:80}}>
                        <div className="progress-fill" style={{width:`${c.usageRate}%`}} />
                      </div>
                      <span style={{fontSize:11,color:'var(--text3)'}}>{c.usageRate}%</span>
                    </div>
                  </td>
                  <td>
                    {c.isExpired ? <span className="badge badge-danger">Expired</span>
                     : c.isActive ? <span className="badge badge-success">Active</span>
                     : <span className="badge badge-neutral">Inactive</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
