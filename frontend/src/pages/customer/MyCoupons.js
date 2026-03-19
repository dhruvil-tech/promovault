import React, { useEffect, useState } from 'react';
import { orderAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';

export default function MyCoupons() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMy()
      .then(r => setOrders(r.data.data.filter(o => o.couponCode)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar title="My Coupon History" /><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="My Coupon History" />
      <div className="content-area">
        <div className="table-card">
          {orders.length === 0
            ? <div className="empty-state"><div className="empty-icon">🎫</div><div className="empty-text">No coupons used yet. Browse offers and shop!</div></div>
            : orders.map(o => (
                <div className="history-item" key={o._id}>
                  <div className="history-icon">🎫</div>
                  <div className="history-info">
                    <div className="history-code">{o.couponCode}</div>
                    <div className="history-date">Order #{o._id.slice(-6)} · {new Date(o.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="history-amount">-₹{o.discount}</div>
                </div>
              ))}
        </div>
      </div>
    </>
  );
}
