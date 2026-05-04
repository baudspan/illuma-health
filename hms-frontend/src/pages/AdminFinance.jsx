import React, { useState, useEffect } from 'react';
import { TrendingUp, CreditCard } from 'lucide-react';

export default function AdminFinance() {
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/finance/summary')
      .then(r => r.json())
      .then(data => { setFinance(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><p>Loading financial data...</p></div>;

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '24px' }}>Financials & Billing</h1>

      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--color-success)' }}>
          <div className="stat-icon" style={{ background: 'rgba(0, 196, 159, 0.1)', color: 'var(--color-success)' }}><TrendingUp size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Total Billed</span>
            <span className="stat-value" style={{ fontSize: '20px' }}>₹{finance?.Total_Billed?.toLocaleString() || 0}</span>
          </div>
        </div>
        <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--color-primary)' }}>
          <div className="stat-icon" style={{ background: 'rgba(124, 107, 237, 0.1)', color: 'var(--color-primary)' }}><CreditCard size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Total Collected</span>
            <span className="stat-value" style={{ fontSize: '20px' }}>₹{finance?.Total_Collected?.toLocaleString() || 0}</span>
          </div>
        </div>
        <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--color-error)' }}>
          <div className="stat-icon" style={{ background: 'rgba(255, 77, 109, 0.1)', color: 'var(--color-error)' }}><TrendingUp size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Outstanding</span>
            <span className="stat-value text-error" style={{ fontSize: '20px' }}>₹{finance?.Outstanding?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Billing Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ padding: '24px', background: 'var(--color-background)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--color-warning)' }}>{finance?.Pending_Bills || 0}</div>
            <div className="label">Pending Bills</div>
          </div>
          <div style={{ padding: '24px', background: 'var(--color-background)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--color-success)' }}>{finance?.Paid_Bills || 0}</div>
            <div className="label">Paid Bills</div>
          </div>
        </div>
      </div>
    </div>
  );
}
