import React, { useState, useEffect } from 'react';
import { ActivitySquare, Search } from 'lucide-react';
import PatientVitalsModal from '../components/PatientVitalsModal';

export default function NurseVitals() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/patients')
      .then(r => r.json())
      .then(data => { setPatients(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  const openVitals = (patientId) => {
    const numId = parseInt(patientId.replace('ILL-', ''));
    setSelectedPatientId(numId);
    setIsVitalsOpen(true);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Vitals Entry</h1>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: '36px', width: '280px' }} placeholder="Search patient..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-background)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>UHID</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>NAME</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>STATUS</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No patients found.</td></tr>
            ) : filtered.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>{p.id}</td>
                <td style={{ padding: '16px 24px' }}>{p.name}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    background: p.status === 'Stable' ? 'rgba(0, 196, 159, 0.1)' : 'rgba(255, 77, 109, 0.1)', 
                    color: p.status === 'Stable' ? 'var(--color-success)' : 'var(--color-error)' 
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => openVitals(p.id)}>
                    <ActivitySquare size={14} style={{ marginRight: '4px' }} /> Record Vitals
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PatientVitalsModal isOpen={isVitalsOpen} onClose={() => setIsVitalsOpen(false)} patientId={selectedPatientId} />
    </div>
  );
}
