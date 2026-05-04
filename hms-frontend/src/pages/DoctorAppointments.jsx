import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = () => {
    fetch('http://localhost:8000/api/appointments')
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:8000/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>My Appointments</h1>
          <p className="label">Manage your daily consultation schedule.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-background)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>PATIENT</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>DATE & TIME</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>STATUS</th>
              <th style={{ padding: '16px 24px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center' }}>Loading appointments...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No appointments scheduled.</td></tr>
            ) : appointments.map((apt, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} color="var(--color-primary)" /> {apt.Patient_Name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '24px' }}>ID: {apt.Patient_ID}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="var(--color-text-muted)" /> {apt.Appointment_Date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: 'var(--color-text-muted)' }}>
                    <Clock size={16} /> {apt.Appointment_Time}
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    background: apt.Status === 'Completed' ? 'rgba(0, 196, 159, 0.1)' : 'rgba(124, 107, 237, 0.1)',
                    color: apt.Status === 'Completed' ? 'var(--color-success)' : 'var(--color-primary)'
                  }}>
                    {apt.Status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  {apt.Status !== 'Completed' && apt.Status !== 'Cancelled' && (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="icon-btn" title="Mark Completed" onClick={() => handleUpdateStatus(apt.Appointment_ID, 'Completed')}>
                        <CheckCircle size={18} color="var(--color-success)" />
                      </button>
                      <button className="icon-btn" title="Cancel" onClick={() => handleUpdateStatus(apt.Appointment_ID, 'Cancelled')}>
                        <XCircle size={18} color="var(--color-error)" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
