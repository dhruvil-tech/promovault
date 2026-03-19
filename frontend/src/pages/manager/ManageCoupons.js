import React, { useEffect, useState } from 'react';
import { couponAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';
import { statusBadge } from '../../components/Badges';
import toast from 'react-hot-toast';

const EMPTY_FORM = { code:'', description:'', type:'percent', value:'', minOrder:'0', usageLimit:'', expiryDate:'' };

export default function ManageCoupons() {
  const [coupons, setCoupons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'create' | couponObj
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = () => couponAPI.getAll().then(r => setCoupons(r.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
  const openEdit   = (c)  => { setForm({ code: c.code, description: c.description, type: c.type, value: c.value, minOrder: c.minOrder, usageLimit: c.usageLimit, expiryDate: c.expiryDate.slice(0,10) }); setError(''); setModal(c); };

  const handleSave = async () => {
    setError('');
    const { code, description, type, value, minOrder, usageLimit, expiryDate } = form;
    if (!description || !value || !usageLimit || !expiryDate) return setError('All fields are required.');
    if (modal === 'create' && !code) return setError('Coupon code is required.');
    setSaving(true);
    try {
      if (modal === 'create') {
        await couponAPI.create({ code, description, type, value: Number(value), minOrder: Number(minOrder||0), usageLimit: Number(usageLimit), expiryDate });
        toast.success(`Coupon "${code}" created!`);
      } else {
        await couponAPI.update(modal._id, { description, type, value: Number(value), minOrder: Number(minOrder||0), usageLimit: Number(usageLimit), expiryDate });
        toast.success(`Coupon updated!`);
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    await couponAPI.toggle(id);
    toast.success('Coupon status updated');
    load();
  };

  if (loading) return <><Topbar title="Manage Coupons"><button className="btn btn-accent" onClick={openCreate}>+ Create Coupon</button></Topbar><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="Manage Coupons">
        <button className="btn btn-accent" onClick={openCreate}>+ Create Coupon</button>
      </Topbar>
      <div className="content-area">
        <div className="table-card">
          <table>
            <thead><tr><th>Code</th><th>Description</th><th>Discount</th><th>Min Order</th><th>Expiry</th><th>Usage</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong></td>
                  <td className="text-muted" style={{fontSize:12}}>{c.description}</td>
                  <td className="text-accent">{c.type==='percent'?`${c.value}%`:`₹${c.value}`}</td>
                  <td>{c.minOrder > 0 ? `₹${c.minOrder}` : '—'}</td>
                  <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td>{c.usedCount}/{c.usageLimit}</td>
                  <td>{statusBadge(c)}</td>
                  <td style={{display:'flex',gap:6}}>
                    <button className="btn btn-sm" onClick={() => handleToggle(c._id)}>{c.isActive?'Deactivate':'Activate'}</button>
                    <button className="btn btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && setModal(null)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="modal-title">{modal === 'create' ? 'Create New Coupon' : `Edit: ${modal.code}`}</div>
            {error && <div className="error-msg">{error}</div>}

            {modal === 'create' && (
              <div className="form-group">
                <label className="form-label">Coupon Code</label>
                <input className="form-input" placeholder="SAVE20" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Short description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Discount Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="percent">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Value</label>
                <input className="form-input" type="number" placeholder="20" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Min Order (₹)</label>
                <input className="form-input" type="number" placeholder="0" value={form.minOrder} onChange={e => setForm({...form, minOrder: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Usage Limit</label>
                <input className="form-input" type="number" placeholder="100" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input className="form-input" type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} />
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : modal==='create'?'Create':'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
