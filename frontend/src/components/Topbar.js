import React from 'react';

export default function Topbar({ title, children }) {
  return (
    <div className="topbar">
      <div className="page-title">{title}</div>
      <div className="topbar-actions">{children}</div>
    </div>
  );
}
