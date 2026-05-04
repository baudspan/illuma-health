import React, { useState, useEffect } from 'react';
import { Building, Users, CreditCard, TrendingUp } from 'lucide-react';

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({ Total_Patients: 0, Total_Staff: 0, Occupancy_Pct: 0, Total_Departments: 0 });
  const [finance, setFinance] = useState({ Total_Billed: 0, Total_Collected: 0, Outstanding: 0 });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/admin/stats').then(r => r.json()),
      fetch('http://localhost:8000/api/finance/summary').then(r => r.json()),
      fetch('http://localhost:8000/api/departments').then(r => r.json())
    ]).then(([s, f, d]) => {
      setStats(s);
      setFinance(f);
      setDepartments(d.slice(0, 5));
    }).catch(console.error);
  }, []);

  return (
    <div className="dashboard-home">
      <h1 style={{ marginBottom: '24px' }}>Hospital Overview</h1>
      
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--color-primary)' }}>
          <div className="stat-icon" style={{ background: 'rgba(124, 107, 237, 0.1)', color: 'var(--color-primary)' }}>
            <Building size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Occupancy</span>
            <span className="stat-value">{stats.Occupancy_Pct}%</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(0, 196, 159, 0.1)', color: 'var(--color-success)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value" style={{ fontSize: '20px' }}>₹{finance.Total_Collected.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(255, 177, 66, 0.1)', color: 'var(--color-warning)' }}>
            <Users size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Staff on Duty</span>
            <span className="stat-value">{stats.Total_Staff}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Department Status</h2>
          <div className="glass-panel" style={{ padding: '0' }}>
            {departments.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No departments found.</div>
            ) : departments.map((d, i) => (
              <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{d.Name}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{d.Doctor_Count} Doctors</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Financial Summary</h2>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Billed</span>
              <span style={{ fontWeight: 600 }}>₹{finance.Total_Billed.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Collected</span>
              <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>₹{finance.Total_Collected.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Outstanding</span>
              <span style={{ fontWeight: 600, color: 'var(--color-error)' }}>₹{finance.Outstanding.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Patients</span>
              <span style={{ fontWeight: 600 }}>{stats.Total_Patients}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
