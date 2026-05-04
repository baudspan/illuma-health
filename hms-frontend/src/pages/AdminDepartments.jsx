import React, { useState, useEffect } from 'react';
import { Building } from 'lucide-react';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/departments')
      .then(r => r.json())
      .then(data => { setDepartments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '24px' }}>Hospital Departments</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {loading ? <p>Loading...</p> : departments.length === 0 ? <p className="text-muted">No departments found.</p> : departments.map((d, i) => (
          <div key={i} className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124, 107, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={24} color="var(--color-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>{d.Name}</h3>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{d.Doctor_Count} Doctor{d.Doctor_Count !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>{d.Description || 'No description available.'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
