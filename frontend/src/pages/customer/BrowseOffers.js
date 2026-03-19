import React, { useEffect, useState } from 'react';
import { couponAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';
import toast from 'react-hot-toast';

export default function BrowseOffers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    couponAPI.getAll()
      .then(r => setCoupons(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    toast.success(`Code "${code}" copied!`);
  };

  if (loading) return <><Topbar title="Browse Offers" /><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="Browse Offers" />
      <div className="content-area">
        {coupons.length === 0
          ? <div className="empty-state"><div className="empty-icon">🏷</div><div className="empty-text">No active offers right now</div></div>
          : <div className="coupons-grid">
              {coupons.map(c => (
                <div className="coupon-card" key={c._id}>
                  <div className="coupon-stripe" />
                  <div className="coupon-body">
                    <div className="coupon-code">{c.code}</div>
                    <div className="coupon-desc">{c.description}</div>
                    <div className="coupon-meta">
                      <div>
                        <div className="coupon-meta-label">Discount</div>
                        <div className="coupon-meta-value text-accent">{c.type==='percent'?`${c.value}% OFF`:`₹${c.value} OFF`}</div>
                      </div>
                      <div>
                        <div className="coupon-meta-label">Min Order</div>
                        <div className="coupon-meta-value">{c.minOrder > 0 ? `₹${c.minOrder}` : 'No minimum'}</div>
                      </div>
                      <div>
                        <div className="coupon-meta-label">Valid Till</div>
                        <div className="coupon-meta-value">{new Date(c.expiryDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="coupon-meta-label">Remaining</div>
                        <div className="coupon-meta-value">{c.usageLimit - c.usedCount} uses</div>
                      </div>
                    </div>
                    <div className="coupon-footer">
                      <div>
                        <div className="progress-label">Usage: {c.usedCount}/{c.usageLimit}</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${Math.round(c.usedCount/c.usageLimit*100)}%` }} />
                        </div>
                      </div>
                      <button className="btn btn-accent btn-sm" onClick={() => copyCode(c.code)}>Copy Code</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>}
      </div>
    </>
  );
}
