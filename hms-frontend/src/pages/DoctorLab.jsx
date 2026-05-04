import React, { useState, useEffect } from 'react';
import { Microscope, Search, CheckCircle } from 'lucide-react';

export default function DoctorLab() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/labs/catalog')
      .then(res => res.json())
      .then(data => {
        setCatalog(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleOrderTest = async (testId, testName) => {
    const patientId = window.prompt(`Enter Patient ID to order '${testName}':`);
    if (!patientId) return;

    try {
      const res = await fetch('http://localhost:8000/api/labs/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Patient_ID: parseInt(patientId), Doctor_ID: 1, Test_ID: testId })
      });
      if (res.ok) {
        alert('Lab test ordered successfully!');
      } else {
        alert('Failed to order lab test.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Lab & Diagnostics</h1>
          <p className="label">Browse test catalog and view diagnostic reports.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input type="text" className="input-field" placeholder="Search test catalog..." style={{ paddingLeft: '44px' }} />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-background)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>TEST NAME</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>DESCRIPTION</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>COST ($)</th>
              <th style={{ padding: '16px 24px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center' }}>Loading catalog...</td></tr>
            ) : catalog.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Catalog empty.</td></tr>
            ) : catalog.map((test, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Microscope size={16} color="var(--color-primary)" /> {test.Test_Name}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>{test.Description || 'Standard procedure'}</td>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>${test.Cost}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOrderTest(test.Test_ID, test.Test_Name)}>
                    Order Test
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
