import React from 'react';

export function statusBadge(coupon) {
  const expired   = new Date(coupon.expiryDate) < new Date();
  const exhausted = coupon.usedCount >= coupon.usageLimit;
  if (!coupon.isActive)  return <span className="badge badge-neutral">Inactive</span>;
  if (expired)           return <span className="badge badge-danger">Expired</span>;
  if (exhausted)         return <span className="badge badge-warning">Exhausted</span>;
  return                        <span className="badge badge-success">Active</span>;
}

export function roleBadge(role) {
  const map = { admin: 'badge-danger', manager: 'badge-info', customer: 'badge-neutral' };
  return <span className={`badge ${map[role] || 'badge-neutral'}`}>{role}</span>;
}
