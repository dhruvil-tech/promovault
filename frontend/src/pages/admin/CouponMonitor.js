import React, { useEffect, useState } from 'react';
import { couponAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';
import { statusBadge } from '../../components/Badges';
import toast from 'react-hot-toast';

export default function CouponMonitor() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => couponAPI.getAll().then(r => setCoupons(r.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleToggle = async (id, code, active) => {
    try {
      await couponAPI.toggle(id);
      toast.success(`Coupon "${code}" ${active ? 'disabled' : 'enabled'}.`);
      load();
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    try {
      await couponAPI.remove(id);
      toast.success(`Coupon "${code}" deleted.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <><Topbar title="Coupon Monitor" /><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="Coupon Monitor" />
      <div className="content-area">
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Code</th><th>Description</th><th>Discount</th><th>Min Order</th>
                <th>Uses</th><th>Limit</th><th>Expiry</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong></td>
                  <td className="text-muted" style={{fontSize:12,maxWidth:160}}>{c.description}</td>
                  <td className="text-accent">{c.type==='percent'?`${c.value}%`:`₹${c.value}`}</td>
                  <td>{c.minOrder > 0 ? `₹${c.minOrder}` : '—'}</td>
                  <td>{c.usedCount}</td>
                  <td>{c.usageLimit}</td>
                  <td style={{fontSize:12}}>{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td>{statusBadge(c)}</td>
                  <td style={{display:'flex',gap:6}}>
                    <button className="btn btn-sm" onClick={() => handleToggle(c._id, c.code, c.isActive)}>
                      {c.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id, c.code)}>
                      Delete
                    </button>
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
