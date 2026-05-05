import React, { useState, useEffect } from 'react';
import { X, Activity, HeartPulse, Thermometer, Wind } from 'lucide-react';

export default function PatientVitalsModal({ isOpen, onClose, patientId }) {
  const [vitals, setVitals] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    Patient_ID: patientId || 1, // Default fallback
    Heart_Rate: '',
    Blood_Pressure: '',
    Temperature: '',
    Oxygen_Saturation: ''
  });

  const fetchVitals = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const resVitals = await fetch(`http://127.0.0.1:8000/api/vitals/${patientId}`);
      if (resVitals.ok) setVitals(await resVitals.json());

      const resPresc = await fetch(`http://127.0.0.1:8000/api/prescriptions/${patientId}`);
      if (resPresc.ok) setPrescriptions(await resPresc.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, Patient_ID: patientId || 1 }));
      fetchVitals();
    }
  }, [isOpen, patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ ...formData, Heart_Rate: '', Blood_Pressure: '', Temperature: '', Oxygen_Saturation: '' });
        fetchVitals();
      } else {
        alert('Failed to save vitals');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '32px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="var(--color-text-muted)" />
        </button>
        
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={24} color="var(--color-primary)" /> Health Summary & Vitals
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Left: Enter New Vitals */}
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Record New Vitals</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Heart Rate (bpm)</label>
                <div style={{ position: 'relative' }}>
                  <HeartPulse size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-error)' }} />
                  <input required type="number" name="Heart_Rate" value={formData.Heart_Rate} onChange={handleChange} className="input-field" style={{ paddingLeft: '44px' }} placeholder="e.g. 72" />
                </div>
              </div>
              
              <div>
                <label className="label">Blood Pressure (mmHg)</label>
                <input required type="text" name="Blood_Pressure" value={formData.Blood_Pressure} onChange={handleChange} className="input-field" placeholder="120/80" />
              </div>
              
              <div>
                <label className="label">Temperature (°C)</label>
                <div style={{ position: 'relative' }}>
                  <Thermometer size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-warning)' }} />
                  <input required type="number" step="0.1" name="Temperature" value={formData.Temperature} onChange={handleChange} className="input-field" style={{ paddingLeft: '44px' }} placeholder="37.0" />
                </div>
              </div>

              <div>
                <label className="label">Oxygen Saturation (%)</label>
                <div style={{ position: 'relative' }}>
                  <Wind size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }} />
                  <input required type="number" name="Oxygen_Saturation" value={formData.Oxygen_Saturation} onChange={handleChange} className="input-field" style={{ paddingLeft: '44px' }} placeholder="98" />
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Save Vitals</button>
            </form>
          </div>

          {/* Right: History */}
          <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Vitals History</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? <p>Loading...</p> : vitals.length === 0 ? <p className="text-muted">No vitals recorded.</p> : vitals.map(v => (
                  <div key={v.Vital_ID} style={{ padding: '12px', background: 'var(--color-background)', borderRadius: '8px', fontSize: '14px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--color-primary)' }}>
                      {new Date(v.Recorded_At).toLocaleString()}
                    </div>
                    <div>HR: {v.Heart_Rate} bpm | BP: {v.Blood_Pressure} | Temp: {v.Temperature}°C | SpO2: {v.Oxygen_Saturation}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Past Prescriptions</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? <p>Loading...</p> : prescriptions.length === 0 ? <p className="text-muted">No prescriptions found.</p> : prescriptions.map(p => (
                  <div key={p.Prescription_ID} style={{ padding: '12px', background: 'var(--color-background)', borderRadius: '8px', fontSize: '14px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--color-success)' }}>
                      {p.Date ? new Date(p.Date).toLocaleString() : 'Recent'}
                    </div>
                    <div style={{ fontStyle: 'italic', marginBottom: '8px' }}>Notes: {p.Notes}</div>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      {p.Medications.map((m, idx) => (
                        <li key={idx}>{m.Medicine_Name} - {m.Dosage}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
