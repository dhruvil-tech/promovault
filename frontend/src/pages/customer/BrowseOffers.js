import React, { useEffect, useState } from 'react';
import { couponAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';
import toast from 'react-hot-toast';

export default function BrowseOffers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = (searchQuery = '', pageNum = 1) => {
    setLoading(true);
    couponAPI.getAll({ search: searchQuery, page: pageNum, limit: 9 })
      .then(r => {
        setCoupons(r.data.data);
        setPage(r.data.page);
        setPages(r.data.pages);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(search, page); }, []);

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    toast.success(`Code "${code}" copied!`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(search, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setPage(newPage);
      load(search, newPage);
    }
  };

  if (loading) return <><Topbar title="Browse Offers" /><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="Browse Offers" />
      <div className="content-area">
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input
            className="form-input"
            placeholder="Search by code or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
          <button className="btn btn-accent" onClick={handleSearch}>Search</button>
          {search && <button className="btn" onClick={() => { setSearch(''); load('', 1); }}>Clear</button>}
        </div>

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
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 20 }}>
            <button className="btn btn-sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>Page {page} of {pages} ({total} total)</span>
            <button className="btn btn-sm" onClick={() => handlePageChange(page + 1)} disabled={page === pages}>Next</button>
          </div>
        )}
      </div>
    </>
  );
}
