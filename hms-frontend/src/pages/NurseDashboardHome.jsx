import React, { useState, useEffect } from 'react';
import { Users, ActivitySquare, Pill, AlertTriangle } from 'lucide-react';
import PatientVitalsModal from '../components/PatientVitalsModal';

export default function NurseDashboardHome() {
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [stats, setStats] = useState({ admitted: 0, meds: 0, discharge: 0 });
  const [medSchedule, setMedSchedule] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/admissions').then(r => r.json()),
      fetch('http://localhost:8000/api/medications/schedule').then(r => r.json()),
      fetch('http://localhost:8000/api/admissions/discharge-queue').then(r => r.json())
    ]).then(([admissions, meds, discharge]) => {
      setStats({
        admitted: admissions.filter(a => a.Status === 'Admitted').length,
        meds: meds.length,
        discharge: discharge.length
      });
      setMedSchedule(meds.slice(0, 4));
    }).catch(console.error);
  }, []);

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
      } else {
        alert(`${med.Medicine_Name} not found in inventory. Request pharmacist.`);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="dashboard-home">
      <h1 style={{ marginBottom: '24px' }}>General Ward - Morning Shift</h1>
      
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--color-primary)' }}>
          <div className="stat-icon" style={{ background: 'rgba(124, 107, 237, 0.1)', color: 'var(--color-primary)' }}>
            <Users size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Admitted Patients</span>
            <span className="stat-value">{stats.admitted}</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(0, 196, 159, 0.1)', color: 'var(--color-success)' }}>
            <Pill size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Medications Due</span>
            <span className="stat-value">{stats.meds}</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--color-error)' }}>
          <div className="stat-icon" style={{ background: 'rgba(255, 77, 109, 0.1)', color: 'var(--color-error)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Pending Discharge</span>
            <span className="stat-value text-error">{stats.discharge}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Medication Schedule</h2>
          <div className="glass-panel" style={{ padding: '0' }}>
            {medSchedule.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No medications scheduled.</div>
            ) : medSchedule.map((med, idx) => (
              <div key={idx} style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{med.Patient_Name} (ID: {med.Patient_ID})</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>{med.Medicine_Name} - {med.Dosage}</div>
                </div>
                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => handleDispense(med)}>Dispense</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Tasks</h2>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => { setSelectedPatientId(1); setIsVitalsOpen(true); }}>
              <ActivitySquare size={18} /> Record Vitals
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/nurse/discharge'}>
              <AlertTriangle size={18} /> Discharge Queue
            </button>
          </div>
        </div>
      </div>

      <PatientVitalsModal 
        isOpen={isVitalsOpen} 
        onClose={() => setIsVitalsOpen(false)} 
        patientId={selectedPatientId} 
      />
    </div>
  );
}
