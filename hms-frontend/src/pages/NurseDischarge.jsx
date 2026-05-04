import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';

export default function NurseDischarge() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = () => {
    fetch('http://localhost:8000/api/admissions/discharge-queue')
      .then(r => r.json())
      .then(data => { setQueue(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleDischarge = async (admissionId, patientName) => {
    if (!window.confirm(`Confirm discharge for ${patientName}?`)) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admissions/${admissionId}/discharge`, { method: 'PUT' });
      if (res.ok) {
        alert(`${patientName} discharged successfully.`);
        fetchQueue();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '24px' }}>Discharge Queue</h1>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-background)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>PATIENT</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>ROOM</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>ADMITTED ON</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center' }}>Loading...</td></tr>
            ) : queue.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No patients in discharge queue.</td></tr>
            ) : queue.map((q, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>{q.Patient_Name} (ID: {q.Patient_ID})</td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>{q.Room}</td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>{q.Admit_Date ? new Date(q.Admit_Date).toLocaleDateString() : 'N/A'}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12px', borderColor: 'var(--color-success)', color: 'var(--color-success)' }} onClick={() => handleDischarge(q.Admission_ID, q.Patient_Name)}>
                    <CheckCircle size={14} style={{ marginRight: '4px' }} /> Discharge
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
