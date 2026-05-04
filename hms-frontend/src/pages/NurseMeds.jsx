import React, { useState, useEffect } from 'react';
import { Pill } from 'lucide-react';

export default function NurseMeds() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMeds = () => {
    fetch('http://localhost:8000/api/medications/schedule')
      .then(r => r.json())
      .then(data => { setMeds(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMeds(); }, []);

  const handleDispense = async (med) => {
    try {
      const invRes = await fetch('http://localhost:8000/api/inventory');
      const inventory = await invRes.json();
      const match = inventory.find(i => i.Item_Name.toLowerCase().includes(med.Medicine_Name.toLowerCase().split(' ')[0]));
      if (match) {
        await fetch('http://localhost:8000/api/dispense', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Prescription_ID: med.Prescription_ID, Item_ID: match.Item_ID, Quantity_Dispensed: 1 })
        });
        alert(`Dispensed ${med.Medicine_Name} for ${med.Patient_Name}`);
        fetchMeds();
      } else {
        alert(`${med.Medicine_Name} not found in inventory.`);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '24px' }}>Medications Schedule</h1>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-background)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>PATIENT</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>MEDICINE</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>DOSAGE</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>DURATION</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center' }}>Loading...</td></tr>
            ) : meds.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No medications scheduled.</td></tr>
            ) : meds.map((med, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>{med.Patient_Name}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pill size={16} color="var(--color-primary)" /> {med.Medicine_Name}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>{med.Dosage}</td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>{med.Duration || '-'}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => handleDispense(med)}>Dispense</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
