import React, { useState, useEffect } from 'react';
import { Activity, FileText } from 'lucide-react';

export default function PatientRecords() {
  const patientId = 1; // Logged in patient mock
  const [vitals, setVitals] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resVitals, resPresc] = await Promise.all([
          fetch(`http://localhost:8000/api/vitals/${patientId}`),
          fetch(`http://localhost:8000/api/prescriptions/${patientId}`)
        ]);
        if (resVitals.ok) setVitals(await resVitals.json());
        if (resPresc.ok) setPrescriptions(await resPresc.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Clinical Records</h1>
        <p className="label">View your recent vitals and doctor prescriptions.</p>
      </div>

      {loading ? <p>Loading records...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--color-primary)" /> Vitals History
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vitals.length === 0 ? <p className="text-muted">No vitals recorded.</p> : vitals.map(v => (
                <div key={v.Vital_ID} className="glass-panel" style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary)' }}>
                    {new Date(v.Recorded_At).toLocaleString()}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                    <div>Heart Rate: <span style={{ fontWeight: 500 }}>{v.Heart_Rate} bpm</span></div>
                    <div>Blood Pressure: <span style={{ fontWeight: 500 }}>{v.Blood_Pressure}</span></div>
                    <div>Temp: <span style={{ fontWeight: 500 }}>{v.Temperature}°C</span></div>
                    <div>SpO2: <span style={{ fontWeight: 500 }}>{v.Oxygen_Saturation}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="var(--color-success)" /> My Prescriptions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {prescriptions.length === 0 ? <p className="text-muted">No prescriptions found.</p> : prescriptions.map(p => (
                <div key={p.Prescription_ID} className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--color-success)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                    {p.Date ? new Date(p.Date).toLocaleString() : 'Recent Consultation'}
                  </div>
                  <div style={{ fontStyle: 'italic', marginBottom: '12px', color: 'var(--color-text-muted)' }}>"{p.Notes}"</div>
                  <div style={{ background: 'var(--color-background)', padding: '12px', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Medications</h4>
                    <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px' }}>
                      {p.Medications.map((m, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}><span style={{ fontWeight: 500 }}>{m.Medicine_Name}</span> ({m.Dosage})</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
