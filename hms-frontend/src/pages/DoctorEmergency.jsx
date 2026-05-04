import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

export default function DoctorEmergency() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/labs/alerts')
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ marginBottom: '8px', color: 'var(--color-error)' }}>Emergency & Alerts</h1>
          <p className="label">Critical abnormal lab results requiring immediate attention.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {loading ? (
          <p>Loading emergency alerts...</p>
        ) : alerts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No Critical Alerts</h3>
            <p>All monitored patients are stable.</p>
          </div>
        ) : alerts.map((alert, i) => (
          <div key={i} className="glass-panel" style={{ borderLeft: '4px solid var(--color-error)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '18px' }}>{alert.Patient_Name}</span>
                <span className="label">UHID: {alert.Patient_ID}</span>
              </div>
              <div style={{ color: 'var(--color-error)', fontWeight: 500 }}>
                Critical {alert.Test_Name} Result: {alert.Result_Value}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', marginBottom: '12px', fontSize: '14px', justifyContent: 'flex-end' }}>
                <Clock size={14} /> {alert.Result_Date ? new Date(alert.Result_Date).toLocaleString() : 'N/A'}
              </div>
              <button className="btn btn-outline" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
                Acknowledge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
