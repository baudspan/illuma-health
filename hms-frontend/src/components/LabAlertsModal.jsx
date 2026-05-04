import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function LabAlertsModal({ isOpen, onClose }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px', position: 'relative', maxHeight: '80vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="var(--color-text-muted)" />
        </button>
        
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)' }}>
          <AlertCircle size={24} /> Abnormal Lab Alerts
        </h2>

        {loading ? (
          <p>Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p className="text-muted">No abnormal lab alerts currently.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map((alert, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'rgba(255, 77, 109, 0.05)', border: '1px solid rgba(255, 77, 109, 0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{alert.Patient_Name} (ID: {alert.Patient_ID})</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {alert.Result_Date ? new Date(alert.Result_Date).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div style={{ color: 'var(--color-error)', fontWeight: 500 }}>
                  {alert.Test_Name}: {alert.Result_Value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
