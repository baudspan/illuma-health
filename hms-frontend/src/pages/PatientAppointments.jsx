import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';

export default function PatientAppointments() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    Patient_ID: 1, // Mocked to the logged in patient
    Doctor_ID: '',
    Department_ID: 1, // Defaulting to 1 for simplicity in prototype
    Appointment_Date: '',
    Appointment_Time: ''
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/doctors')
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Appointment Scheduled Successfully!");
        setFormData({ ...formData, Doctor_ID: '', Appointment_Date: '', Appointment_Time: '' });
      } else {
        alert("Failed to schedule.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Book Appointment</h1>
        <p className="label">Schedule a consultation with our medical specialists.</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px' }}>
        {loading ? (
          <p>Loading doctors...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label">Select Doctor & Department</label>
              <select 
                className="input-field" 
                value={formData.Doctor_ID} 
                onChange={e => setFormData({...formData, Doctor_ID: parseInt(e.target.value)})}
                required
              >
                <option value="">-- Choose Specialist --</option>
                {doctors.map(d => (
                  <option key={d.Doctor_ID} value={d.Doctor_ID}>
                    {d.Name} ({d.Department}) - Fee: ${d.Fee}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="label">Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.Appointment_Date} 
                  onChange={e => setFormData({...formData, Appointment_Date: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="label">Time slot</label>
                <select 
                  className="input-field" 
                  value={formData.Appointment_Time} 
                  onChange={e => setFormData({...formData, Appointment_Time: e.target.value})}
                  required
                >
                  <option value="">-- Time --</option>
                  <option value="09:00:00">09:00 AM</option>
                  <option value="11:30:00">11:30 AM</option>
                  <option value="14:00:00">02:00 PM</option>
                  <option value="16:30:00">04:30 PM</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }} disabled={submitting}>
              {submitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
