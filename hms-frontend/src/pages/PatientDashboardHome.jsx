import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Utensils, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboardHome() {
  const patientId = 1;
  const navigate = useNavigate();
  const [vitals, setVitals] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [nextAppt, setNextAppt] = useState(null);

  useEffect(() => {
    // Fetch Vitals
    fetch(`http://localhost:8000/api/vitals/${patientId}`)
      .then(res => res.json())
      .then(data => {
        if(data && data.length > 0) setVitals(data[0]); // most recent
      });

    // Fetch Prescriptions
    fetch(`http://localhost:8000/api/prescriptions/${patientId}`)
      .then(res => res.json())
      .then(data => setPrescriptions(data));

    // Fetch Appointments
    fetch('http://localhost:8000/api/appointments')
      .then(res => res.json())
      .then(data => {
        const myAppts = data.filter(a => a.Patient_ID === patientId && a.Status === 'Scheduled');
        if(myAppts.length > 0) setNextAppt(myAppts[0]);
      });
  }, [patientId]);
  return (
    <div className="dashboard-home">
      <h1 style={{ marginBottom: '24px' }}>Hello, Suresh!</h1>
      
      {/* Patient Specific Grid */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--color-primary)' }}>
          <div className="stat-icon" style={{ background: 'rgba(124, 107, 237, 0.1)', color: 'var(--color-primary)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Next Appointment</span>
            <span className="stat-value" style={{ fontSize: '20px' }}>
              {nextAppt ? `${nextAppt.Appointment_Date} ${nextAppt.Appointment_Time}` : 'No upcoming appts'}
            </span>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(0, 196, 159, 0.1)', color: 'var(--color-success)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Recent Lab Report</span>
            <span className="stat-value" style={{ fontSize: '20px' }}>CBC - Normal</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(255, 177, 66, 0.1)', color: 'var(--color-warning)' }}>
            <Utensils size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Current Diet Plan</span>
            <span className="stat-value" style={{ fontSize: '20px' }}>Low Sodium Cardiac</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Main Content Left */}
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>My Prescriptions</h2>
          <div className="glass-panel" style={{ padding: '0' }}>
            {prescriptions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No active prescriptions.</div>
            ) : (
              prescriptions.slice(0, 2).map((p, idx) => (
                <div key={idx} style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                    {new Date(p.Date).toLocaleDateString()}
                  </div>
                  {p.Medications.map((m, mIdx) => (
                    <div key={mIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.Medicine_Name}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>{m.Dosage}</div>
                      </div>
                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Active</span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Right */}
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Health Summary</h2>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {vitals ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Blood Pressure</span>
                  <span style={{ fontWeight: 600 }}>{vitals.Blood_Pressure}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Heart Rate</span>
                  <span style={{ fontWeight: 600 }}>{vitals.Heart_Rate} bpm</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Temperature</span>
                  <span style={{ fontWeight: 600 }}>{vitals.Temperature} °C</span>
                </div>
              </>
            ) : (
              <p className="text-muted">No vitals recorded.</p>
            )}
            <button className="btn btn-outline" style={{ marginTop: '16px', width: '100%' }} onClick={() => navigate('/patient/records')}>
              <Heart size={16} /> View Full Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
