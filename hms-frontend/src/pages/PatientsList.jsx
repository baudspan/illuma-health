import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Plus, Loader2 } from 'lucide-react';
import AddPatientModal from '../components/AddPatientModal';

export default function PatientsList({ role = 'Doctor' }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPatients = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/patients')
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching patients:", err);
        setLoading(false);
      });
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to discharge and delete this patient?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/patients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPatients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);


  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Patient Directory</h1>
          <p className="label">Manage and view all {role === 'Nurse' ? 'admitted ' : ''}patient records.</p>
        </div>
        {role === 'Doctor' && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Admit New Patient
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input type="text" className="input-field" placeholder="Search by name, UHID, or phone number..." style={{ paddingLeft: '44px' }} />
          </div>
          <button className="btn btn-outline">
            <Filter size={18} /> Filters
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-background)' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '13px' }}>UHID</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '13px' }}>PATIENT NAME</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '13px' }}>TYPE</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '13px' }}>WARD / BED</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '13px' }}>STATUS</th>
                <th style={{ padding: '16px 24px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '16px', color: 'var(--color-text-muted)' }}>Loading real patient data from MySQL Database via FastAPI...</p>
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No patients found. Backend connection might be down.
                  </td>
                </tr>
              ) : patients.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>{p.id}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{p.age} Yrs • {p.gender}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      background: p.type === 'IPD' ? 'rgba(124, 107, 237, 0.1)' : 'rgba(0, 196, 159, 0.1)',
                      color: p.type === 'IPD' ? 'var(--color-primary)' : 'var(--color-success)'
                    }}>
                      {p.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>{p.ward}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      display: 'flex', alignItems: 'center', gap: '6px',
                      color: p.status === 'Critical' ? 'var(--color-error)' : p.status === 'Stable' ? 'var(--color-success)' : 'var(--color-warning)'
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button className="icon-btn" onClick={() => handleDeletePatient(p.id)} title="Delete/Discharge Patient">
                      <Trash2 size={18} color="var(--color-error)" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddPatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPatientAdded={fetchPatients} 
      />
    </div>
  );
}
