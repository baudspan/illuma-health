import React, { useState } from 'react';
import { X, User, Phone, MapPin, Calendar, HeartPulse } from 'lucide-react';

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }) {
  const [formData, setFormData] = useState({
    Name: '',
    DOB: '',
    Gender: 'M',
    Contact: '',
    Emergency_Contact: '',
    Address: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        onPatientAdded();
        onClose();
      } else {
        const error = await response.json();
        alert('Failed to add patient: ' + error.detail);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="var(--color-text-muted)" />
        </button>
        
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={24} color="var(--color-primary)" /> Register New Patient
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Full Name</label>
            <input required type="text" name="Name" value={formData.Name} onChange={handleChange} className="input-field" placeholder="John Doe" />
          </div>
          
          <div>
            <label className="label">Date of Birth</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input required type="date" name="DOB" value={formData.DOB} onChange={handleChange} className="input-field" style={{ paddingLeft: '44px' }} />
            </div>
          </div>
          
          <div>
            <label className="label">Gender</label>
            <select name="Gender" value={formData.Gender} onChange={handleChange} className="input-field">
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
          
          <div>
            <label className="label">Primary Contact</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input required type="tel" name="Contact" value={formData.Contact} onChange={handleChange} className="input-field" style={{ paddingLeft: '44px' }} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          
          <div>
            <label className="label">Emergency Contact</label>
            <div style={{ position: 'relative' }}>
              <HeartPulse size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input required type="tel" name="Emergency_Contact" value={formData.Emergency_Contact} onChange={handleChange} className="input-field" style={{ paddingLeft: '44px' }} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Residential Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--color-text-muted)' }} />
              <textarea required name="Address" value={formData.Address} onChange={handleChange} className="input-field" style={{ paddingLeft: '44px', minHeight: '80px', resize: 'vertical' }} placeholder="Full street address..." />
            </div>
          </div>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
